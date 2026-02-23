import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCouriers, type CourierDto } from '@/lib/courierApi'
import { Eye } from 'lucide-react'

export default function Courier() {
  const [couriers, setCouriers] = useState<CourierDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewCourier, setViewCourier] = useState<CourierDto | null>(null)

  useEffect(() => {
    let cancelled = false
    getCouriers().then((list) => {
      if (!cancelled) setCouriers(list ?? [])
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const filteredCouriers = couriers.filter((c) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    const name = (c.name ?? '').toLowerCase()
    const customer = (c.customerDto?.name ?? '').toLowerCase()
    const address = (c.address ?? '').toLowerCase()
    const contact = String(c.contactNumber ?? '')
    const receiver = (c.receivername ?? '').toLowerCase()
    return (
      name.includes(q) ||
      customer.includes(q) ||
      address.includes(q) ||
      contact.includes(searchQuery) ||
      receiver.includes(q)
    )
  })

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Courier</h2>
      </div>
      <div className="card">
        <div className="card-body">
          <Input
            placeholder="Search by name, customer, address, contact..."
            className="mb-3"
            style={{ maxWidth: '400px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {loading ? (
            <p className="text-muted mb-0">Loading couriers...</p>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Customer</th>
                      <th>Contact Number</th>
                      <th>Address</th>
                      <th>Sent Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCouriers.map((courier) => (
                      <tr key={courier.id}>
                        <td className="fw-medium">{courier.name ?? '-'}</td>
                        <td>{courier.customerDto?.name ?? '-'}</td>
                        <td>{courier.contactNumber != null ? String(courier.contactNumber) : '-'}</td>
                        <td>{courier.address ?? '-'}</td>
                        <td>{courier.sentDate ?? '-'}</td>
                        <td>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1"
                            onClick={() => setViewCourier(courier)}
                            title="View details"
                          >
                            <Eye size={20} className="text-primary" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredCouriers.length === 0 && (
                <p className="text-muted mb-0">No couriers found</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* View Courier Modal */}
      {viewCourier && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setViewCourier(null)}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Courier Details - {viewCourier.name}</h5>
                <button type="button" className="btn-close" onClick={() => setViewCourier(null)} aria-label="Close" />
              </div>
              <div className="modal-body">
                <h6 className="border-bottom pb-2 mb-3">Courier Information</h6>
                <div className="row g-2 mb-4">
                  <div className="col-md-6"><strong>Name:</strong> {viewCourier.name ?? '-'}</div>
                  <div className="col-md-6"><strong>Category:</strong> {viewCourier.categoryDto?.name ?? '-'}</div>
                  <div className="col-md-6"><strong>Customer:</strong> {viewCourier.customerDto?.name ?? '-'}</div>
                  <div className="col-md-6"><strong>Contact Number:</strong> {viewCourier.contactNumber != null ? String(viewCourier.contactNumber) : '-'}</div>
                  <div className="col-12"><strong>Address:</strong> {viewCourier.address ?? '-'}</div>
                  <div className="col-md-6"><strong>Sent Date:</strong> {viewCourier.sentDate ?? '-'}</div>
                  <div className="col-md-6"><strong>Received Date:</strong> {viewCourier.receivedDate ?? '-'}</div>
                  <div className="col-md-6"><strong>Receiver Name:</strong> {viewCourier.receivername ?? '-'}</div>
                  <div className="col-md-6"><strong>Receiver NIC:</strong> {viewCourier.nic ?? '-'}</div>
                </div>
              </div>
              <div className="modal-footer">
                <Button variant="outline" onClick={() => setViewCourier(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
