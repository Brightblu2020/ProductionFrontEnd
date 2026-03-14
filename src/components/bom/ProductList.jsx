import { useState, useEffect, useMemo } from 'react'
import LoadingSpinner from '../common/LoadingSpinner'
import { formatINR } from '../../utils/formatters'

const typeFilters = [
  { value: '', label: 'All' },
  { value: 'finished_product', label: 'Finished Products' },
  { value: 'sub_assembly', label: 'Sub-Assemblies' },
]

const typeBadge = {
  finished_product: 'bg-green-100 text-green-700',
  sub_assembly: 'bg-blue-100 text-blue-700',
}

const typeLabel = {
  finished_product: 'Finished Product',
  sub_assembly: 'Sub-Assembly',
}

export default function ProductList({ products, loading, selectedSku, onSelect, onTypeFilter }) {
  const [typeFilter, setTypeFilter] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    onTypeFilter(typeFilter || undefined)
  }, [typeFilter, onTypeFilter])

  const filtered = useMemo(() => {
    if (!search) return products
    const q = search.toLowerCase()
    return products.filter(
      (p) => p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
    )
  }, [products, search])

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Products</h2>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="flex gap-1">
          {typeFilters.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
                typeFilter === value
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">No products found</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((product) => (
              <button
                key={product.sku}
                onClick={() => onSelect(product)}
                className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${
                  selectedSku === product.sku ? 'bg-blue-50 border-l-2 border-blue-600' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-500">{product.sku}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${typeBadge[product.type] || ''}`}>
                    {typeLabel[product.type] || product.type}
                  </span>
                </div>
                <div className="text-sm font-medium text-slate-800 mt-0.5 truncate">
                  {product.name}
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                  <span>v{product.activeBomVersion || '—'}</span>
                  <span>{formatINR(product.activeBomTotalCost)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
