import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingCart,
  Users,
  Truck,
  ArrowRightLeft,
  FileText,
  BarChart3,
  Settings,
  ChevronRight,
  CreditCard,
  UserCheck,
  Package,
  ArrowLeftRight,
  FileStack,
  LayoutDashboard,
} from 'lucide-react'
import { getCustomersPage } from '@/lib/customerApi'
import { getCouriers } from '@/lib/courierApi'
import { getTransfers } from '@/lib/transferApi'
import { getDealerConsignmentNotesPage } from '@/lib/dealerConsignmentNoteApi'

interface DashboardStats {
  totalCustomers: number
  totalCouriers: number
  totalTransfers: number
  totalDealerNotes: number
}

const quickLinks = [
  { path: '/pos', icon: ShoppingCart, label: 'POS', desc: 'Bike, Parts & Service sales' },
  { path: '/customers', icon: Users, label: 'Customers', desc: 'Customer registry' },
  { path: '/payment', icon: CreditCard, label: 'Payment', desc: 'Payment types' },
  { path: '/courier', icon: Truck, label: 'Courier', desc: 'Service courier tracking' },
  { path: '/transfer', icon: ArrowRightLeft, label: 'Transfer', desc: 'Stock transfers' },
  { path: '/dealer-invoice', icon: FileText, label: 'Dealer Invoice', desc: 'Consignment notes' },
  { path: '/reports', icon: BarChart3, label: 'Reports', desc: 'Sales & analytics' },
  { path: '/settings', icon: Settings, label: 'Settings', desc: 'System settings' },
]

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalCouriers: 0,
    totalTransfers: 0,
    totalDealerNotes: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      getCustomersPage(1, 1, true).then((r) => r?.totalElements ?? 0),
      getCouriers().then((list) => list?.length ?? 0),
      getTransfers().then((list) => list?.length ?? 0),
      getDealerConsignmentNotesPage(1, 1, true).then((r) => r?.totalElements ?? 0),
    ]).then(([customers, couriers, transfers, dealerNotes]) => {
      if (!cancelled) {
        setStats({
          totalCustomers: customers,
          totalCouriers: couriers,
          totalTransfers: transfers,
          totalDealerNotes: dealerNotes,
        })
      }
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 p-2" style={{ background: 'rgba(170, 51, 106, 0.1)' }}>
            <LayoutDashboard size={32} style={{ color: 'var(--aima-primary)' }} />
          </div>
          <div>
            <h2 className="mb-1" style={{ color: 'var(--aima-secondary)' }}>AIMA Showroom Dashboard</h2>
            <p className="mb-0 small" style={{ color: 'var(--aima-muted)' }}>Bike Sales POS - Overview</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm h-100 dashboard-card dashboard-card-customers">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="text-uppercase fw-semibold small mb-0">Total Customers</h6>
                <UserCheck size={20} style={{ color: 'var(--aima-info)' }} />
              </div>
              <h3 className="mb-0 mt-2">{loading ? '...' : stats.totalCustomers}</h3>
              <Link to="/customers" className="small text-decoration-none mt-2 d-inline-flex align-items-center" style={{ color: 'var(--aima-primary)' }}>
                View <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm h-100 dashboard-card dashboard-card-invoices">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="text-uppercase fw-semibold small mb-0">Couriers</h6>
                <Package size={20} style={{ color: 'var(--aima-primary)' }} />
              </div>
              <h3 className="mb-0 mt-2">{loading ? '...' : stats.totalCouriers}</h3>
              <Link to="/courier" className="small text-decoration-none mt-2 d-inline-flex align-items-center" style={{ color: 'var(--aima-primary)' }}>
                View <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm h-100 dashboard-card dashboard-card-sales">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="text-uppercase fw-semibold small mb-0">Transfers</h6>
                <ArrowLeftRight size={20} style={{ color: 'var(--aima-success)' }} />
              </div>
              <h3 className="mb-0 mt-2">{loading ? '...' : stats.totalTransfers}</h3>
              <Link to="/transfer" className="small text-decoration-none mt-2 d-inline-flex align-items-center" style={{ color: 'var(--aima-primary)' }}>
                View <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm h-100 dashboard-card dashboard-card-credit">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="text-uppercase fw-semibold small mb-0">Dealer Notes</h6>
                <FileStack size={20} style={{ color: 'var(--aima-accent)' }} />
              </div>
              <h3 className="mb-0 mt-2">{loading ? '...' : stats.totalDealerNotes}</h3>
              <Link to="/dealer-invoice" className="small text-decoration-none mt-2 d-inline-flex align-items-center" style={{ color: 'var(--aima-primary)' }}>
                View <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="card border-0 shadow-sm page-card">
        <div className="card-header bg-white border-bottom" style={{ borderColor: 'var(--aima-border)' }}>
          <div className="d-flex align-items-center gap-2">
            <BarChart3 size={22} style={{ color: 'var(--aima-primary)' }} />
            <div>
              <h5 className="mb-0" style={{ color: 'var(--aima-secondary)' }}>Quick Access</h5>
              <small style={{ color: 'var(--aima-muted)' }}>Navigate to main modules</small>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="row g-0">
            {quickLinks.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.path} className="col-md-6 col-lg-4 border-bottom border-end" style={{ borderColor: 'var(--aima-border)' }}>
                  <Link
                    to={item.path}
                    className="d-flex align-items-center p-4 text-decoration-none"
                    style={{ color: 'var(--aima-secondary)' }}
                  >
                    <div className="rounded-circle p-3 me-3" style={{ background: 'rgba(170, 51, 106, 0.1)' }}>
                      <Icon size={24} style={{ color: 'var(--aima-primary)' }} />
                    </div>
                    <div className="grow">
                      <h6 className="mb-0 fw-semibold">{item.label}</h6>
                      <small style={{ color: 'var(--aima-muted)' }}>{item.desc}</small>
                    </div>
                    <ChevronRight size={20} style={{ color: 'var(--aima-muted)' }} />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
