import { useState, useEffect, useCallback, useRef } from 'react'
import { useInventory } from '../../hooks/useInventory'
import SummaryCards from './SummaryCards'
import InventoryFilters from './InventoryFilters'
import InventoryTable from './InventoryTable'
import ItemDetailModal from './ItemDetailModal'
import ImportDialog from './ImportDialog'

export default function InventoryDashboard() {
  const {
    items,
    summary,
    loading,
    summaryLoading,
    hasMore,
    fetchSummary,
    fetchItems,
    updateItem,
    importItems,
  } = useInventory()

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    stockStatus: '',
  })
  const [sortBy, setSortBy] = useState('sku')
  const [sortOrder, setSortOrder] = useState('asc')
  const [selectedItem, setSelectedItem] = useState(null)
  const [showImport, setShowImport] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  const loadItems = useCallback(
    (overrides = {}, append = false) => {
      const params = {
        search: filters.search || undefined,
        category: filters.category || undefined,
        stockStatus: filters.stockStatus || undefined,
        sortBy,
        sortOrder,
        ...overrides,
      }
      // Remove undefined
      Object.keys(params).forEach((k) => params[k] === undefined && delete params[k])
      fetchItems(params, append)
    },
    [filters, sortBy, sortOrder, fetchItems]
  )

  // Debounced fetch on filter change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      loadItems()
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [loadItems])

  const handleSort = (key, order) => {
    setSortBy(key)
    setSortOrder(order)
  }

  const handleLoadMore = () => {
    if (items.length > 0) {
      loadItems({ startAfter: items[items.length - 1].sku }, true)
    }
  }

  const handleSummaryFilter = (stockStatus) => {
    setFilters((prev) => ({ ...prev, stockStatus }))
  }

  const handleSave = async (sku, updates) => {
    await updateItem(sku, updates)
    fetchSummary()
  }

  const handleImportComplete = async (parsedItems) => {
    const result = await importItems(parsedItems)
    fetchSummary()
    loadItems()
    return result
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Inventory Overview</h1>

      <SummaryCards
        summary={summary}
        loading={summaryLoading}
        onFilterClick={handleSummaryFilter}
      />

      <InventoryFilters
        filters={filters}
        onChange={setFilters}
        onImportClick={() => setShowImport(true)}
      />

      <InventoryTable
        items={items}
        loading={loading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onRowClick={setSelectedItem}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
      />

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSave={handleSave}
        />
      )}

      {showImport && (
        <ImportDialog
          onClose={() => setShowImport(false)}
          onImport={handleImportComplete}
        />
      )}
    </div>
  )
}
