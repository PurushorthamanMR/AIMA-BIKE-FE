import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  ShoppingCart,
  Truck,
  ArrowRightLeft,
  FileText,
  Bike,
  CreditCard,
  Layers,
  Package,
} from 'lucide-react'

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'manager', 'staff'] },
  { path: '/pos', icon: ShoppingCart, label: 'POS', roles: ['admin', 'manager', 'staff'] },
  { path: '/category', icon: Layers, label: 'Category', roles: ['admin', 'manager', 'staff'] },
  { path: '/bike-models', icon: Bike, label: 'Bike Models', roles: ['admin', 'manager', 'staff'] },
  { path: '/stock', icon: Package, label: 'Stock', roles: ['admin', 'manager', 'staff'] },
  { path: '/customers', icon: Users, label: 'Customers', roles: ['admin', 'manager'] },
  { path: '/payment', icon: CreditCard, label: 'Payment', roles: ['admin', 'manager', 'staff'] },
  { path: '/courier', icon: Truck, label: 'Courier', roles: ['admin', 'manager', 'staff'] },
  { path: '/transfer', icon: ArrowRightLeft, label: 'Transfer', roles: ['admin', 'manager', 'staff'] },
  { path: '/dealer-invoice', icon: FileText, label: 'Dealer Invoice', roles: ['admin', 'manager', 'staff'] },
  { path: '/reports', icon: BarChart3, label: 'Reports', roles: ['admin', 'manager'] },
  { path: '/settings', icon: Settings, label: 'Settings', roles: ['admin'] },
]

interface SidebarProps {
  collapsed: boolean
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const { user } = useAuth()
  const [logoError, setLogoError] = useState(false)

  const userRole = user?.role?.toLowerCase()
  const filteredItems = menuItems.filter((item) =>
    !userRole || item.roles.includes(userRole)
  )

  const width = collapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)'

  return (
    <aside
      className="text-white d-flex flex-column"
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
        background: 'linear-gradient(180deg, #171717 0%, #0a0a0a 100%)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.08)',
      }}
    >
      <div className={`d-flex align-items-center justify-content-center ${collapsed ? 'flex-column px-2 py-3' : 'p-4'}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {logoError ? (
          collapsed ? (
            <span className="fw-bold text-white" style={{ fontSize: '1rem' }} title="AIMA Showroom">AIMA</span>
          ) : (
            <div>
              <h5 className="mb-0 fw-bold">AIMA Showroom</h5>
              <small className="text-white">Bike Sales POS</small>
            </div>
          )
        ) : (
          <div className="d-flex flex-column align-items-center">
            <img
              src="/images_logos/Logo.png"
              alt="AIMA Logo"
              style={collapsed ? { maxHeight: '36px', objectFit: 'contain' } : { maxHeight: '56px', objectFit: 'contain' }}
              onError={() => setLogoError(true)}
            />
            {!collapsed && <small className="text-white mt-2">Bike Sales POS</small>}
          </div>
        )}
      </div>
      <nav className="p-2 grow">
        {filteredItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `d-flex align-items-center rounded text-decoration-none mb-1 sidebar-nav-link ${
                collapsed ? 'justify-content-center px-2 py-2' : 'gap-2 px-3 py-2'
              } text-white`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'var(--aima-primary)' : 'transparent',
              color: 'white',
            })}
            title={collapsed ? label : undefined}
          >
            <Icon size={20} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
