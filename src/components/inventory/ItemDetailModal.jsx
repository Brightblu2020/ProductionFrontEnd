import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { formatINR, formatNumber, formatDate } from '../../utils/formatters'
import Badge from '../common/Badge'

const categories = ['PCB', 'Electrical', 'Mechanical', 'Connector', 'Fastener', 'Wire', 'Label', 'Service', 'Enclosure', 'Other']

export default function ItemDetailModal({ item, onClose, onSave }) {
  const { role } = useAuth()
  const canEdit = role === 'admin' || role === 'manager'

  const [form, setForm] = useState({
    reorderLevel: 0,
    reorderQty: 0,
    category: '',
    preferredVendor: '',
  })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (item) {
      setForm({
        reorderLevel: item.reorderLevel || 0,
        reorderQty: item.reorderQty || 0,
        category: item.category || 'Other',
        preferredVendor: item.preferredVendor || '',
      })
    }
  }, [item])

  if (!item) return null

  const handleSave = async () => {
    setSaving(true)
    setToast(null)
    try {
      await onSave(item.sku, form)
      setToast({ type: 'success', message: 'Item updated successfully' })
      setTimeout(() => onClose(), 1000)
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.error || 'Failed to save changes',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{item.itemName}</h2>
            <span className="font-mono text-sm text-slate-500">{item.sku}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {toast && (
            <div className={`text-sm px-4 py-3 rounded-lg ${
              toast.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {toast.message}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <ReadOnlyField label="Unit" value={item.unit || '—'} />
            <ReadOnlyField label="Purchase Price" value={formatINR(item.purchasePrice)} />
            <ReadOnlyField label="Stock On Hand" value={formatNumber(item.stockOnHand)} />
            <ReadOnlyField label="Last Synced" value={formatDate(item.lastSyncedAt)} />
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-sm font-medium text-slate-700 mb-3">
              {canEdit ? 'Editable Fields' : 'Details'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                {canEdit ? (
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                ) : (
                  <Badge>{item.category}</Badge>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Preferred Vendor</label>
                {canEdit ? (
                  <input
                    type="text"
                    value={form.preferredVendor}
                    onChange={(e) => setForm({ ...form, preferredVendor: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="text-sm text-slate-700">{item.preferredVendor || '—'}</div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Reorder Level</label>
                {canEdit ? (
                  <input
                    type="number"
                    min="0"
                    value={form.reorderLevel}
                    onChange={(e) => setForm({ ...form, reorderLevel: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="text-sm text-slate-700">{formatNumber(item.reorderLevel)}</div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Reorder Qty</label>
                {canEdit ? (
                  <input
                    type="number"
                    min="0"
                    value={form.reorderQty}
                    onChange={(e) => setForm({ ...form, reorderQty: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="text-sm text-slate-700">{formatNumber(item.reorderQty)}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex justify-end gap-3 p-5 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-500 mb-0.5">{label}</div>
      <div className="text-sm text-slate-900">{value}</div>
    </div>
  )
}
