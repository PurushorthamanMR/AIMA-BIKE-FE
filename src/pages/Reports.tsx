import { useState, useEffect, useMemo } from 'react'
import { formatCurrency } from '@/lib/utils'
import { fetchAllCompletedCustomers, customersToSaleRecords, type ReportSaleRecord } from '@/lib/reportsApi'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts'
import { BarChart3, TrendingUp, DollarSign, Hash } from 'lucide-react'

type PeriodType = 'daily' | 'monthly' | 'yearly'

const CHART_COLORS = ['#AA336A', '#198754', '#0d6efd', '#fd7e14', '#6f42c1', '#20c997', '#dc3545', '#ffc107']

export default function Reports() {
  const [sales, setSales] = useState<ReportSaleRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<PeriodType>('daily')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchAllCompletedCustomers()
      .then((customers) => {
        if (!cancelled) setSales(customersToSaleRecords(customers))
      })
      .catch(() => {
        if (!cancelled) setSales([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const getDateDaysAgo = (days: number) => {
    const d = new Date()
    d.setDate(d.getDate() - days)
    return d.toISOString().split('T')[0]
  }

  const { filteredSales, chartData, paymentData, itemWiseList, customerData } = useMemo(() => {
    let filtered = sales
    if (period === 'daily') {
      filtered = sales.filter((s) => s.date && s.date >= getDateDaysAgo(30))
    } else if (period === 'monthly') {
      filtered = sales.filter((s) => s.date && s.date >= getDateDaysAgo(365))
    }

    const byDate: Record<string, { count: number; total: number }> = {}
    filtered.forEach((s) => {
      const d = s.date
      if (!d) return
      if (!byDate[d]) byDate[d] = { count: 0, total: 0 }
      byDate[d].count += 1
      byDate[d].total += s.amount
    })

    let chartDataPoints: { label: string; sales: number; count: number }[] = []
    if (period === 'daily') {
      const days = 30
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = d.toISOString().split('T')[0]
        const data = byDate[key] ?? { count: 0, total: 0 }
        chartDataPoints.push({
          label: key.slice(5),
          sales: data.total,
          count: data.count,
        })
      }
    } else if (period === 'monthly') {
      const months: Record<string, { count: number; total: number }> = {}
      filtered.forEach((s) => {
        if (!s.date) return
        const [y, m] = s.date.split('-')
        const key = `${y}-${m}`
        if (!months[key]) months[key] = { count: 0, total: 0 }
        months[key].count += 1
        months[key].total += s.amount
      })
      chartDataPoints = Object.entries(months)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([key, data]) => ({
          label: key,
          sales: data.total,
          count: data.count,
        }))
    } else {
      const years: Record<string, { count: number; total: number }> = {}
      filtered.forEach((s) => {
        if (!s.date) return
        const y = s.date.split('-')[0]
        if (!years[y]) years[y] = { count: 0, total: 0 }
        years[y].count += 1
        years[y].total += s.amount
      })
      chartDataPoints = Object.entries(years)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, data]) => ({
          label: key,
          sales: data.total,
          count: data.count,
        }))
    }

    const paymentBreakdown: Record<string, number> = {}
    filtered.forEach((s) => {
      const key = s.paymentType || 'other'
      paymentBreakdown[key] = (paymentBreakdown[key] ?? 0) + s.amount
    })
    const paymentData = Object.entries(paymentBreakdown).map(([name, value]) => ({ name, value }))

    const modelSales: Record<string, { qty: number; total: number }> = {}
    filtered.forEach((s) => {
      const key = s.model || '-'
      if (!modelSales[key]) modelSales[key] = { qty: 0, total: 0 }
      modelSales[key].qty += 1
      modelSales[key].total += s.amount
    })
    const itemWiseList = Object.entries(modelSales)
      .map(([name, data]) => ({ name, qty: data.qty, total: data.total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    const customerData: Record<string, { count: number; total: number }> = {}
    filtered.forEach((s) => {
      const name = s.customerName || 'Unknown'
      if (!customerData[name]) customerData[name] = { count: 0, total: 0 }
      customerData[name].count += 1
      customerData[name].total += s.amount
    })

    return {
      filteredSales: filtered,
      chartData: chartDataPoints,
      paymentData,
      itemWiseList,
      customerData,
    }
  }, [sales, period])

  const totalSales = filteredSales.reduce((sum, s) => sum + s.amount, 0)
  const totalCount = filteredSales.length

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="rounded-3 p-2" style={{ background: 'rgba(170, 51, 106, 0.1)' }}>
            <BarChart3 size={32} style={{ color: 'var(--aima-primary)' }} />
          </div>
          <h2 style={{ color: 'var(--aima-secondary)' }}>Reports & Analytics</h2>
        </div>
        <p className="text-muted">Loading report data...</p>
      </div>
    )
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 p-2" style={{ background: 'rgba(170, 51, 106, 0.1)' }}>
            <BarChart3 size={32} style={{ color: 'var(--aima-primary)' }} />
          </div>
          <h2 className="mb-0" style={{ color: 'var(--aima-secondary)' }}>Reports & Analytics</h2>
        </div>
        <div className="btn-group">
          <button
            className={`btn btn-sm ${period === 'daily' ? 'btn-aima-primary' : 'btn-outline-secondary'}`}
            onClick={() => setPeriod('daily')}
          >
            Daily
          </button>
          <button
            className={`btn btn-sm ${period === 'monthly' ? 'btn-aima-primary' : 'btn-outline-secondary'}`}
            onClick={() => setPeriod('monthly')}
          >
            Monthly
          </button>
          <button
            className={`btn btn-sm ${period === 'yearly' ? 'btn-aima-primary' : 'btn-outline-secondary'}`}
            onClick={() => setPeriod('yearly')}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm page-card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="text-uppercase small mb-0" style={{ color: 'var(--aima-muted)' }}>Total Sales</h6>
                <DollarSign size={20} style={{ color: 'var(--aima-primary)' }} />
              </div>
              <h3 className="mb-0" style={{ color: 'var(--aima-primary)' }}>{formatCurrency(totalSales)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm page-card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="text-uppercase small mb-0" style={{ color: 'var(--aima-muted)' }}>Total Sales (Bikes)</h6>
                <Hash size={20} style={{ color: 'var(--aima-success)' }} />
              </div>
              <h3 className="mb-0" style={{ color: 'var(--aima-secondary)' }}>{totalCount}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm page-card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="text-uppercase small mb-0" style={{ color: 'var(--aima-muted)' }}>Avg per Sale</h6>
                <TrendingUp size={20} style={{ color: 'var(--aima-info)' }} />
              </div>
              <h3 className="mb-0" style={{ color: 'var(--aima-secondary)' }}>
                {totalCount > 0 ? formatCurrency(totalSales / totalCount) : formatCurrency(0)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Sales Chart */}
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                {period === 'daily' ? 'Daily' : period === 'monthly' ? 'Monthly' : 'Yearly'} Sales Trend
              </h5>
            </div>
            <div className="card-body">
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), 'Sales']}
                      labelFormatter={(label) => `Period: ${label}`}
                    />
                    <Bar dataKey="sales" fill="#AA336A" radius={[4, 4, 0, 0]} name="Sales" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Breakdown Pie */}
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Payment Type</h5>
            </div>
            <div className="card-body">
              {paymentData.length > 0 ? (
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={paymentData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {paymentData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-muted mb-0 text-center py-5">No payment data</p>
              )}
            </div>
          </div>
        </div>

        {/* Model-wise Sales Chart */}
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Top Models by Sales</h5>
            </div>
            <div className="card-body">
              {itemWiseList.length > 0 ? (
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={itemWiseList}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="total" fill="#198754" radius={[0, 4, 4, 0]} name="Sales" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-muted mb-0 text-center py-5">No model sales</p>
              )}
            </div>
          </div>
        </div>

        {/* Sales Line Chart */}
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Sales Trend (Line)</h5>
            </div>
            <div className="card-body">
              {chartData.length > 0 ? (
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), 'Sales']}
                        labelFormatter={(label) => `Period: ${label}`}
                      />
                      <Line type="monotone" dataKey="sales" stroke="#AA336A" strokeWidth={2} dot={{ r: 3 }} name="Sales" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-muted mb-0 text-center py-5">No data</p>
              )}
            </div>
          </div>
        </div>

        {/* Customer Sales Table */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Customer Sales</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Purchases</th>
                      <th>Total Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(customerData)
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
              {Object.keys(customerData).length === 0 && (
                <div className="p-4 text-center text-muted">No customer data</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
