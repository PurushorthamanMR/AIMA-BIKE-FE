import { useState, useEffect, useCallback } from 'react'
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
  DollarSign,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getCustomersPage } from '@/lib/customerApi'
import { getCustomersByStatus } from '@/lib/customerApi'
import { getCouriers } from '@/lib/courierApi'
import { getTransfers } from '@/lib/transferApi'
import { getDealerConsignmentNotesPage } from '@/lib/dealerConsignmentNoteApi'
import { getReportSales, type ReportSalesResponse } from '@/lib/reportApi'
import { useShopDetail } from '@/context/ShopDetailContext'
import { formatCurrency } from '@/lib/utils'

interface DashboardStats {
  totalCustomers: number
  totalCouriers: number
  totalTransfers: number
  totalDealerNotes: number
  pendingCouriers: number
  creditPending: number
  reportDaily: ReportSalesResponse | null
}

const quickLinks = [
  { path: '/pos', icon: ShoppingCart, label: 'POS', desc: 'Bike, Parts & Service sales' },
  { path: '/customers', icon: Users, label: 'Customers', desc: 'Customer registry' },
  { path: '/payment', icon: CreditCard, label: 'Payment', desc: 'Payment types' },
  { path: '/courier', icon: Truck, label: 'Courier', desc: 'Service courier tracking' },
  { path: '/transfer', icon: ArrowRightLeft, label: 'Transfer', desc: 'Stock transfers' },
  { path: '/dealer-invoice', icon: FileText, label: 'Dealer', desc: 'Consignment notes' },
  { path: '/reports', icon: BarChart3, label: 'Reports', desc: 'Sales & analytics' },
  { path: '/settings', icon: Settings, label: 'Settings', desc: 'System settings' },
]

const emptyReport: ReportSalesResponse = {
  summary: { totalSales: 0, totalCount: 0, avgPerSale: 0 },
  chartData: [],
  paymentData: [],
  itemWiseList: [],
  customerData: [],
}

