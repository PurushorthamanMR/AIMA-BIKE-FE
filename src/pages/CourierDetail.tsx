import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCourierById, markCourierReceived, type CourierDto } from '@/lib/courierApi'
import { ArrowLeft, PackageCheck } from 'lucide-react'
import Swal from 'sweetalert2'

export default function CourierDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [courier, setCourier] = useState<CourierDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [receiveSaving, setReceiveSaving] = useState(false)
  const [receiveForm, setReceiveForm] = useState({
    receivedDate: new Date().toISOString().split('T')[0],
    receivername: '',
    nic: '',
  })

  const fetchCourier = () => {
    const courierId = parseInt(id ?? '0', 10)
    if (!courierId) return
    getCourierById(courierId).then((data) => setCourier(data ?? null))
  }

  useEffect(() => {
    let cancelled = false
    const courierId = parseInt(id ?? '0', 10)
    if (!courierId) {
      setLoading(false)
      return
    }
    getCourierById(courierId).then((data) => {
      if (!cancelled) setCourier(data ?? null)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [id])

  const openReceiveModal = () => {
    setReceiveForm({
      receivedDate: courier?.receivedDate ?? new Date().toISOString().split('T')[0],
      receivername: courier?.receivername ?? '',
      nic: courier?.nic ?? '',
    })
    setShowReceiveModal(true)
  }

  const handleReceiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const courierId = parseInt(id ?? '0', 10)
    if (!courierId) return
    setReceiveSaving(true)
    const result = await markCourierReceived({
      courierId,
      receivedDate: receiveForm.receivedDate || undefined,
      receivername: receiveForm.receivername.trim() || undefined,
      nic: receiveForm.nic.trim() || undefined,
    })
    setReceiveSaving(false)
    if (result.success) {
      await Swal.fire({ icon: 'success', title: 'Success', text: 'Courier marked as received.' })
      setShowReceiveModal(false)
      fetchCourier()
    } else {
      await Swal.fire({ icon: 'error', title: 'Error', text: result.error ?? 'Failed to mark as received' })
    }
  }

  if (loading) return <p className="text-muted">Loading courier...</p>
  if (!courier) return <p className="text-muted">Courier not found.</p>

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 p-2" style={{ background: 'rgba(170, 51, 106, 0.1)' }}>
            <PackageCheck size={28} style={{ color: 'var(--aima-primary)' }} />
          </div>
          <h2 className="mb-0" style={{ color: 'var(--aima-secondary)' }}>Courier Details</h2>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline" onClick={() => navigate('/courier')}>
            <ArrowLeft size={18} className="me-1" />
            Back
          </Button>
          <Button style={{ backgroundColor: 'var(--aima-primary)' }} onClick={openReceiveModal}>
            <PackageCheck size={18} className="me-1" />
            Receive End
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

      {/* Receive End Modal */}
      {showReceiveModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowReceiveModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h2 className="modal-title mb-0">Receive End</h2>
                <button type="button" className="btn-close" onClick={() => setShowReceiveModal(false)} aria-label="Close" />
              </div>
              <div className="modal-body pt-2">
                <p className="text-muted mb-4">Mark courier as received. Uses POST /courier/received API.</p>
                <form onSubmit={handleReceiveSubmit}>
                  <div className="row g-2 mb-3">
                    <div className="col-12">
                      <label className="form-label">Received Date</label>
                      <Input type="date" className="form-control" value={receiveForm.receivedDate} onChange={(e) => setReceiveForm({ ...receiveForm, receivedDate: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Receiver Name</label>
                      <Input className="form-control" value={receiveForm.receivername} onChange={(e) => setReceiveForm({ ...receiveForm, receivername: e.target.value })} placeholder="Receiver name" />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Receiver NIC</label>
                      <Input className="form-control" value={receiveForm.nic} onChange={(e) => setReceiveForm({ ...receiveForm, nic: e.target.value })} placeholder="NIC number" />
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-4">
                    <Button type="submit" disabled={receiveSaving} style={{ backgroundColor: 'var(--aima-primary)' }}>
                      {receiveSaving ? 'Saving...' : 'Mark Received'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowReceiveModal(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
