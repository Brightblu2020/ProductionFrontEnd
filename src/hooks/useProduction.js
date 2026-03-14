import { useState, useCallback } from 'react'
import api from '../services/api'

export function useProduction() {
  const [plans, setPlans] = useState([])
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/production/plans')
      setPlans(data.plans)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load plans')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPlan = useCallback(async (planId, params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/production/plans/${planId}`, { params })
      setPlan(data)
      return data
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load plan')
    } finally {
      setLoading(false)
    }
  }, [])

  const createPlan = useCallback(async (name, targets) => {
    const { data } = await api.post('/production/plans', { name, targets })
    return data
  }, [])

  const updateTargets = useCallback(async (planId, targets) => {
    const { data } = await api.put(`/production/plans/${planId}/targets`, { targets })
    return data
  }, [])

  const computePlan = useCallback(async (planId) => {
    setLoading(true)
    try {
      const { data } = await api.post(`/production/plans/${planId}/compute`)
      setPlan(data)
      return data
    } catch (err) {
      setError(err.response?.data?.error || 'Computation failed')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateOrderStatus = useCallback(async (planId, sku, orderStatus) => {
    const { data } = await api.patch(
      `/production/plans/${planId}/items/${encodeURIComponent(sku)}/status`,
      { orderStatus }
    )
    return data
  }, [])

  const updatePlanStatus = useCallback(async (planId, status) => {
    const { data } = await api.patch(`/production/plans/${planId}/status`, { status })
    return data
  }, [])

  const deletePlan = useCallback(async (planId) => {
    await api.delete(`/production/plans/${planId}`)
    setPlans((prev) => prev.filter((p) => p.planId !== planId))
    setPlan((prev) => (prev?.planId === planId ? null : prev))
  }, [])

  const exportPlan = useCallback(async (planId) => {
    const { data } = await api.get(`/production/plans/${planId}/export`)
    return data
  }, [])

  return {
    plans,
    plan,
    loading,
    error,
    fetchPlans,
    fetchPlan,
    createPlan,
    updateTargets,
    computePlan,
    updateOrderStatus,
    updatePlanStatus,
    deletePlan,
    exportPlan,
    setPlan,
  }
}
