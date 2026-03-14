import Badge from '../common/Badge'
import LoadingSpinner from '../common/LoadingSpinner'
import { formatINR, formatNumber } from '../../utils/formatters'

const columns = [
  { key: 'sku', label: 'SKU', sortable: true },
  { key: 'itemName', label: 'Item Name', sortable: true },
  { key: 'category', label: 'Category', sortable: false },
  { key: 'purchasePrice', label: 'Price', sortable: true },
  { key: 'stockOnHand', label: 'Stock', sortable: true },
  { key: 'preferredVendor', label: 'Vendor', sortable: false },
  { key: 'reorderLevel', label: 'Reorder', sortable: false },
]

function stockColor(stock, reorderLevel) {
  if (stock < 0) return 'text-red-600 bg-red-50'
  if (stock === 0) return 'text-orange-600 bg-orange-50'
  if (reorderLevel > 0 && stock <= reorderLevel) return 'text-yellow-700 bg-yellow-50'
  return 'text-green-700'
}

export default function InventoryTable({
  items,
  loading,
  sortBy,
  sortOrder,
  onSort,
  onRowClick,
  onLoadMore,
  hasMore,
}) {
  const handleSort = (key) => {
    if (sortBy === key) {
      onSort(key, sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      onSort(key, 'asc')
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {columns.map(({ key, label, sortable }) => (
                <th
                  key={key}
                  className={`px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide ${
                    sortable ? 'cursor-pointer select-none hover:text-slate-700' : ''
                  }`}
                  onClick={() => sortable && handleSort(key)}
                >
                  <span className="flex items-center gap-1">
                    {label}
                    {sortable && sortBy === key && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr
                key={item.sku}
                onClick={() => onRowClick(item)}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 font-mono text-xs text-blue-600 font-medium whitespace-nowrap">
                  {item.sku}
                </td>
                <td className="px-4 py-3 max-w-[200px] truncate" title={item.itemName}>
                  {item.itemName}
                </td>
                <td className="px-4 py-3">
                  <Badge>{item.category}</Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatINR(item.purchasePrice)}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${stockColor(item.stockOnHand, item.reorderLevel)}`}>
                    {formatNumber(item.stockOnHand)}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 max-w-[150px] truncate" title={item.preferredVendor || ''}>
                  {item.preferredVendor || '—'}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {item.reorderLevel > 0 ? formatNumber(item.reorderLevel) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 && !loading && (
        <div className="py-12 text-center text-slate-500">
          No items match your filters.
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-6">
          <LoadingSpinner />
        </div>
      )}

      {!loading && hasMore && items.length > 0 && (
        <div className="border-t border-slate-200 px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Showing {items.length} items
          </span>
          <button
            onClick={onLoadMore}
            className="text-sm text-blue-600 font-medium hover:text-blue-700"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  )
}
