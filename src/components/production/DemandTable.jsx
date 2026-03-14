import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { formatINR, formatNumber } from '../../utils/formatters'
import LoadingSpinner from '../common/LoadingSpinner'

const orderStatusOptions = [
  { value: 'not_ordered', label: 'Not Ordered', color: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'ordered', label: 'Ordered', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { value: 'in_stock', label: 'In Stock', color: 'bg-green-50 text-green-700 border-green-200' },
]

const sortOptions = [
  { value: 'shortage', label: 'Shortage' },
  { value: 'totalNeeded', label: 'Total Needed' },
  { value: 'stockOnHand', label: 'Stock on Hand' },
  { value: 'sku', label: 'SKU' },
  { value: 'itemName', label: 'Item Name' },
]

export default function DemandTable({ items, loading, filters, onFilterChange, onOrderStatusChange }) {
  const { role } = useAuth()
  const canEdit = role === 'admin' || role === 'manager'
  const [expandedSku, setExpandedSku] = useState(null)

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (!items) return null

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search SKU or name..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.shortagesOnly || false}
            onChange={(e) => onFilterChange({ ...filters, shortagesOnly: e.target.checked })}
            className="rounded border-slate-300 text-red-600 focus:ring-red-500"
          />
          <span className="text-sm font-medium text-red-600">Shortages Only</span>
        </label>

        <select
          value={filters.sortBy || 'shortage'}
          onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {sortOptions.map(({ value, label }) => (
            <option key={value} value={value}>Sort: {label}</option>
          ))}
        </select>

        <button
          onClick={() => onFilterChange({
            ...filters,
            sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
          })}
          className="px-2 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-50"
        >
          {filters.sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 w-8">#</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">SKU</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">Item Name</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-slate-500">Needed</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-slate-500">Stock</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-slate-500">Shortage</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-slate-500">Unit Rate</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-slate-500">Shortage Cost</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">Order Status</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-slate-500 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-sm text-slate-400">
                    {filters.shortagesOnly
                      ? 'All components are in stock. No shortages detected.'
                      : 'No demand items found.'}
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <DemandRow
                    key={item.sku}
                    item={item}
                    idx={idx}
                    canEdit={canEdit}
                    expanded={expandedSku === item.sku}
                    onToggle={() => setExpandedSku(expandedSku === item.sku ? null : item.sku)}
                    onOrderStatusChange={onOrderStatusChange}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function DemandRow({ item, idx, canEdit, expanded, onToggle, onOrderStatusChange }) {
  const shortageCost = (item.shortage || 0) * (item.unitRate || 0)
  const hasShortage = item.shortage > 0
  const statusOption = orderStatusOptions.find((o) => o.value === item.orderStatus) || orderStatusOptions[0]

  return (
    <>
      <tr className={`hover:bg-slate-50 ${hasShortage ? 'bg-red-50/30' : ''}`}>
        <td className="px-3 py-2.5 text-xs text-slate-400">{idx + 1}</td>
        <td className="px-3 py-2.5 font-mono text-xs text-slate-700">{item.sku}</td>
        <td className="px-3 py-2.5 text-slate-700 max-w-[180px] truncate" title={item.itemName}>
          {item.itemName}
        </td>
        <td className="px-3 py-2.5 text-right font-medium text-slate-900">
          {formatNumber(item.totalNeeded)}
        </td>
        <td className="px-3 py-2.5 text-right text-slate-700">
          {formatNumber(item.stockOnHand)}
        </td>
        <td className={`px-3 py-2.5 text-right font-semibold ${hasShortage ? 'text-red-600' : 'text-green-600'}`}>
          {formatNumber(item.shortage)}
        </td>
        <td className="px-3 py-2.5 text-right text-slate-600 whitespace-nowrap">
          {formatINR(item.unitRate)}
        </td>
        <td className={`px-3 py-2.5 text-right whitespace-nowrap font-medium ${hasShortage ? 'text-red-600' : 'text-slate-500'}`}>
          {formatINR(shortageCost)}
        </td>
        <td className="px-3 py-2.5">
          {canEdit ? (
            <select
              value={item.orderStatus}
              onChange={(e) => onOrderStatusChange(item.sku, e.target.value)}
              className={`rounded-lg border px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 ${statusOption.color}`}
            >
              {orderStatusOptions.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          ) : (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${statusOption.color}`}>
              {statusOption.label}
            </span>
          )}
        </td>
        <td className="px-3 py-2.5 text-center">
          {item.contributingProducts?.length > 0 && (
            <button
              onClick={onToggle}
              className="p-0.5 rounded text-slate-400 hover:text-slate-600"
            >
              <svg
                className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
                fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}
        </td>
      </tr>
      {expanded && item.contributingProducts && (
        <tr>
          <td colSpan={10} className="px-6 py-3 bg-slate-50">
            <div className="text-xs text-slate-600 space-y-1">
              <div className="font-medium text-slate-500 mb-1">Demand Breakdown:</div>
              {item.contributingProducts.map((cp, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-medium">{cp.productName}</span>
                  <span className="text-slate-400">—</span>
                  <span>{cp.qtyPerUnit} per unit x {cp.units} units = {cp.subtotal}</span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
