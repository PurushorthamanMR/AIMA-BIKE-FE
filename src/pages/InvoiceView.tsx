import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useInvoices } from '@/context/InvoiceContext'
import { formatCurrency } from '@/lib/utils'

export default function InvoiceView() {
  const { id } = useParams()
  const { invoices } = useInvoices()
  const invoice = invoices.find((inv) => inv.id === id)

  if (!invoice) {
    return (
      <div className="container-fluid">
        <p className="text-muted">Invoice not found</p>
        <Link to="/invoice/history" className="btn btn-outline-secondary">
          Back to History
        </Link>
      </div>
    )
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Invoice {invoice.invoiceNumber}</h2>
        <Link to="/invoice/history" className="btn btn-outline-secondary">
          ← Back
        </Link>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">Customer Details</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p className="mb-1"><strong>Name:</strong> {invoice.customer?.name}</p>
              <p className="mb-1"><strong>Phone:</strong> {invoice.customer?.phone}</p>
            </div>
            <div className="col-md-6">
              <p className="mb-1"><strong>Bike:</strong> {invoice.customer?.bikeNumber ?? '-'}</p>
              <p className="mb-1"><strong>Address:</strong> {invoice.customer?.address ?? '-'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">Items</h5>
        </div>
        <div className="card-body p-0">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.productOrService}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.price)}</td>
                  <td>{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-footer">
          <div className="d-flex justify-content-end gap-4">
            <span>Subtotal: {formatCurrency(invoice.subtotal)}</span>
            <span>Discount: {formatCurrency(invoice.discount)}</span>
            <span>Tax: {formatCurrency(invoice.tax)}</span>
            <strong>Grand Total: {formatCurrency(invoice.grandTotal)}</strong>
          </div>
          <div className="mt-2">
            <span className="badge bg-secondary text-capitalize">{invoice.paymentType}</span>
            {invoice.balance ? (
              <span className="badge bg-warning text-dark ms-2">
                Balance: {formatCurrency(invoice.balance)} | Due: {invoice.dueDate}
              </span>
            ) : (
              <span className="badge bg-success ms-2">Paid</span>
            )}
          </div>
        </div>
      </div>

      {invoice.bikeImages && invoice.bikeImages.length > 0 && (
        <div className="card mb-4">
          <div className="card-header bg-white">
            <h5 className="mb-0">Bike Images (Insurance Proof)</h5>
          </div>
          <div className="card-body">
            <div className="d-flex flex-wrap gap-3">
              {invoice.bikeImages.map((img) => (
                <div key={img.id} className="border rounded overflow-hidden">
                  <img
                    src={img.url}
                    alt={img.label ?? 'Bike'}
                    style={{ width: '150px', height: '120px', objectFit: 'cover' }}
                  />
                  {img.label && (
                    <div className="bg-light px-2 py-1 small text-center">{img.label}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="d-flex gap-2">
        <Button variant="outline">Reprint</Button>
        <Button variant="outline">Download</Button>
      </div>
    </div>
  )
}
