import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Login from '@/pages/auth/Login'
import ResetPassword from '@/pages/auth/ResetPassword'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Dashboard from '@/pages/Dashboard'
import POS from '@/pages/POS'
import Customers from '@/pages/Customers'
import Courier from '@/pages/Courier'
import CourierDetail from '@/pages/CourierDetail'
import CourierEdit from '@/pages/CourierEdit'
import Transfer from '@/pages/Transfer'
import DealerInvoice from '@/pages/DealerInvoice'
import DealerInvoiceDetail from '@/pages/DealerInvoiceDetail'
import Stock from '@/pages/Stock'
import StockDetail from '@/pages/StockDetail'
import BikeModels from '@/pages/BikeModels'
import Category from '@/pages/Category'
import Payment from '@/pages/Payment'
import Reports from '@/pages/Reports'
import Settings from '@/pages/Settings'
import UserManagement from '@/pages/UserManagement'
import Profile from '@/pages/Profile'
import PageNotFound from '@/pages/PageNotFound'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export function AppRouter() {
  const { isAuthenticated } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : (
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          )
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="pos" element={<POS />} />
        <Route path="customers" element={<Customers />} />
        <Route path="courier" element={<Courier />} />
        <Route path="courier/:id" element={<CourierDetail />} />
        <Route path="courier/:id/edit" element={<CourierEdit />} />
        <Route path="transfer" element={<Transfer />} />
        <Route path="dealer-invoice" element={<DealerInvoice />} />
        <Route path="dealer-invoice/:id" element={<DealerInvoiceDetail />} />
        <Route path="stock" element={<Stock />} />
        <Route path="stock/:id" element={<StockDetail />} />
        <Route path="bike-models" element={<BikeModels />} />
        <Route path="category" element={<Category />} />
        <Route path="payment" element={<Payment />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}
