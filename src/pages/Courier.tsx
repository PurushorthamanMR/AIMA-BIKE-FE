import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCouriers, type CourierDto } from '@/lib/courierApi'
import { Eye, Pencil } from 'lucide-react'

export default function Courier() {
  const navigate = useNavigate()
  const [couriers, setCouriers] = useState<CourierDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

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
                          <div className="d-flex gap-1">
                            <Button variant="ghost" size="sm" className="p-1" onClick={() => navigate(`/courier/${courier.id}`)} title="View details">
                              <Eye size={20} className="text-primary" />
                            </Button>
                            <Button variant="ghost" size="sm" className="p-1" onClick={() => navigate(`/courier/${courier.id}/edit`)} title="Edit (Mark Received)">
                              <Pencil size={18} className="text-secondary" />
                            </Button>
                          </div>
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

    </div>
  )
}
