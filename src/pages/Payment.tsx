import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getAllPayments,
  savePayment,
  updatePayment,
  updatePaymentStatus,
  type PaymentDto,
} from '@/lib/paymentApi'
import { Pencil, Plus } from 'lucide-react'

export default function Payment() {
  const [list, setList] = useState<PaymentDto[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<PaymentDto | null>(null)
  const [form, setForm] = useState({ name: '', isActive: true })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const load = () => {
    setLoading(true)
    getAllPayments().then((data) => {
      setList(data ?? [])
      setLoading(false)
    })
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (editing) {
      setForm({ name: editing.name ?? '', isActive: editing.isActive ?? true })
    } else {
      setForm({ name: '', isActive: true })
    }
  }, [editing])

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', isActive: true })
    setError('')
    setShowModal(true)
  }

  const openEdit = (p: PaymentDto) => {
    setEditing(p)
    setError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) {
      setError('Name is required')
      return
    }
    if (editing) {
      const res = await updatePayment({ id: editing.id, name: form.name.trim(), isActive: form.isActive })
      if (res.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
        closeModal()
        load()
      } else {
        setError(res.error ?? 'Update failed')
      }
    } else {
      const res = await savePayment({ name: form.name.trim(), isActive: form.isActive })
      if (res.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
        closeModal()
        load()
      } else {
        setError(res.error ?? 'Save failed')
      }
    }
  }

  const handleToggleStatus = async (p: PaymentDto) => {
    const next = !(p.isActive ?? true)
    const res = await updatePaymentStatus(p.id, next)
    if (res.success) load()
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Payment</h2>
        <Button onClick={openAdd} style={{ backgroundColor: '#AA336A' }}>
          <Plus size={18} className="me-1" />
          Add Payment
        </Button>
      </div>

      <div className="card">
        <div className="card-body">
          {success && <div className="alert alert-success py-2 mb-3">Saved successfully.</div>}
          {loading ? (
            <p className="text-muted mb-0">Loading...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td className="fw-medium">{p.name}</td>
                      <td>
                        <span className={`badge ${p.isActive !== false ? 'bg-success' : 'bg-secondary'}`}>
                          {p.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="me-1"
                          onClick={() => handleToggleStatus(p)}
                          title={p.isActive !== false ? 'Set inactive' : 'Set active'}
                        >
                          {p.isActive !== false ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="ghost" size="sm" className="p-1" onClick={() => openEdit(p)} title="Edit">
                          <Pencil size={18} className="text-primary" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && list.length === 0 && (
            <p className="text-muted mb-0">No payment types. Click Add Payment to create one.</p>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeModal}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h2 className="modal-title mb-0">{editing ? 'Edit Payment' : 'Add Payment'}</h2>
                <button type="button" className="btn-close" onClick={closeModal} aria-label="Close" />
              </div>
              <div className="modal-body pt-2">
                <form onSubmit={handleSubmit}>
                  {error && <div className="alert alert-danger py-2">{error}</div>}
                  <div className="mb-3">
                    <label className="form-label">Name *</label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Cash, Card, Bank"
                      required
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="payment-active"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="payment-active">
                      Active
                    </label>
                  </div>
                  <div className="d-flex gap-2 justify-content-end">
                    <Button type="button" variant="outline" onClick={closeModal}>
                      Cancel
                    </Button>
                    <Button type="submit" style={{ backgroundColor: '#AA336A' }}>
                      {editing ? 'Update' : 'Add'} Payment
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
