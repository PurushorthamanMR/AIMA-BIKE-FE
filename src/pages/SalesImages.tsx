import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useInvoices } from '@/context/InvoiceContext'
import { getBikeSalesWithImages } from '@/data/mockData'
import { formatCurrency } from '@/lib/utils'

export default function SalesImages() {
  const [searchQuery, setSearchQuery] = useState('')
  const { invoices } = useInvoices()
  const bikeSales = getBikeSalesWithImages(invoices)

  const filteredSales = bikeSales.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.items.some((i) => i.productOrService.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Sales Images</h2>
      <p className="text-muted mb-4">
        Bike sale bills with associated images - Insurance proof & service history
      </p>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by Invoice #, Customer, Bike..."
          style={{ maxWidth: '400px' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="row g-4">
        {filteredSales.map((invoice) => (
          <div key={invoice.id} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm">
              <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
                <Link to={`/invoice/${invoice.id}`} className="fw-bold text-decoration-none">
                  {invoice.invoiceNumber}
                </Link>
                <span className="badge bg-secondary">{invoice.createdAt}</span>
              </div>
              <div className="card-body py-2">
                <p className="mb-1 small">
                  <strong>{invoice.customer?.name}</strong>
                </p>
                <p className="mb-1 small text-muted">
                  {invoice.items.filter((i) =>
                    ['AIMA Maverick', 'AIMA Mana', 'AIMA Liberty', 'AIMA Breezy', 'AIMA Aria', 'AIMA JoyBean'].includes(i.productOrService)
                  ).map((i) => i.productOrService).join(', ')}
                </p>
                <p className="mb-2 small">{formatCurrency(invoice.grandTotal)}</p>

                <div className="d-flex flex-wrap gap-2">
                  {invoice.bikeImages?.map((img) => (
                    <div key={img.id} className="border rounded overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.label ?? 'Bike'}
                        style={{ width: '100px', height: '75px', objectFit: 'cover' }}
                      />
                      {img.label && (
                        <div className="bg-light px-1 text-center small">{img.label}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-footer bg-white py-2">
                <Link to={`/invoice/${invoice.id}`} className="btn btn-sm btn-outline-primary">
                  View Bill
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSales.length === 0 && (
        <div className="text-center py-5 text-muted">
          <p>No bike sales with images found</p>
          <p className="small">Upload bike images in POS when selling a bike</p>
        </div>
      )}
    </div>
  )
}
