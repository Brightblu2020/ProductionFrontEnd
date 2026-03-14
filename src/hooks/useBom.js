import { useState, useCallback } from 'react'
import api from '../services/api'

export function useBom() {
  const [products, setProducts] = useState([])
  const [bom, setBom] = useState(null)
  const [explosion, setExplosion] = useState(null)
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchProducts = useCallback(async (type) => {
    setLoading(true)
    setError(null)
    try {
      const params = type ? { type } : {}
      const { data } = await api.get('/bom/products', { params })
      setProducts(data.products)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchBom = useCallback(async (bomId, expand = false) => {
    setLoading(true)
    setError(null)
    try {
      const params = expand ? { expand: true } : {}
      const { data } = await api.get(`/bom/${bomId}`, { params })
      setBom(data)
      return data
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load BOM')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchExplosion = useCallback(async (bomId) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/bom/${bomId}/explosion`)
      setExplosion(data)
      return data
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load explosion')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchVersions = useCallback(async (productId) => {
    setError(null)
    try {
      const { data } = await api.get(`/bom/products/${encodeURIComponent(productId)}/versions`)
      setVersions(data.versions)
      return data.versions
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load versions')
    }
  }, [])

  const createBom = useCallback(async (productId, lineItems) => {
    const { data } = await api.post('/bom', { productId, lineItems })
    return data
  }, [])

  const updateBom = useCallback(async (bomId, lineItems) => {
    const { data } = await api.put(`/bom/${bomId}`, { lineItems })
    return data
  }, [])

  const activateBom = useCallback(async (bomId) => {
    const { data } = await api.patch(`/bom/${bomId}/activate`)
    return data
  }, [])

  return {
    products,
    bom,
    explosion,
    versions,
    loading,
    error,
    fetchProducts,
    fetchBom,
    fetchExplosion,
    fetchVersions,
    createBom,
    updateBom,
    activateBom,
    setBom,
  }
}
