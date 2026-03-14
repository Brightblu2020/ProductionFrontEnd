import { formatINR, formatNumber } from '../../utils/formatters'

export default function DemandSummary({ summary }) {
  if (!summary) return null

  const cards = [
    { label: 'Total Components', value: formatNumber(summary.totalComponents) },
    {
      label: 'Items with Shortage',
      value: formatNumber(summary.shortageCount),
      color: summary.shortageCount > 0 ? 'text-red-600' : '',
    },
    {
      label: 'Total Shortage Value',
      value: formatINR(summary.totalShortageValue),
      color: summary.totalShortageValue > 0 ? 'text-red-600' : '',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map(({ label, value, color }) => (
        <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</div>
          <div className={`mt-1 text-xl font-semibold ${color || 'text-slate-900'}`}>{value}</div>
        </div>
      ))}
    </div>
  )
}
