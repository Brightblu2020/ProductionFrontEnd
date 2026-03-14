import { useState, useCallback } from 'react'
import api from '../services/api'

export function useInventory() {
  const [items, setItems] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true)
    try {
      const { data } = await api.get('/inventory/summary')
      setSummary(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load summary')
    } finally {
      setSummaryLoading(false)
    }
  }, [])

  const fetchItems = useCallback(async (params = {}, append = false) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/inventory', { params })
      if (append) {
        setItems((prev) => [...prev, ...data.items])
      } else {
        setItems(data.items)
      }
      setHasMore(data.items.length === (params.limit || 50))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchItem = useCallback(async (sku) => {
    const { data } = await api.get(`/inventory/${encodeURIComponent(sku)}`)
    return data
  }, [])

  const updateItem = useCallback(async (sku, updates) => {
    const { data } = await api.patch(`/inventory/${encodeURIComponent(sku)}`, updates)
    setItems((prev) => prev.map((item) => (item.sku === sku ? data : item)))
    return data
  }, [])

  const importItems = useCallback(async (itemsData) => {
    const { data } = await api.post('/inventory/import', { items: itemsData })
    return data
  }, [])

  return {
    items,
    summary,
    loading,
    summaryLoading,
    error,
    hasMore,
    fetchSummary,
    fetchItems,
    fetchItem,
    updateItem,
    importItems,
  }
}
