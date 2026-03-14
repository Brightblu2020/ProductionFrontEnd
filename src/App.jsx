import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './components/auth/LoginPage.jsx'
import AppLayout from './components/layout/AppLayout.jsx'
import InventoryDashboard from './components/inventory/InventoryDashboard.jsx'
import BomDashboard from './components/bom/BomDashboard.jsx'
import ProductionDashboard from './components/production/ProductionDashboard.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/inventory" replace />} />
        <Route path="inventory" element={<InventoryDashboard />} />
        <Route path="bom" element={<BomDashboard />} />
        <Route path="production" element={<ProductionDashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/inventory" replace />} />
    </Routes>
  )
}

export default App
