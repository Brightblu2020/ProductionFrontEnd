import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { formatINR } from '../../utils/formatters'
import BomLineItems from './BomLineItems'
import BomExplosion from './BomExplosion'
import BomVersionHistory from './BomVersionHistory'
import BomEditor from './BomEditor'
import LoadingSpinner from '../common/LoadingSpinner'

const statusColors = {
  draft: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-500',
}

const tabs = ['Line Items', 'Explosion', 'Version History']

export default function BomViewer({
  product,
  bom,
  explosion,
  versions,
  loading,
  products,
  onSubAssemblyClick,
  onFetchExplosion,
  onFetchVersions,
  onSelectVersion,
  onCreateBom,
  onUpdateBom,
  onActivateBom,
}) {
  const { role } = useAuth()
  const canEdit = role === 'admin' || role === 'manager'
  const canActivate = role === 'admin'

  const [activeTab, setActiveTab] = useState('Line Items')
  const [showEditor, setShowEditor] = useState(false)
  const [editorMode, setEditorMode] = useState(null) // 'create' | 'edit'
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  if (!product) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
        Select a product to view its BOM
      </div>
    )
  }

  if (loading && !bom) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  const handleCreate = () => {
    setEditorMode('create')
    setShowEditor(true)
  }

  const handleEdit = () => {
    setEditorMode('edit')
    setShowEditor(true)
  }

  const handleSave = async (lineItems) => {
    setSaving(true)
    setToast(null)
    try {
      if (editorMode === 'create') {
        await onCreateBom(product.sku, lineItems)
        setToast({ type: 'success', message: 'Draft BOM created' })
      } else {
        await onUpdateBom(bom.bomId, lineItems)
        setToast({ type: 'success', message: 'Draft BOM updated' })
      }
      setShowEditor(false)
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.error || 'Save failed' })
    } finally {
      setSaving(false)
    }
  }

  const handleActivate = async () => {
    if (!bom) return
    setSaving(true)
    setToast(null)
    try {
      await onActivateBom(bom.bomId)
      setToast({ type: 'success', message: 'BOM activated' })
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.error || 'Activation failed' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{product.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs text-slate-500">{product.sku}</span>
              {bom && (
                <>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500">v{bom.version}</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[bom.status] || ''}`}>
                    {bom.status}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-medium text-slate-700">{formatINR(bom.totalCost)}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {canEdit && (
              <button
                onClick={handleCreate}
                className="px-3 py-1.5 text-xs bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800"
              >
                New Draft
              </button>
            )}
            {canEdit && bom?.status === 'draft' && (
              <button
                onClick={handleEdit}
                className="px-3 py-1.5 text-xs border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
              >
                Edit
              </button>
            )}
            {canActivate && bom?.status === 'draft' && (
              <button
                onClick={handleActivate}
                disabled={saving}
                className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                Activate
              </button>
            )}
          </div>
        </div>

        {toast && (
          <div className={`mt-3 text-sm px-3 py-2 rounded-lg ${
            toast.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {toast.message}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 px-4">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'Line Items' && bom && (
          <BomLineItems lineItems={bom.lineItems} onSubAssemblyClick={onSubAssemblyClick} />
        )}
        {activeTab === 'Explosion' && bom && (
          <BomExplosion
            bomId={bom.bomId}
            explosion={explosion}
            loading={loading}
            onFetch={onFetchExplosion}
          />
        )}
        {activeTab === 'Version History' && (
          <BomVersionHistory
            productId={product.sku}
            versions={versions}
            loading={loading}
            onFetch={onFetchVersions}
            onSelectVersion={onSelectVersion}
          />
        )}
        {!bom && activeTab === 'Line Items' && (
          <div className="py-8 text-center text-sm text-slate-400">
            No active BOM for this product
          </div>
        )}
      </div>

      {showEditor && (
        <BomEditor
          bom={editorMode === 'edit' ? bom : null}
          products={products}
          onSave={handleSave}
          onClose={() => setShowEditor(false)}
          saving={saving}
        />
      )}
    </div>
  )
}
