import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { getCourierById, type CourierDto } from '@/lib/courierApi'
import { ArrowLeft, Pencil } from 'lucide-react'

export default function CourierDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [courier, setCourier] = useState<CourierDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const courierId = parseInt(id ?? '0', 10)
    if (!courierId) {
      setLoading(false)
      return
    }
    getCourierById(courierId).then((data) => {
      if (!cancelled) {
        setCourier(data ?? null)
      }
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [id])

  if (loading) return <p className="text-muted">Loading courier...</p>
  if (!courier) return <p className="text-muted">Courier not found.</p>

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Courier Details</h2>
        <div className="d-flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/courier/${id}/edit`)}>
            <Pencil size={16} className="me-1" />
            Edit (Mark Received)
          </Button>
          <Button variant="outline" onClick={() => navigate('/courier')}>
            <ArrowLeft size={18} className="me-1" />
            Back to list
          </Button>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title mb-4">Courier - {courier.name}</h5>
          <h6 className="border-bottom pb-2 mb-3">Courier Information</h6>
          <div className="row g-2 mb-4">
            <div className="col-md-6"><strong>Name:</strong> {courier.name ?? '-'}</div>
            <div className="col-md-6"><strong>Category:</strong> {courier.categoryDto?.name ?? '-'}</div>
            <div className="col-md-6"><strong>Customer:</strong> {courier.customerDto?.name ?? '-'}</div>
            <div className="col-md-6"><strong>Contact Number:</strong> {courier.contactNumber != null ? String(courier.contactNumber) : '-'}</div>
            <div className="col-12"><strong>Address:</strong> {courier.address ?? '-'}</div>
            <div className="col-md-6"><strong>Sent Date:</strong> {courier.sentDate ?? '-'}</div>
            <div className="col-md-6"><strong>Received Date:</strong> {courier.receivedDate ?? '-'}</div>
            <div className="col-md-6"><strong>Receiver Name:</strong> {courier.receivername ?? '-'}</div>
            <div className="col-md-6"><strong>Receiver NIC:</strong> {courier.nic ?? '-'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
