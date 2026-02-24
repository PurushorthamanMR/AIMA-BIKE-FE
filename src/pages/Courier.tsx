import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCouriers, type CourierDto } from '@/lib/courierApi'
import ViewIcon from '@/components/icons/ViewIcon'
import EditIcon from '@/components/icons/EditIcon'
import { Truck, Search } from 'lucide-react'

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
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 p-2" style={{ background: 'rgba(170, 51, 106, 0.1)' }}>
            <Truck size={28} style={{ color: 'var(--aima-primary)' }} />
          </div>
          <h2 className="mb-0" style={{ color: 'var(--aima-secondary)' }}>Courier</h2>
        </div>
      </div>
      <div className="card border-0 shadow-sm page-card">
        <div className="card-body">
          <div className="position-relative mb-3 d-inline-block" style={{ maxWidth: '400px' }}>
            <Search size={18} className="position-absolute top-50 translate-middle-y" style={{ left: 12, color: 'var(--aima-muted)' }} />
            <Input
              placeholder="Search by name, customer, address, contact..."
              className="form-control"
              style={{ paddingLeft: 36 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
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
                        <td className="fw-medium align-middle">{courier.name ?? '-'}</td>
                        <td className="align-middle">{courier.customerDto?.name ?? '-'}</td>
                        <td className="align-middle">{courier.contactNumber != null ? String(courier.contactNumber) : '-'}</td>
                        <td className="align-middle">{courier.address ?? '-'}</td>
                        <td className="align-middle">{courier.sentDate ?? '-'}</td>
                        <td className="align-middle">
                          <div className="d-flex align-items-center gap-1">
                            <Button variant="ghost" size="sm" className="p-1 d-inline-flex align-items-center" onClick={() => navigate(`/courier/${courier.id}`)} title="View details">
                              <ViewIcon size={20} className="text-primary" />
                            </Button>
                            <Button variant="ghost" size="sm" className="p-1 d-inline-flex align-items-center" onClick={() => navigate(`/courier/${courier.id}/edit`)} title="Edit">
                              <EditIcon size={18} className="text-dark" />
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
