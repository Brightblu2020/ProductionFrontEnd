import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function TargetEditor({ currentTargets, onClose, onSave, saving }) {
  const [targets, setTargets] = useState([])
  const [products, setProducts] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    setTargets(currentTargets.map((t) => ({ ...t })))
  }, [currentTargets])

  useEffect(() => {
    api.get('/bom/products', { params: { type: 'finished_product' } })
      .then(({ data }) => setProducts(data.products))
      .catch(() => {})
  }, [])

  const updateTarget = (idx, field, value) => {
    setTargets((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      if (field === 'productId') {
        const product = products.find((p) => p.sku === value)
        next[idx].productName = product?.name || ''
      }
      return next
    })
  }

  const addTarget = () => setTargets((prev) => [...prev, { productId: '', productName: '', quantity: 0 }])
  const removeTarget = (idx) => setTargets((prev) => prev.filter((_, i) => i !== idx))

  const handleSubmit = async () => {
    setError(null)
    const validTargets = targets.filter((t) => t.productId && t.quantity >= 0)
    if (validTargets.length === 0) {
      setError('Add at least one product target')
      return
    }
    try {
      await onSave(validTargets)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update targets')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Edit Targets</h2>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
          )}

          <div className="bg-amber-50 text-amber-700 text-sm px-4 py-3 rounded-lg">
            Saving targets will clear computed demand. You will need to recompute.
          </div>

          <div className="space-y-2">
            {targets.map((target, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <select
                  value={target.productId}
                  onChange={(e) => updateTarget(idx, 'productId', e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select product...</option>
                  {products.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.sku} — {p.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  value={target.quantity}
                  onChange={(e) => updateTarget(idx, 'quantity', parseInt(e.target.value) || 0)}
                  className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {targets.length > 1 && (
                  <button
                    onClick={() => removeTarget(idx)}
                    className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addTarget}
            className="text-sm text-blue-600 font-medium hover:text-blue-700"
          >
            + Add Product
          </button>
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
            {saving ? 'Saving...' : 'Save Targets'}
          </button>
        </div>
      </div>
    </div>
  )
}
