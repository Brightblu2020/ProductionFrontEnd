import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from '../common/LoadingSpinner'

const statusColors = {
  draft: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-500',
}

export default function PlanList({ plans, loading, selectedPlanId, onSelect, onCreateClick }) {
  const { role } = useAuth()
  const canCreate = role === 'admin' || role === 'manager'

  if (loading && plans.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Plans</h2>
        {canCreate && (
          <button
            onClick={onCreateClick}
            className="px-3 py-1.5 text-xs bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800"
          >
            New Plan
          </button>
        )}
      </div>

      {plans.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-400">
          No production plans yet. Create one to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {plans.map((p) => (
            <button
              key={p.planId}
              onClick={() => onSelect(p.planId)}
              className={`w-full text-left bg-white border rounded-xl p-4 hover:shadow-sm transition-all ${
                selectedPlanId === p.planId
                  ? 'border-blue-400 ring-1 ring-blue-200'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">{p.name}</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[p.status] || ''}`}>
                  {p.status}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                <span>{p.targetCount} products</span>
                <span className="text-slate-300">·</span>
                <span>{p.totalUnits} units</span>
                {p.isComputed && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span>{p.demandItemCount} components</span>
                  </>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
