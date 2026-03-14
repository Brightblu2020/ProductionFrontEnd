import { formatINR } from '../../utils/formatters'
import SubAssemblyBadge from './SubAssemblyBadge'

export default function BomLineItems({ lineItems, onSubAssemblyClick }) {
  if (!lineItems || lineItems.length === 0) {
    return <div className="py-8 text-center text-sm text-slate-400">No line items</div>
  }

  const total = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 w-10">#</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">SKU</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Item Name</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Qty</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Unit Rate</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Amount</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Type</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {lineItems.map((item, idx) => (
            <tr key={item.sku + idx} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-xs text-slate-400">{idx + 1}</td>
              <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                <span className="flex items-center gap-1.5">
                  {item.isSubAssembly ? (
                    <button
                      onClick={() => onSubAssemblyClick(item.sku)}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      {item.sku}
                    </button>
                  ) : (
                    <span className="text-slate-700">{item.sku}</span>
                  )}
                  {item.isSubAssembly && (
                    <SubAssemblyBadge onClick={() => onSubAssemblyClick(item.sku)} />
                  )}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate" title={item.itemName}>
                {item.itemName}
              </td>
              <td className="px-4 py-3 text-right text-slate-700">{item.quantity}</td>
              <td className="px-4 py-3 text-right text-slate-700 whitespace-nowrap">{formatINR(item.unitRate)}</td>
              <td className="px-4 py-3 text-right font-medium text-slate-900 whitespace-nowrap">{formatINR(item.amount)}</td>
              <td className="px-4 py-3">
                {item.isSubAssembly && (
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700">
                    Sub-Assembly
                  </span>
                )}
                {item.isLabor && (
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-orange-100 text-orange-700">
                    Labor
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-300 bg-slate-50">
            <td colSpan={5} className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">
              Total Cost
            </td>
            <td className="px-4 py-3 text-right font-bold text-slate-900 whitespace-nowrap">
              {formatINR(total)}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
