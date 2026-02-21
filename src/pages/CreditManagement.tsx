import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useInvoices } from '@/context/InvoiceContext'
import { formatCurrency } from '@/lib/utils'

export default function CreditManagement() {
  const [overdueOnly, setOverdueOnly] = useState(false)
  const { invoices } = useInvoices()

  const creditInvoices = invoices.filter((inv) => inv.balance && inv.balance > 0)
  const today = new Date().toISOString().split('T')[0]

  const filteredCredits = overdueOnly
    ? creditInvoices.filter((inv) => inv.dueDate && inv.dueDate < today)
    : creditInvoices

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Credit Management</h2>
      <div className="card">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Pending Credit List</h5>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="overdue"
              checked={overdueOnly}
              onChange={(e) => setOverdueOnly(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="overdue">
              Overdue Only
            </label>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Due Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredCredits.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.invoiceNumber}</td>
                    <td>{inv.customer?.name}</td>
                    <td>{inv.customer?.phone}</td>
                    <td>{formatCurrency(inv.grandTotal)}</td>
                    <td>{formatCurrency(inv.paidAmount ?? 0)}</td>
                    <td className="fw-bold">{formatCurrency(inv.balance ?? 0)}</td>
                    <td>
                      {inv.dueDate}
                      {inv.dueDate && inv.dueDate < today && (
                        <span className="badge bg-danger ms-1">Overdue</span>
                      )}
                    </td>
                    <td>
                      <Link to={`/invoice/${inv.id}`} className="btn btn-sm btn-outline-primary">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredCredits.length === 0 && (
            <div className="p-4 text-center text-muted">No pending credits</div>
          )}
        </div>
      </div>
    </div>
  )
}
