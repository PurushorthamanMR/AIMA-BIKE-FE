import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { useInvoices } from '@/context/InvoiceContext'
import { formatCurrency } from '@/lib/utils'

export default function InvoiceHistory() {
  const [searchQuery, setSearchQuery] = useState('')
  const { invoices } = useInvoices()

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customer?.phone?.includes(searchQuery)
  )

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Invoice History</h2>
      <div className="mb-3">
        <Input
          placeholder="Search by Invoice Number, Customer, Phone..."
          style={{ maxWidth: '400px' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
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
                    </td>
                    <td>
                      {inv.balance ? (
                        <span className="badge bg-warning text-dark">
                          Balance: {formatCurrency(inv.balance)}
                        </span>
                      ) : (
                        <span className="badge bg-success">Paid</span>
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
          {filteredInvoices.length === 0 && (
            <div className="p-4 text-muted">No invoices found</div>
          )}
        </div>
      </div>
    </div>
  )
}
