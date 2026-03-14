import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { formatDate } from '../../utils/formatters'
import DemandSummary from './DemandSummary'
import DemandTable from './DemandTable'
import TargetEditor from './TargetEditor'
import ExportButton from './ExportButton'
import LoadingSpinner from '../common/LoadingSpinner'

const statusColors = {
  draft: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-500',
}

export default function PlanViewer({
  plan,
  loading,
  onCompute,
  onUpdateTargets,
  onUpdateOrderStatus,
  onUpdatePlanStatus,
  onExport,
  onDelete,
  onRefresh,
}) {
  const { role } = useAuth()
  const canEdit = role === 'admin' || role === 'manager'
  const canAdmin = role === 'admin'
  const isCompleted = plan?.status === 'completed'

  const [showTargetEditor, setShowTargetEditor] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    shortagesOnly: false,
    sortBy: 'shortage',
    sortOrder: 'desc',
  })

  if (!plan && !loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-slate-400">
        Select a plan to view details
      </div>
    )
  }

  if (loading && !plan) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (!plan) return null

  const handleCompute = async () => {
    setSaving(true)
    setToast(null)
    try {
      await onCompute(plan.planId)
      setToast({ type: 'success', message: 'Demand computed successfully' })
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.error || 'Computation failed' })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveTargets = async (targets) => {
    setSaving(true)
    try {
      await onUpdateTargets(plan.planId, targets)
      setShowTargetEditor(false)
      setToast({ type: 'success', message: 'Targets updated. Recompute to recalculate demand.' })
      onRefresh(plan.planId)
    } catch (err) {
      throw err
    } finally {
      setSaving(false)
    }
  }

  const handleOrderStatusChange = async (sku, orderStatus) => {
    try {
      await onUpdateOrderStatus(plan.planId, sku, orderStatus)
      onRefresh(plan.planId, filters)
    } catch {
      setToast({ type: 'error', message: 'Failed to update order status' })
    }
  }

  const handlePlanStatus = async (status) => {
    setSaving(true)
    setToast(null)
    try {
      await onUpdatePlanStatus(plan.planId, status)
      onRefresh(plan.planId)
      setToast({ type: 'success', message: `Plan ${status}` })
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.error || 'Failed to update status' })
    } finally {
      setSaving(false)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    onRefresh(plan.planId, {
      search: newFilters.search || undefined,
      shortagesOnly: newFilters.shortagesOnly ? 'true' : undefined,
      sortBy: newFilters.sortBy,
      sortOrder: newFilters.sortOrder,
    })
  }

  const totalUnits = plan.targets?.reduce((sum, t) => sum + t.quantity, 0) || 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{plan.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[plan.status] || ''}`}>
              {plan.status}
            </span>
            {plan.computedAt && (
              <span className="text-xs text-slate-500">
                Computed {formatDate(plan.computedAt)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && !isCompleted && plan.targets?.length > 0 && (
            <button
              onClick={handleCompute}
              disabled={saving}
              className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Computing...' : 'Compute'}
            </button>
          )}
          {canAdmin && plan.status === 'draft' && (
            <button
              onClick={() => handlePlanStatus('active')}
              disabled={saving}
              className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
            >
              Activate
            </button>
          )}
          {canAdmin && plan.status === 'active' && (
            <button
              onClick={() => handlePlanStatus('completed')}
              disabled={saving}
              className="px-3 py-1.5 text-xs bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 disabled:opacity-50"
            >
              Complete
            </button>
          )}
          {plan.demandItems && (
            <ExportButton onExport={() => onExport(plan.planId)} planName={plan.name} />
          )}
          {canAdmin && (
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={saving}
              className="px-3 py-1.5 text-xs border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {toast && (
        <div className={`text-sm px-4 py-3 rounded-lg ${
          toast.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Targets */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700">
            Targets ({plan.targets?.length || 0} products, {totalUnits} units)
          </h3>
          {canEdit && !isCompleted && (
            <button
              onClick={() => setShowTargetEditor(true)}
              className="text-xs text-blue-600 font-medium hover:text-blue-700"
            >
              Edit Targets
            </button>
          )}
        </div>
        {plan.targets?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Product</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">SKU</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plan.targets.map((t) => (
                  <tr key={t.productId}>
                    <td className="px-3 py-2 text-slate-700">{t.productName}</td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-500">{t.productId}</td>
                    <td className="px-3 py-2 text-right font-medium text-slate-900">{t.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-slate-400">No targets set</div>
        )}
      </div>

      {/* Demand */}
      {plan.demandItems ? (
        <>
          <DemandSummary summary={plan.demandSummary} />
          <DemandTable
            items={plan.demandItems}
            loading={loading}
            filters={filters}
            onFilterChange={handleFilterChange}
            onOrderStatusChange={handleOrderStatusChange}
          />
        </>
      ) : plan.targets?.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-400">
          Set your targets and click Compute to calculate demand.
        </div>
      ) : null}

      {showTargetEditor && (
        <TargetEditor
          currentTargets={plan.targets || []}
          onClose={() => setShowTargetEditor(false)}
          onSave={handleSaveTargets}
          saving={saving}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setConfirmDelete(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900">Delete Plan</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete <span className="font-medium">"{plan.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setSaving(true)
                  try {
                    await onDelete(plan.planId)
                    setConfirmDelete(false)
                  } catch (err) {
                    setToast({ type: 'error', message: err.response?.data?.error || 'Failed to delete plan' })
                    setConfirmDelete(false)
                  } finally {
                    setSaving(false)
                  }
                }}
                disabled={saving}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
