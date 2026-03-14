import { useEffect } from 'react'
import { formatINR, formatDate } from '../../utils/formatters'
import LoadingSpinner from '../common/LoadingSpinner'

const statusColors = {
  draft: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-500',
}

export default function BomVersionHistory({ productId, versions, loading, onFetch, onSelectVersion }) {
  useEffect(() => {
    if (productId) onFetch(productId)
  }, [productId, onFetch])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (!versions || versions.length === 0) {
    return <div className="py-8 text-center text-sm text-slate-400">No versions found</div>
  }

  return (
    <div className="space-y-2">
      {versions.map((v) => (
        <button
          key={v.bomId}
          onClick={() => onSelectVersion(v.bomId)}
          className="w-full text-left bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">Version {v.version}</span>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[v.status] || ''}`}>
                {v.status}
              </span>
            </div>
            <span className="text-sm font-medium text-slate-700">{formatINR(v.totalCost)}</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Created {formatDate(v.createdAt)}
            {v.activatedAt && ` · Activated ${formatDate(v.activatedAt)}`}
            {v.archivedAt && ` · Archived ${formatDate(v.archivedAt)}`}
          </div>
        </button>
      ))}
    </div>
  )
}
