import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useResolvedLogoUrl } from '@/hooks/useResolvedLogoUrl'
import { useShopDetail } from '@/context/ShopDetailContext'
import { getSettingsAllPagination } from '@/lib/settingsApi'
import type { SettingDto } from '@/lib/settingsApi'
import {
  LayoutDashboard,
  Users,
  UserCog,
  User,
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
  Database as DatabaseIcon,
  Store,
} from 'lucide-react'

type SectionId = 'overview' | 'inventory' | 'stakeholders' | 'admin'

const SIDEBAR_SECTIONS: Array<{ id: SectionId; title: string; subtitle: string }> = [
  { id: 'overview', title: 'Overview & Sales', subtitle: 'Daily Operations' },
  { id: 'inventory', title: 'Inventory Management', subtitle: '' },
  { id: 'stakeholders', title: 'Stakeholders', subtitle: '' },
  { id: 'admin', title: 'Administrative & System', subtitle: '' },
]

const MENU_ITEMS: Array<{ path: string; icon: React.ComponentType<{ size?: number }>; label: string; settingKey: string; section: SectionId }> = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', settingKey: 'Dashboard', section: 'overview' },
  { path: '/pos', icon: ShoppingCart, label: 'POS', settingKey: 'Pos', section: 'overview' },
  { path: '/payment', icon: CreditCard, label: 'Payment', settingKey: 'Payment', section: 'overview' },
  { path: '/reports', icon: BarChart3, label: 'Reports', settingKey: 'Reports', section: 'overview' },
  { path: '/stock', icon: Package, label: 'Stock', settingKey: 'Stock', section: 'inventory' },
  { path: '/bike-models', icon: Bike, label: 'Models', settingKey: 'Models', section: 'inventory' },
  { path: '/category', icon: Layers, label: 'Category', settingKey: 'Category', section: 'inventory' },
  { path: '/transfer', icon: ArrowRightLeft, label: 'Transfer', settingKey: 'Transfer', section: 'inventory' },
  { path: '/customers', icon: Users, label: 'Customers', settingKey: 'Customer', section: 'stakeholders' },
  { path: '/dealer-invoice', icon: FileText, label: 'Dealer', settingKey: 'Dealer', section: 'stakeholders' },
  { path: '/courier', icon: Truck, label: 'Courier', settingKey: 'Courier', section: 'stakeholders' },
  { path: '/profile', icon: User, label: 'Profile', settingKey: 'Profile', section: 'admin' },
  { path: '/users', icon: UserCog, label: 'User', settingKey: 'User', section: 'admin' },
  { path: '/shop-details', icon: Store, label: 'Shop Detail', settingKey: 'ShopDetails', section: 'admin' },
  { path: '/settings', icon: Settings, label: 'Settings', settingKey: 'Settings', section: 'admin' },
  { path: '/database', icon: DatabaseIcon, label: 'Database', settingKey: 'Database', section: 'admin' },
]

const STAFF_NO_ACCESS_KEYS = ['user', 'database']

function settingsMap(list: SettingDto[]): Map<string, { isActiveAdmin: boolean; isActiveManager: boolean }> {
  const map = new Map<string, { isActiveAdmin: boolean; isActiveManager: boolean }>()
  list.forEach((s) => {
    const key = (s.name || '').trim().toLowerCase()
    if (key) map.set(key, { isActiveAdmin: s.isActiveAdmin !== false, isActiveManager: s.isActiveManager !== false })
  })
  return map
}

function settingsOrderMap(list: SettingDto[]): Map<string, number> {
  const orderMap = new Map<string, number>()
  list.forEach((s, index) => {
    const key = (s.name || '').trim().toLowerCase()
    if (key) orderMap.set(key, index)
  })
  return orderMap
}

interface SidebarProps {
  collapsed: boolean
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const { user } = useAuth()
  const { shopDetail } = useShopDetail()
  const resolvedLogo = useResolvedLogoUrl(shopDetail?.logo)
  const [logoError, setLogoError] = useState(false)
  const [settingsList, setSettingsList] = useState<SettingDto[]>([])
  const shopName = shopDetail?.name?.trim() || 'AIMA Showroom'
  const logoUrl = resolvedLogo || '/images_logos/logo.jpg'

  useEffect(() => {
    getSettingsAllPagination(1, 500)
      .then((res) => setSettingsList(res.content ?? []))
      .catch(() => setSettingsList([]))
  }, [])

  const userRole = user?.role?.toLowerCase()
  const map = settingsMap(settingsList)
  const orderMap = settingsOrderMap(settingsList)

  const filtered = MENU_ITEMS.filter((item) => {
    if (!userRole) return false
    const key = item.settingKey.toLowerCase()
    const setting = map.get(key)
    if (userRole === 'admin') {
      return true
    }
    if (userRole === 'manager') {
      if (key === 'settings' || key === 'user') return true
      return setting ? setting.isActiveAdmin : false
    }
    if (userRole === 'staff') {
      if (STAFF_NO_ACCESS_KEYS.includes(key)) return false
      // Staff sees item only when both Admin and Manager have it on
      return setting ? (setting.isActiveAdmin && setting.isActiveManager) : false
    }
    return false
  })

  const filteredItems = [...filtered].sort((a, b) => {
    const orderA = orderMap.get(a.settingKey.toLowerCase()) ?? 9999
    const orderB = orderMap.get(b.settingKey.toLowerCase()) ?? 9999
    return orderA - orderB
  })

  // Group items by section (order from SIDEBAR_SECTIONS)
  const itemsBySection = SIDEBAR_SECTIONS.map((sec) => ({
    ...sec,
    items: filteredItems.filter((item) => item.section === sec.id),
  })).filter((g) => g.items.length > 0)

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
            <span className="fw-bold text-white" style={{ fontSize: '1rem' }} title={shopName}>{shopName.split(/\s/)[0] || 'Shop'}</span>
          ) : (
            <div>
              <h5 className="mb-0 fw-bold">{shopName}</h5>
            </div>
          )
        ) : (
          <div className="d-flex flex-column align-items-center">
            <img
              src={logoUrl}
              alt={`${shopName} Logo`}
              style={collapsed ? { maxHeight: '28px', objectFit: 'contain' } : { maxHeight: '42px', objectFit: 'contain' }}
              onError={() => setLogoError(true)}
            />
          </div>
        )}
      </div>
      <nav className="p-2 grow">
        {itemsBySection.map((group, groupIndex) => (
          <div key={group.id} className="mb-3">
            {!collapsed && (
              <div className="px-3 py-1 mb-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                <div className="text-uppercase small fw-semibold" style={{ color: '#E31C79', letterSpacing: '0.02em' }}>
                  {group.title}
                </div>
                {group.subtitle && (
                  <div className="small" style={{ color: 'rgba(227,28,121,0.85)', fontSize: '0.7rem' }}>
                    {group.subtitle}
                  </div>
                )}
              </div>
            )}
            {collapsed && groupIndex > 0 && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', marginTop: 4, marginBottom: 4 }} />
            )}
            {group.items.map(({ path, icon: Icon, label }) => (
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
          </div>
        ))}
      </nav>
    </aside>
  )
}
