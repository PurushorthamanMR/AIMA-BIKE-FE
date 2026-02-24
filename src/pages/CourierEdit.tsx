import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCourierById, markCourierReceived } from '@/lib/courierApi'
import { ArrowLeft } from 'lucide-react'
import Swal from 'sweetalert2'

export default function CourierEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [receivedDate, setReceivedDate] = useState('')
  const [receivername, setReceivername] = useState('')
  const [nic, setNic] = useState('')

  useEffect(() => {
    let cancelled = false
    const courierId = parseInt(id ?? '0', 10)
    if (!courierId) {
      setLoading(false)
      return
    }
    getCourierById(courierId).then((courier) => {
      if (!cancelled && courier) {
        setReceivedDate(courier.receivedDate ?? new Date().toISOString().split('T')[0])
        setReceivername(courier.receivername ?? '')
        setNic(courier.nic ?? '')
      }
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const courierId = parseInt(id ?? '0', 10)
    if (!courierId) return
    setError('')
    setSaving(true)
    const result = await markCourierReceived({
      courierId,
      receivedDate: receivedDate || undefined,
      receivername: receivername.trim() || undefined,
      nic: nic.trim() || undefined,
    })
    setSaving(false)
    if (result.success) {
      await Swal.fire({ icon: 'success', title: 'Success', text: 'Courier marked as received.' })
      navigate(`/courier/${id}`)
    } else {
      setError(result.error ?? 'Failed to save')
    }
  }

  if (loading) return <p className="text-muted">Loading...</p>

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Mark Courier Received</h2>
        <Button variant="outline" onClick={() => navigate(`/courier/${id}`)}>
          <ArrowLeft size={18} className="me-1" />
          Back
        </Button>
      </div>
      <div className="card">
        <div className="card-body">
          <p className="text-muted mb-4">Update received details for courier #{id}. This uses the /courier/received API.</p>
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <label className="form-label">Received Date</label>
                <Input type="date" className="form-control" value={receivedDate} onChange={(e) => setReceivedDate(e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Receiver Name</label>
                <Input className="form-control" value={receivername} onChange={(e) => setReceivername(e.target.value)} placeholder="Receiver name" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Receiver NIC</label>
                <Input className="form-control" value={nic} onChange={(e) => setNic(e.target.value)} placeholder="NIC number" />
              </div>
            </div>
            <div className="d-flex gap-2 mt-4">
              <Button type="submit" disabled={saving} style={{ backgroundColor: '#AA336A' }}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(`/courier/${id}`)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
