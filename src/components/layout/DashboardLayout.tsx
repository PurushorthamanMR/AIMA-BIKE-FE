import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function DashboardLayout() {
  const sidebarWidth = 'var(--sidebar-width)'

  return (
    <div className="d-flex min-vh-100">
      <Sidebar collapsed={false} />
      <div
        className="flex-grow-1 d-flex flex-column"
        style={{ marginLeft: sidebarWidth, transition: 'margin-left 0.2s ease' }}
      >
        <Header />
        <main className="flex-grow-1 p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
