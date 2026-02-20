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
} from 'lucide-react'

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'manager', 'staff'] },
  { path: '/pos', icon: FilePlus, label: 'POS', roles: ['admin', 'manager', 'staff'] },
  { path: '/invoice/history', icon: FilePlus, label: 'Invoice History', roles: ['admin', 'manager', 'staff'] },
  { path: '/sales-images', icon: Image, label: 'Sales Images', roles: ['admin', 'manager', 'staff'] },
  { path: '/stock', icon: Package, label: 'Stock & Products', roles: ['admin', 'manager'] },
  { path: '/customers', icon: Users, label: 'Customers', roles: ['admin', 'manager'] },
  { path: '/credit', icon: CreditCard, label: 'Credit Management', roles: ['admin', 'manager'] },
  { path: '/reports', icon: BarChart3, label: 'Reports', roles: ['admin', 'manager'] },
  { path: '/settings', icon: Settings, label: 'Settings', roles: ['admin'] },
]

export default function Sidebar() {
  const { user } = useAuth()

  const filteredItems = menuItems.filter((item) =>
    user?.role && item.roles.includes(user.role)
  )

  return (
    <aside
      className="bg-dark text-white"
      style={{ width: 'var(--sidebar-width)', minHeight: '100vh' }}
    >
      <div className="p-4 border-bottom border-secondary">
        <h5 className="mb-0 fw-bold">AIMA Showroom</h5>
        <small className="text-secondary">Bike Sales POS</small>
      </div>
      <nav className="p-2">
        {filteredItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `d-flex align-items-center gap-2 px-3 py-2 rounded text-white text-decoration-none mb-1 ${
                isActive ? 'bg-primary' : 'hover-bg-secondary'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
