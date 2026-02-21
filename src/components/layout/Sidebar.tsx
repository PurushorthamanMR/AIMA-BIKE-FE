import { NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  LayoutDashboard,
  FilePlus,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Image,
  Package,
  ShoppingCart,
} from 'lucide-react'

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'manager', 'staff'] },
  { path: '/pos', icon: ShoppingCart, label: 'POS', roles: ['admin', 'manager', 'staff'] },
  { path: '/invoice/history', icon: FilePlus, label: 'Invoice History', roles: ['admin', 'manager', 'staff'] },
  { path: '/sales-images', icon: Image, label: 'Sales Images', roles: ['admin', 'manager', 'staff'] },
  { path: '/stock', icon: Package, label: 'Stock & Products', roles: ['admin', 'manager'] },
  { path: '/customers', icon: Users, label: 'Customers', roles: ['admin', 'manager'] },
  { path: '/credit', icon: CreditCard, label: 'Credit Management', roles: ['admin', 'manager'] },
  { path: '/reports', icon: BarChart3, label: 'Reports', roles: ['admin', 'manager'] },
  { path: '/settings', icon: Settings, label: 'Settings', roles: ['admin'] },
]

interface SidebarProps {
  collapsed: boolean
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const { user } = useAuth()

  const filteredItems = menuItems.filter((item) =>
    user?.role && item.roles.includes(user.role)
  )

  const width = collapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)'

  return (
    <aside
      className="bg-dark text-white d-flex flex-column"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width,
        height: '100vh',
        zIndex: 1030,
        transition: 'width 0.2s ease',
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
    >
      <div className={`border-bottom border-secondary d-flex align-items-center ${collapsed ? 'flex-column px-2 py-3' : 'p-4'}`}>
        {collapsed ? (
          <span className="fw-bold text-white" style={{ fontSize: '1rem' }} title="AIMA Showroom">AIMA</span>
        ) : (
          <div>
            <h5 className="mb-0 fw-bold">AIMA Showroom</h5>
            <small className="text-secondary">Bike Sales POS</small>
          </div>
        )}
      </div>
      <nav className="p-2 flex-grow-1">
        {filteredItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `d-flex align-items-center rounded text-white text-decoration-none mb-1 ${
                collapsed ? 'justify-content-center px-2 py-2' : 'gap-2 px-3 py-2'
              } ${isActive ? 'bg-primary' : 'hover-bg-secondary'}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={20} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
