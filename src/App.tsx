import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Login from '@/pages/auth/Login'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Dashboard from '@/pages/Dashboard'
import NewInvoice from '@/pages/NewInvoice'
import Customers from '@/pages/Customers'
import CreditManagement from '@/pages/CreditManagement'
import Reports from '@/pages/Reports'
import Settings from '@/pages/Settings'
import InvoiceHistory from '@/pages/InvoiceHistory'
import InvoiceView from '@/pages/InvoiceView'
import SalesImages from '@/pages/SalesImages'
import Stock from '@/pages/Stock'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="pos" element={<NewInvoice />} />
        <Route path="invoice/history" element={<InvoiceHistory />} />
        <Route path="invoice/:id" element={<InvoiceView />} />
        <Route path="sales-images" element={<SalesImages />} />
        <Route path="stock" element={<Stock />} />
        <Route path="customers" element={<Customers />} />
        <Route path="credit" element={<CreditManagement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