export default function Dashboard() {
  const { shopDetail } = useShopDetail()
  const shopName = shopDetail?.name?.trim() || 'AIMA Showroom'
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalCouriers: 0,
    totalTransfers: 0,
    totalDealerNotes: 0,
    pendingCouriers: 0,
    creditPending: 0,
    reportDaily: null,
  })
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(() => {
    setLoading(true)
    Promise.all([
      getCustomersPage(1, 1, true).then((r) => r?.totalElements ?? 0),
      getCouriers().then((list) => {
        const all = list ?? []
        const pending = all.filter((c) => !c.receivedDate || c.receivedDate.trim() === '')
        return { total: all.length, pending: pending.length }
      }),
      getTransfers().then((list) => list?.length ?? 0),
      getDealerConsignmentNotesPage(1, 1, true).then((r) => r?.totalElements ?? 0),
      getCustomersByStatus('pending', 1, 500, true).then((res) => {
        const content = res?.content ?? []
        const sum = content.reduce((acc, c) => acc + (Number(c.balancePaymentAmount) || 0), 0)
        return sum
      }),
      getReportSales('daily').then((data) => data ?? null),
    ]).then(([customers, courierData, transfers, dealerNotes, creditPending, reportDaily]) => {
      setStats({
        totalCustomers: customers,
        totalCouriers: courierData.total,
        totalTransfers: transfers,
        totalDealerNotes: dealerNotes,
        pendingCouriers: courierData.pending,
        creditPending,
        reportDaily,
      })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 p-2" style={{ background: 'rgba(170, 51, 106, 0.1)' }}>
            <LayoutDashboard size={32} style={{ color: 'var(--aima-primary)' }} />
          </div>
          <div>
            <h2 className="mb-1" style={{ color: 'var(--aima-secondary)' }}>{shopName} Dashboard</h2>
            <p className="mb-0 small" style={{ color: 'var(--aima-muted)' }}>Bike Sales POS - Overview</p>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2"
          onClick={() => loadData()}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
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

      {/* Sales & credit snapshot */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm h-100 border-0" style={{ borderLeft: '4px solid var(--aima-primary)' }}>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="text-uppercase fw-semibold small mb-0" style={{ color: 'var(--aima-muted)' }}>Last 30 days sales</h6>
                <DollarSign size={20} style={{ color: 'var(--aima-primary)' }} />
              </div>
              <h3 className="mb-0" style={{ color: 'var(--aima-primary)' }}>
                {loading ? '...' : stats.reportDaily ? formatCurrency(stats.reportDaily.summary.totalSales) : '—'}
              </h3>
              <p className="mb-0 small mt-1" style={{ color: 'var(--aima-muted)' }}>
                {stats.reportDaily ? `${stats.reportDaily.summary.totalCount} sales · avg ${formatCurrency(stats.reportDaily.summary.avgPerSale)}` : ''}
              </p>
              <Link to="/reports" className="small text-decoration-none mt-2 d-inline-flex align-items-center" style={{ color: 'var(--aima-primary)' }}>
                View reports <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100 border-0" style={{ borderLeft: '4px solid var(--aima-accent)' }}>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="text-uppercase fw-semibold small mb-0" style={{ color: 'var(--aima-muted)' }}>Credit pending</h6>
                <TrendingUp size={20} style={{ color: 'var(--aima-accent)' }} />
              </div>
              <h3 className="mb-0" style={{ color: 'var(--aima-accent)' }}>
                {loading ? '...' : formatCurrency(stats.creditPending)}
              </h3>
              <p className="mb-0 small mt-1" style={{ color: 'var(--aima-muted)' }}>Balance due from pending customers (not yet approved)</p>
              <Link to="/customers" className="small text-decoration-none mt-2 d-inline-flex align-items-center" style={{ color: 'var(--aima-primary)' }}>
                View customers <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100 border-0" style={{ borderLeft: '4px solid var(--aima-warning, #fd7e14)' }}>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="text-uppercase fw-semibold small mb-0" style={{ color: 'var(--aima-muted)' }}>Pending couriers</h6>
                <AlertCircle size={20} style={{ color: 'var(--aima-warning, #fd7e14)' }} />
              </div>
              <h3 className="mb-0" style={{ color: 'var(--aima-warning, #fd7e14)' }}>
                {loading ? '...' : stats.pendingCouriers}
              </h3>
              <p className="mb-0 small mt-1" style={{ color: 'var(--aima-muted)' }}>Awaiting receipt</p>
              <Link to="/courier" className="small text-decoration-none mt-2 d-inline-flex align-items-center" style={{ color: 'var(--aima-primary)' }}>
                View couriers <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mini chart + top items / top customers */}
      <div className="row g-3 mb-4">
        <div className="col-lg-5">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white border-bottom" style={{ borderColor: 'var(--aima-border)' }}>
              <h6 className="mb-0" style={{ color: 'var(--aima-secondary)' }}>Last 7 days sales</h6>
            </div>
            <div className="card-body">
              {stats.reportDaily?.chartData?.length ? (
                <div style={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={stats.reportDaily.chartData.slice(-7)}
                      margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => [formatCurrency(v), 'Sales']} />
                      <Bar dataKey="sales" fill="var(--aima-primary)" radius={[4, 4, 0, 0]} name="Sales" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="mb-0 small text-muted">No daily data yet.</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white border-bottom" style={{ borderColor: 'var(--aima-border)' }}>
              <h6 className="mb-0" style={{ color: 'var(--aima-secondary)' }}>Top items (30d)</h6>
            </div>
            <div className="card-body p-0">
              {stats.reportDaily?.itemWiseList?.length ? (
                <ul className="list-group list-group-flush">
                  {stats.reportDaily.itemWiseList.slice(0, 5).map((item, i) => (
                    <li key={i} className="list-group-item d-flex justify-content-between align-items-center py-2 small">
                      <span className="text-truncate" style={{ maxWidth: '120px' }} title={item.name}>{item.name}</span>
                      <span className="fw-semibold" style={{ color: 'var(--aima-primary)' }}>{formatCurrency(item.total)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-0 small text-muted p-3">No item data yet.</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white border-bottom" style={{ borderColor: 'var(--aima-border)' }}>
              <h6 className="mb-0" style={{ color: 'var(--aima-secondary)' }}>Top customers (30d)</h6>
            </div>
            <div className="card-body p-0">
              {stats.reportDaily?.customerData?.length ? (
                <ul className="list-group list-group-flush">
                  {[...stats.reportDaily.customerData].sort((a, b) => b.total - a.total).slice(0, 5).map((row, i) => (
                    <li key={i} className="list-group-item d-flex justify-content-between align-items-center py-2 small">
                      <span className="text-truncate" style={{ maxWidth: '140px' }} title={row.name}>{row.name}</span>
                      <span className="fw-semibold" style={{ color: 'var(--aima-primary)' }}>{formatCurrency(row.total)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-0 small text-muted p-3">No customer data yet.</p>
              )}
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
