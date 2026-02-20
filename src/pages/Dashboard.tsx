import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useInvoices } from '@/context/InvoiceContext'
import { getDashboardStats } from '@/data/mockData'
import { formatCurrency } from '@/lib/utils'

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const { invoices } = useInvoices()
  const stats = getDashboardStats(invoices)

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Showroom Dashboard</h2>

      {/* Quick Search */}
      <div className="mb-4">
        <div className="position-relative" style={{ maxWidth: '400px' }}>
          <Search className="position-absolute top-50 start-3 translate-middle-y text-muted" size={20} />
          <Input
            placeholder="Quick search invoice, customer..."
            className="ps-5"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Summary Cards - AIMA POS Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm dashboard-card dashboard-card-sales">
            <div className="card-body">
              <h6 className="text-uppercase fw-semibold">Today's Bike Sales</h6>
              <h3 className="mb-0 mt-2">{formatCurrency(stats.todaySales)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm dashboard-card dashboard-card-credit">
            <div className="card-body">
              <h6 className="text-uppercase fw-semibold">Credit Pending</h6>
              <h3 className="mb-0 mt-2">{formatCurrency(stats.creditPending)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm dashboard-card dashboard-card-customers">
            <div className="card-body">
              <h6 className="text-uppercase fw-semibold">Total Customers</h6>
              <h3 className="mb-0 mt-2">{stats.totalCustomers}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm dashboard-card dashboard-card-invoices">
            <div className="card-body">
              <h6 className="text-uppercase fw-semibold">Recent Invoices</h6>
              <h3 className="mb-0 mt-2">{stats.recentInvoicesCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Recent Invoices</h5>
          <Link to="/invoice/history" className="btn btn-sm btn-outline-secondary">
            View All
          </Link>
        </div>
        <div className="card-body p-0">
          {stats.recentInvoices.length > 0 ? (
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <Link to={`/invoice/${inv.id}`} className="text-decoration-none fw-medium">
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td>{inv.customer?.name ?? '-'}</td>
                    <td>{inv.createdAt}</td>
                    <td>{formatCurrency(inv.grandTotal)}</td>
                    <td>
                      <span className="badge bg-secondary text-capitalize">{inv.paymentType}</span>
                      {inv.balance ? (
                        <span className="badge bg-warning text-dark ms-1">Credit</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-4 text-muted">No recent invoices</div>
          )}
        </div>
      </div>
    </div>
  )
}
