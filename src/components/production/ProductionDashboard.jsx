import { useState, useEffect, useCallback } from 'react'
import { useProduction } from '../../hooks/useProduction'
import PlanList from './PlanList'
import PlanCreator from './PlanCreator'
import PlanViewer from './PlanViewer'

export default function ProductionDashboard() {
  const {
    plans,
    plan,
    loading,
    fetchPlans,
    fetchPlan,
    createPlan,
    updateTargets,
    computePlan,
    updateOrderStatus,
    updatePlanStatus,
    deletePlan,
    exportPlan,
  } = useProduction()

  const [showCreator, setShowCreator] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const handleSelectPlan = useCallback(
    (planId, params) => {
      setSelectedPlanId(planId)
      fetchPlan(planId, params)
    },
    [fetchPlan]
  )

  const handleCreatePlan = useCallback(
    async (name, targets) => {
      setSaving(true)
      try {
        const created = await createPlan(name, targets)
        setShowCreator(false)
        fetchPlans()
        handleSelectPlan(created.planId)
      } finally {
        setSaving(false)
      }
    },
    [createPlan, fetchPlans, handleSelectPlan]
  )

  const handleDeletePlan = useCallback(
    async (planId) => {
      await deletePlan(planId)
      setSelectedPlanId(null)
    },
    [deletePlan]
  )

  const handleRefresh = useCallback(
    (planId, params) => {
      fetchPlan(planId, params)
      fetchPlans()
    },
    [fetchPlan, fetchPlans]
  )

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Production Planning</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Left: plan list */}
        <div>
          <PlanList
            plans={plans}
            loading={loading && !plan}
            selectedPlanId={selectedPlanId}
            onSelect={handleSelectPlan}
            onCreateClick={() => setShowCreator(true)}
          />
        </div>

        {/* Right: plan detail */}
        <div>
          <PlanViewer
            plan={plan}
            loading={loading}
            onCompute={computePlan}
            onUpdateTargets={updateTargets}
            onUpdateOrderStatus={updateOrderStatus}
            onUpdatePlanStatus={updatePlanStatus}
            onExport={exportPlan}
            onDelete={handleDeletePlan}
            onRefresh={handleRefresh}
          />
        </div>
      </div>

      {showCreator && (
        <PlanCreator
          onClose={() => setShowCreator(false)}
          onSave={handleCreatePlan}
          saving={saving}
        />
      )}
    </div>
  )
}
