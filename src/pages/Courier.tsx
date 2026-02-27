import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCouriersPage, type CourierDto } from '@/lib/courierApi'
import ViewIcon from '@/components/icons/ViewIcon'
import EditIcon from '@/components/icons/EditIcon'
import { Truck } from 'lucide-react'

export default function Courier() {
  const navigate = useNavigate()
  const [couriers, setCouriers] = useState<CourierDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(10)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getCouriersPage(pageNumber, pageSize, {
      isActive: true,
      name: searchQuery.trim() || undefined,
      sentDate: dateFilter.trim() || undefined,
    }).then((res) => {
      if (!cancelled) {
        setCouriers(res.content ?? [])
        setTotalElements(res.totalElements ?? 0)
        setTotalPages(res.totalPages ?? 0)
      }
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [pageNumber, pageSize, searchQuery, dateFilter])

  const goToPage = (p: number) => {
    if (p >= 1 && p <= totalPages) setPageNumber(p)
  }

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
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <Input
              placeholder="Search by name, customer, address, contact..."
              className="form-control rounded-3 bg-white"
              style={{
                border: '1px solid #dee2e6',
                height: '42px',
                maxWidth: '320px',
              }}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPageNumber(1) }}
            />
            <Input
              type="date"
              className="form-control rounded-3 bg-white"
              style={{
                border: '1px solid #dee2e6',
                height: '42px',
                width: '160px',
              }}
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPageNumber(1) }}
              title="Filter by sent date"
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
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {couriers.map((courier) => (
                      <tr key={courier.id}>
                        <td className="fw-medium align-middle">{courier.name ?? '-'}</td>
                        <td className="align-middle">{courier.customerDto?.name ?? '-'}</td>
                        <td className="align-middle">{courier.contactNumber != null ? String(courier.contactNumber) : '-'}</td>
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
              {couriers.length === 0 && !loading && (
                <p className="text-muted mb-0">No couriers found</p>
              )}
              {totalPages > 1 && (
                <div className="d-flex align-items-center justify-content-between mt-3">
                  <p className="text-muted small mb-0">
                    Page {pageNumber} of {totalPages} ({totalElements} total)
                  </p>
                  <div className="d-flex gap-1">
                    <Button type="button" variant="outline" size="sm" onClick={() => goToPage(pageNumber - 1)} disabled={pageNumber <= 1}>
                      Previous
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => goToPage(pageNumber + 1)} disabled={pageNumber >= totalPages}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

    </div>
  )
}
