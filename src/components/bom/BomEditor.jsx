import { useState, useEffect } from 'react'
import { formatINR } from '../../utils/formatters'

const emptyItem = { sku: '', itemName: '', quantity: 1, unitRate: 0, isSubAssembly: false, subAssemblyBomId: null, isLabor: false }

export default function BomEditor({ bom, products, onSave, onClose, saving }) {
  const [lineItems, setLineItems] = useState([{ ...emptyItem }])

  useEffect(() => {
    if (bom?.lineItems?.length) {
      setLineItems(bom.lineItems.map((li) => ({ ...li })))
    }
  }, [bom])

  const updateItem = (idx, field, value) => {
    setLineItems((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      if (field === 'quantity' || field === 'unitRate') {
        next[idx].amount = (next[idx].quantity || 0) * (next[idx].unitRate || 0)
      }
      if (field === 'isSubAssembly' && !value) {
        next[idx].subAssemblyBomId = null
      }
      if (field === 'isLabor') {
        next[idx].isSubAssembly = false
        next[idx].subAssemblyBomId = null
      }
      return next
    })
  }

  const addItem = () => setLineItems((prev) => [...prev, { ...emptyItem }])

  const removeItem = (idx) => {
    setLineItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const totalCost = lineItems.reduce((sum, i) => sum + (i.quantity || 0) * (i.unitRate || 0), 0)

  const subAssemblyProducts = products?.filter((p) => p.activeBomId) || []

  const handleSubmit = () => {
    const cleaned = lineItems
      .filter((li) => li.sku.trim())
      .map((li) => ({
        sku: li.sku.trim(),
        itemName: li.itemName.trim(),
        quantity: Number(li.quantity) || 1,
        unitRate: Number(li.unitRate) || 0,
        isSubAssembly: li.isSubAssembly || false,
        subAssemblyBomId: li.subAssemblyBomId || null,
        isLabor: li.isLabor || false,
      }))
    onSave(cleaned)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            {bom ? 'Edit Draft BOM' : 'New Draft BOM'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-2 py-2 text-left text-xs font-medium text-slate-500">SKU</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-slate-500">Item Name</th>
                  <th className="px-2 py-2 text-right text-xs font-medium text-slate-500 w-20">Qty</th>
                  <th className="px-2 py-2 text-right text-xs font-medium text-slate-500 w-28">Unit Rate</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-slate-500 w-16">Sub-Asm</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-slate-500 w-16">Labor</th>
                  <th className="px-2 py-2 text-right text-xs font-medium text-slate-500 w-28">Amount</th>
                  <th className="px-2 py-2 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lineItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        value={item.sku}
                        onChange={(e) => updateItem(idx, 'sku', e.target.value)}
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="BB-XXXXX"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) => updateItem(idx, 'itemName', e.target.value)}
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitRate}
                        onChange={(e) => updateItem(idx, 'unitRate', parseFloat(e.target.value) || 0)}
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <input
                        type="checkbox"
                        checked={item.isSubAssembly}
                        onChange={(e) => updateItem(idx, 'isSubAssembly', e.target.checked)}
                        disabled={item.isLabor}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      {item.isSubAssembly && (
                        <select
                          value={item.subAssemblyBomId || ''}
                          onChange={(e) => updateItem(idx, 'subAssemblyBomId', e.target.value || null)}
                          className="mt-1 w-full rounded border border-slate-300 px-1 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select BOM...</option>
                          {subAssemblyProducts.map((p) => (
                            <option key={p.activeBomId} value={p.activeBomId}>
                              {p.sku} — {p.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <input
                        type="checkbox"
                        checked={item.isLabor}
                        onChange={(e) => updateItem(idx, 'isLabor', e.target.checked)}
                        disabled={item.isSubAssembly}
                        className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-right text-xs font-medium text-slate-700 whitespace-nowrap">
                      {formatINR((item.quantity || 0) * (item.unitRate || 0))}
                    </td>
                    <td className="px-2 py-1.5">
                      <button
                        onClick={() => removeItem(idx)}
                        className="p-0.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={addItem}
            className="mt-3 text-sm text-blue-600 font-medium hover:text-blue-700"
          >
            + Add Line Item
          </button>

          <div className="mt-4 text-right text-sm">
            <span className="text-slate-500">Total: </span>
            <span className="font-bold text-slate-900">{formatINR(totalCost)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
        </div>
      </div>
    </div>
  )
}
