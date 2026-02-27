import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'
import { getReportSales, type ReportPeriod, type ReportSalesResponse } from '@/lib/reportApi'
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
import { BarChart3, TrendingUp, DollarSign, Hash, Loader2, Printer, FileDown } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { useShopDetail } from '@/context/ShopDetailContext'

const CHART_COLORS = ['#E31C79', '#198754', '#E31C79', '#fd7e14', '#6f42c1', '#20c997', '#dc3545', '#ffc107']

const emptyReport: ReportSalesResponse = {
  summary: { totalSales: 0, totalCount: 0, avgPerSale: 0 },
  chartData: [],
  paymentData: [],
  itemWiseList: [],
  customerData: [],
}

function buildReportPrintHtml(report: ReportSalesResponse, period: ReportPeriod, shopName: string): string {
  const periodLabel = period === 'daily' ? 'Daily' : period === 'monthly' ? 'Monthly' : 'Yearly'
  const { summary, chartData, paymentData, itemWiseList, customerData } = report
  const sortedCustomers = [...customerData].sort((a, b) => b.total - a.total)
  const chartRows = chartData.map((d) => `<tr><td>${d.label}</td><td>${formatCurrency(d.sales)}</td><td>${d.count}</td></tr>`).join('')
  const paymentRows = paymentData.map((d) => `<tr><td>${d.name}</td><td>${formatCurrency(d.value)}</td></tr>`).join('')
  const itemRows = itemWiseList.map((d) => `<tr><td>${d.name}</td><td>${d.qty}</td><td>${formatCurrency(d.total)}</td></tr>`).join('')
  const customerRows = sortedCustomers.map((d) => `<tr><td>${d.name}</td><td>${d.count}</td><td>${formatCurrency(d.total)}</td></tr>`).join('')
  const title = shopName ? `${shopName} – Reports & Analytics` : 'Reports & Analytics'
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title} - ${periodLabel}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    .period { color: #666; font-size: 14px; margin-bottom: 20px; }
    .section { margin-bottom: 24px; }
    .section h2 { font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
    th { background: #f5f5f5; font-weight: 600; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .summary-box { border: 1px solid #ddd; padding: 12px; text-align: center; }
    .summary-box strong { display: block; font-size: 18px; margin-top: 4px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="period">Period: ${periodLabel} · Generated ${new Date().toLocaleString()}</p>
  <div class="summary-grid">
    <div class="summary-box"><span>Total Sales</span><strong>${formatCurrency(summary.totalSales)}</strong></div>
    <div class="summary-box"><span>Total Sales (Count)</span><strong>${summary.totalCount}</strong></div>
    <div class="summary-box"><span>Avg per Sale</span><strong>${formatCurrency(summary.avgPerSale)}</strong></div>
  </div>
  ${chartData.length > 0 ? `<div class="section"><h2>Sales by Period</h2><table><thead><tr><th>Period</th><th>Sales</th><th>Count</th></tr></thead><tbody>${chartRows}</tbody></table></div>` : ''}
  ${paymentData.length > 0 ? `<div class="section"><h2>Payment Type</h2><table><thead><tr><th>Payment</th><th>Amount</th></tr></thead><tbody>${paymentRows}</tbody></table></div>` : ''}
  ${itemWiseList.length > 0 ? `<div class="section"><h2>Item-wise Sales</h2><table><thead><tr><th>Item</th><th>Qty</th><th>Total</th></tr></thead><tbody>${itemRows}</tbody></table></div>` : ''}
  ${sortedCustomers.length > 0 ? `<div class="section"><h2>Customer Sales</h2><table><thead><tr><th>Customer</th><th>Purchases</th><th>Total Spent</th></tr></thead><tbody>${customerRows}</tbody></table></div>` : ''}
</body>
</html>`
}

function buildReportPdf(report: ReportSalesResponse, period: ReportPeriod, shopName: string): jsPDF {
  const doc = new jsPDF()
  const periodLabel = period === 'daily' ? 'Daily' : period === 'monthly' ? 'Monthly' : 'Yearly'
  let y = 18
  if (shopName) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(shopName, 14, y)
    y += 6
  }
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Reports & Analytics', 14, y)
  y += 8
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Period: ${periodLabel}  ·  Generated: ${new Date().toLocaleString()}`, 14, y)
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Summary', 14, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Total Sales: ${formatCurrency(report.summary.totalSales)}`, 14, y)
  y += 6
  doc.text(`Total Count: ${report.summary.totalCount}`, 14, y)
  y += 6
  doc.text(`Avg per Sale: ${formatCurrency(report.summary.avgPerSale)}`, 14, y)
  y += 12
  const col1 = 14
  const col2 = 60
  const col3 = 120
  const col4 = 170
  if (report.chartData.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.text('Sales by Period', 14, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('Period', col1, y)
    doc.text('Sales', col2, y)
    doc.text('Count', col3, y)
    y += 5
    report.chartData.slice(0, 15).forEach((r) => {
      if (y > 270) { doc.addPage(); y = 20 }
      doc.text(String(r.label).slice(0, 18), col1, y)
      doc.text(formatCurrency(r.sales), col2, y)
      doc.text(String(r.count), col3, y)
      y += 5
    })
    y += 8
  }
  if (report.paymentData.length > 0) {
    if (y > 250) { doc.addPage(); y = 20 }
    doc.setFont('helvetica', 'bold')
    doc.text('Payment Type', 14, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    report.paymentData.forEach((r) => {
      if (y > 275) { doc.addPage(); y = 20 }
      doc.text(r.name, col1, y)
      doc.text(formatCurrency(r.value), col2, y)
      y += 5
    })
    y += 8
  }
  if (report.itemWiseList.length > 0) {
    if (y > 250) { doc.addPage(); y = 20 }
    doc.setFont('helvetica', 'bold')
    doc.text('Item-wise Sales', 14, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    report.itemWiseList.slice(0, 20).forEach((r) => {
      if (y > 275) { doc.addPage(); y = 20 }
      doc.text(String(r.name).slice(0, 25), col1, y)
      doc.text(String(r.qty), col2, y)
      doc.text(formatCurrency(r.total), col3, y)
      y += 5
    })
    y += 8
  }
  if (report.customerData.length > 0) {
    if (y > 250) { doc.addPage(); y = 20 }
    doc.setFont('helvetica', 'bold')
    doc.text('Customer Sales', 14, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    const sorted = [...report.customerData].sort((a, b) => b.total - a.total).slice(0, 25)
    sorted.forEach((r) => {
      if (y > 275) { doc.addPage(); y = 20 }
      doc.text(String(r.name).slice(0, 28), col1, y)
      doc.text(String(r.count), col2, y)
      doc.text(formatCurrency(r.total), col3, y)
      y += 5
    })
  }
  return doc
}

export default function Reports() {
  const { shopDetail } = useShopDetail()
  const shopName = shopDetail?.name?.trim() || ''
  const [report, setReport] = useState<ReportSalesResponse>(emptyReport)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<ReportPeriod>('daily')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    getReportSales(period)
      .then((data) => {
        if (!cancelled) setReport(data ?? emptyReport)
      })
      .catch(() => {
        if (!cancelled) {
          setReport(emptyReport)
          setError('Failed to load report.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [period])

  const { summary, chartData, paymentData, itemWiseList, customerData } = report
  const totalSales = summary.totalSales
  const totalCount = summary.totalCount
  const sortedCustomers = [...customerData].sort((a, b) => b.total - a.total)

  const handlePrint = () => {
    const html = buildReportPrintHtml(report, period, shopName)
    const w = window.open('', '_blank')
    if (w) {
      w.document.write(html)
      w.document.close()
      w.focus()
      setTimeout(() => {
        w.print()
        w.close()
      }, 400)
    }
  }

  const handleDownloadPdf = () => {
    const doc = buildReportPdf(report, period, shopName)
    const periodLabel = period === 'daily' ? 'Daily' : period === 'monthly' ? 'Monthly' : 'Yearly'
    doc.save(`Reports-Analytics-${periodLabel}-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  if (loading) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center text-center"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.95)',
          zIndex: 1050,
        }}
      >
        <Loader2 size={48} className="mb-3" style={{ color: 'var(--aima-primary)', animation: 'spin 1s linear infinite' }} />
        <h5 className="mb-1" style={{ color: 'var(--aima-secondary)' }}>Loading report...</h5>
        <p className="text-muted small mb-0">{period === 'daily' ? 'Daily' : period === 'monthly' ? 'Monthly' : 'Yearly'} data</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 p-2" style={{ background: 'rgba(170, 51, 106, 0.1)' }}>
            <BarChart3 size={32} style={{ color: 'var(--aima-primary)' }} />
          </div>
          <h2 className="mb-0" style={{ color: 'var(--aima-secondary)' }}>Reports & Analytics</h2>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2"
            onClick={handlePrint}
            title="Print report"
          >
            <Printer size={18} />
            Print
          </button>
          <button
            type="button"
            className="btn btn-sm d-inline-flex align-items-center gap-2"
            style={{ backgroundColor: 'var(--aima-primary)', color: '#fff' }}
            onClick={handleDownloadPdf}
            title="Download PDF report"
          >
            <FileDown size={18} />
            PDF
          </button>
          <div className="btn-group ms-1">
            <button
              type="button"
              className={`btn btn-sm ${period === 'daily' ? 'btn-aima-primary' : 'btn-outline-secondary'}`}
              onClick={() => setPeriod('daily')}
            >
              Daily
            </button>
            <button
              type="button"
              className={`btn btn-sm ${period === 'monthly' ? 'btn-aima-primary' : 'btn-outline-secondary'}`}
              onClick={() => setPeriod('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`btn btn-sm ${period === 'yearly' ? 'btn-aima-primary' : 'btn-outline-secondary'}`}
              onClick={() => setPeriod('yearly')}
            >
              Yearly
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning py-2 mb-3" role="alert">
          {error}
        </div>
      )}

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
                {formatCurrency(summary.avgPerSale)}
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
                    <Bar dataKey="sales" fill="var(--aima-primary)" radius={[4, 4, 0, 0]} name="Sales" />
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
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={paymentData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={32}
                        outerRadius={58}
                        label={false}
                      >
                        {paymentData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ fontSize: 12 }} />
                      <Legend formatter={(value, entry) => {
                        const total = paymentData.reduce((s, d) => s + d.value, 0)
                        const pct = total ? ((entry.payload?.value ?? 0) / total * 100).toFixed(0) : '0'
                        return `${value} ${pct}%`
                      }} />
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
                      <Line type="monotone" dataKey="sales" stroke="var(--aima-primary)" strokeWidth={2} dot={{ r: 3 }} name="Sales" />
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
                    {sortedCustomers.map((row) => (
                      <tr key={row.name}>
                        <td className="fw-medium">{row.name}</td>
                        <td>{row.count}</td>
                        <td>{formatCurrency(row.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {customerData.length === 0 && (
                <div className="p-4 text-center text-muted">No customer data</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
