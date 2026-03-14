import { useEffect } from 'react'
import { formatINR, formatNumber } from '../../utils/formatters'
import LoadingSpinner from '../common/LoadingSpinner'

export default function BomExplosion({ bomId, explosion, loading, onFetch }) {
  useEffect(() => {
    if (bomId) onFetch(bomId)
  }, [bomId, onFetch])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (!explosion) return null

  return (
    <div className="space-y-6">
      <div className="flex gap-4 text-sm">
        <div className="bg-slate-50 rounded-lg px-4 py-2">
          <span className="text-slate-500">Components: </span>
          <span className="font-semibold text-slate-900">{explosion.totalComponents}</span>
        </div>
        <div className="bg-slate-50 rounded-lg px-4 py-2">
          <span className="text-slate-500">Labor Items: </span>
          <span className="font-semibold text-slate-900">{explosion.totalLaborItems}</span>
        </div>
      </div>

      {explosion.materials?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Materials</h3>
          <ExplosionTable items={explosion.materials} />
        </div>
      )}

      {explosion.labor?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Labor</h3>
          <ExplosionTable items={explosion.labor} />
        </div>
      )}
    </div>
  )
}

function ExplosionTable({ items }) {
  const total = items.reduce((sum, i) => sum + i.totalQuantity * i.unitRate, 0)

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-lg">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">SKU</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Item Name</th>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Total Qty</th>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Unit Rate</th>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500">Total Cost</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item, idx) => (
            <tr key={item.sku + idx} className="hover:bg-slate-50">
              <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{item.sku}</td>
              <td className="px-4 py-2.5 text-slate-700 max-w-[200px] truncate" title={item.itemName}>
                {item.itemName}
              </td>
              <td className="px-4 py-2.5 text-right text-slate-700">{formatNumber(item.totalQuantity)}</td>
              <td className="px-4 py-2.5 text-right text-slate-700 whitespace-nowrap">{formatINR(item.unitRate)}</td>
              <td className="px-4 py-2.5 text-right font-medium text-slate-900 whitespace-nowrap">
                {formatINR(item.totalQuantity * item.unitRate)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-300 bg-slate-50">
            <td colSpan={4} className="px-4 py-2.5 text-right text-sm font-semibold text-slate-700">
              Total
            </td>
            <td className="px-4 py-2.5 text-right font-bold text-slate-900 whitespace-nowrap">
              {formatINR(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
