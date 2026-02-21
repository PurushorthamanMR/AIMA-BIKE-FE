import { useState } from 'react'
import { useInvoices } from '@/context/InvoiceContext'
import { formatCurrency } from '@/lib/utils'

export default function Reports() {
  const { invoices } = useInvoices()
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today')

  const today = new Date().toISOString().split('T')[0]
  const getDateDaysAgo = (days: number) => {
    const d = new Date()
    d.setDate(d.getDate() - days)
    return d.toISOString().split('T')[0]
  }

  const filteredInvoices = invoices.filter((inv) => {
    if (dateRange === 'today') return inv.createdAt === today
    if (dateRange === 'week') return inv.createdAt >= getDateDaysAgo(7)
    return inv.createdAt >= getDateDaysAgo(30)
  })

  const totalSales = filteredInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0)
  const totalInvoices = filteredInvoices.length

  // Item-wise sales
  const itemSales: Record<string, { qty: number; total: number }> = {}
  filteredInvoices.forEach((inv) => {
    inv.items.forEach((item) => {
      const key = item.productOrService
      if (!itemSales[key]) itemSales[key] = { qty: 0, total: 0 }
      itemSales[key].qty += item.quantity
      itemSales[key].total += item.total
    })
  })
  const itemWiseList = Object.entries(itemSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total)

  // Payment type breakdown
  const paymentBreakdown: Record<string, number> = {}
  filteredInvoices.forEach((inv) => {
    const key = inv.paymentType
    paymentBreakdown[key] = (paymentBreakdown[key] ?? 0) + inv.grandTotal
  })

  // Customer service count (invoices per customer)
  const customerInvoices: Record<string, { count: number; total: number }> = {}
  filteredInvoices.forEach((inv) => {
    const name = inv.customer?.name ?? 'Walk-in'
    if (!customerInvoices[name]) customerInvoices[name] = { count: 0, total: 0 }
    customerInvoices[name].count += 1
    customerInvoices[name].total += inv.grandTotal
  })

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Reports & Analytics</h2>
        <div className="btn-group">
          <button
            className={`btn btn-sm ${dateRange === 'today' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setDateRange('today')}
          >
            Today
          </button>
          <button
            className={`btn btn-sm ${dateRange === 'week' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setDateRange('week')}
          >
            Last 7 Days
          </button>
          <button
            className={`btn btn-sm ${dateRange === 'month' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setDateRange('month')}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted text-uppercase">Total Sales</h6>
              <h3 className="mb-0 text-primary">{formatCurrency(totalSales)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted text-uppercase">Total Invoices</h6>
              <h3 className="mb-0">{totalInvoices}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted text-uppercase">Avg per Invoice</h6>
              <h3 className="mb-0">
                {totalInvoices > 0 ? formatCurrency(totalSales / totalInvoices) : formatCurrency(0)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Daily/Monthly Sales */}
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                {dateRange === 'today' ? 'Daily' : dateRange === 'week' ? 'Weekly' : 'Monthly'} Sales
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Invoices</th>
                      <th>Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(
                      filteredInvoices.reduce<Record<string, { count: number; total: number }>>((acc, inv) => {
                        const d = inv.createdAt
                        if (!acc[d]) acc[d] = { count: 0, total: 0 }
                        acc[d].count += 1
                        acc[d].total += inv.grandTotal
                        return acc
                      }, {})
                    )
                      .sort(([a], [b]) => b.localeCompare(a))
                      .slice(0, 10)
                      .map(([date, data]) => (
                        <tr key={date}>
                          <td>{date}</td>
                          <td>{data.count}</td>
                          <td>{formatCurrency(data.total)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {filteredInvoices.length === 0 && (
                <div className="p-4 text-center text-muted">No sales in this period</div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Payment Type Breakdown</h5>
            </div>
            <div className="card-body">
              {Object.entries(paymentBreakdown).length > 0 ? (
                <div className="table-responsive">
                  <table className="table mb-0">
                    <thead>
                      <tr>
                        <th>Payment</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(paymentBreakdown).map(([type, amount]) => (
                        <tr key={type}>
                          <td className="text-capitalize">{type}</td>
                          <td>{formatCurrency(amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted mb-0">No data</p>
              )}
            </div>
          </div>
        </div>

        {/* Item-wise Sales */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Item-wise Sales</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty Sold</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemWiseList.map((item) => (
                      <tr key={item.name}>
                        <td className="fw-medium">{item.name}</td>
                        <td>{item.qty}</td>
                        <td>{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {itemWiseList.length === 0 && (
                <div className="p-4 text-center text-muted">No item sales in this period</div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Service History */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Customer Service History</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Visits</th>
                      <th>Total Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(customerInvoices)
                      .sort(([, a], [, b]) => b.total - a.total)
                      .map(([name, data]) => (
                        <tr key={name}>
                          <td className="fw-medium">{name}</td>
                          <td>{data.count}</td>
                          <td>{formatCurrency(data.total)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {Object.keys(customerInvoices).length === 0 && (
                <div className="p-4 text-center text-muted">No customer data in this period</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
