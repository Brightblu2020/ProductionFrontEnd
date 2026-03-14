import { formatINR, formatNumber } from '../../utils/formatters'
import LoadingSpinner from '../common/LoadingSpinner'

const cards = [
  { key: 'totalItems', label: 'Total Items', format: formatNumber },
  { key: 'totalStockValue', label: 'Total Stock Value', format: formatINR },
  { key: 'outOfStock', label: 'Out of Stock', format: formatNumber, color: 'red', filter: 'out' },
  { key: 'lowStock', label: 'Low Stock', format: formatNumber, color: 'orange', filter: 'low' },
  { key: 'negativeStock', label: 'Negative Stock', format: formatNumber, color: 'red', filter: 'negative' },
  { key: 'noVendorAssigned', label: 'No Vendor', format: formatNumber },
]

const colorStyles = {
  red: 'text-red-600',
  orange: 'text-orange-500',
}

export default function SummaryCards({ summary, loading, onFilterClick }) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (!summary) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map(({ key, label, format, color, filter }) => {
        const value = summary[key]
        const hasWarning = color && value > 0
        return (
          <button
            key={key}
            onClick={() => filter && onFilterClick(filter)}
            className={`bg-white rounded-xl border border-slate-200 p-4 text-left hover:shadow-md transition-shadow ${
              filter ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {label}
            </div>
            <div
              className={`mt-1 text-xl font-semibold ${
                hasWarning ? colorStyles[color] : 'text-slate-900'
              }`}
            >
              {format(value)}
            </div>
          </button>
        )
      })}
    </div>
  )
}
