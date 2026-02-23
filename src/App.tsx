import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Login from '@/pages/auth/Login'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Dashboard from '@/pages/Dashboard'
import POS from '@/pages/POS'
import Customers from '@/pages/Customers'
import Courier from '@/pages/Courier'
import Transfer from '@/pages/Transfer'
import DealerInvoice from '@/pages/DealerInvoice'
import BikeModels from '@/pages/BikeModels'
import Reports from '@/pages/Reports'
import Settings from '@/pages/Settings'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function App() {
  const { isAuthenticated } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="pos" element={<POS />} />
        <Route path="customers" element={<Customers />} />
        <Route path="courier" element={<Courier />} />
        <Route path="transfer" element={<Transfer />} />
        <Route path="dealer-invoice" element={<DealerInvoice />} />
        <Route path="bike-models" element={<BikeModels />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
    </Routes>
  )
}

export default App
