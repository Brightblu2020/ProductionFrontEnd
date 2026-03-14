import { useAuth } from '../../hooks/useAuth'

const categories = ['All', 'PCB', 'Electrical', 'Mechanical', 'Connector', 'Fastener', 'Wire', 'Label', 'Service', 'Enclosure', 'Other']
const stockStatuses = [
  { value: 'all', label: 'All Stock' },
  { value: 'low', label: 'Low Stock' },
  { value: 'out', label: 'Out of Stock' },
  { value: 'negative', label: 'Negative Stock' },
]

export default function InventoryFilters({ filters, onChange, onImportClick }) {
  const { role } = useAuth()

  const update = (key, value) => {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="text"
        placeholder="Search SKU or name..."
        value={filters.search || ''}
        onChange={(e) => update('search', e.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <select
        value={filters.category || 'All'}
        onChange={(e) => update('category', e.target.value === 'All' ? '' : e.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={filters.stockStatus || 'all'}
        onChange={(e) => update('stockStatus', e.target.value === 'all' ? '' : e.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {stockStatuses.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <div className="flex-1" />

      {role === 'admin' && (
        <button
          onClick={onImportClick}
          className="bg-slate-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-800"
        >
          Import CSV
        </button>
      )}
    </div>
  )
}
