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
import { Plus, CreditCard, Search } from 'lucide-react'
import EditIcon from '@/components/icons/EditIcon'
import Swal from 'sweetalert2'

export default function Payment() {
  const [list, setList] = useState<PaymentDto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<PaymentDto | null>(null)
  const [form, setForm] = useState({ name: '', isActive: true })
  const [success, setSuccess] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [searchName, setSearchName] = useState('')

  const load = () => {
    setLoading(true)
    setLoadError('')
    getAllPayments()
      .then((data) => {
        setList(data ?? [])
        setLoading(false)
      })
      .catch(() => {
        setList([])
        setLoading(false)
        setLoadError('Failed to load payments. Check backend is running.')
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
    setShowForm(true)
  }

  const openEdit = (p: PaymentDto) => {
    setEditing(p)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      await Swal.fire({ icon: 'error', title: 'Validation', text: 'Name is required.' })
      return
    }
    const nameTrimmed = form.name.trim()
    const nameLower = nameTrimmed.toLowerCase()
    const isDuplicate = list.some(
      (p) => (p.name || '').trim().toLowerCase() === nameLower && (editing ? p.id !== editing.id : true)
    )
    if (isDuplicate) {
      await Swal.fire({ icon: 'error', title: 'Duplicate', text: 'A payment type with this name already exists.' })
      return
    }
    if (editing) {
      const res = await updatePayment({ id: editing.id, name: nameTrimmed, isActive: editing.isActive ?? true })
      if (res.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
        closeForm()
        load()
        await Swal.fire({ icon: 'success', title: 'Saved', text: 'Payment updated successfully.' })
      } else {
        await Swal.fire({ icon: 'error', title: 'Error', text: res.error ?? 'Update failed.' })
      }
    } else {
      const res = await savePayment({ name: nameTrimmed, isActive: form.isActive })
      if (res.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
        closeForm()
        load()
        await Swal.fire({ icon: 'success', title: 'Saved', text: 'Payment added successfully.' })
      } else {
        await Swal.fire({ icon: 'error', title: 'Error', text: res.error ?? 'Save failed.' })
      }
    }
  }

  const handleToggleStatus = async (p: PaymentDto) => {
    const next = !(p.isActive ?? true)
    const action = next ? 'activate' : 'deactivate'
    const { isConfirmed } = await Swal.fire({
      title: 'Confirm',
      text: `Are you sure you want to ${action} "${p.name || 'this payment'}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
    })
    if (!isConfirmed) return
    const res = await updatePaymentStatus(p.id, next)
    if (res.success) load()
  }

  const filteredList = searchName.trim()
    ? list.filter((p) => (p.name || '').toLowerCase().includes(searchName.trim().toLowerCase()))
    : list

  const clearSearch = () => setSearchName('')

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 p-2" style={{ background: 'rgba(170, 51, 106, 0.1)' }}>
            <CreditCard size={28} style={{ color: 'var(--aima-primary)' }} />
          </div>
          <h2 className="mb-0" style={{ color: 'var(--aima-secondary)' }}>Payment</h2>
        </div>
        {!showForm && (
          <Button onClick={openAdd} style={{ backgroundColor: 'var(--aima-primary)' }}>
            <Plus size={18} className="me-1" />
            Add Payment
          </Button>
        )}
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">{editing ? 'Edit Payment' : 'Add Payment'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-5">
                  <label className="form-label">Name *</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Cash, Card, Bank"
                    required
                    className="form-control"
                  />
                  {form.name.trim() &&
                    list.some(
                      (p) =>
                        (p.name || '').trim().toLowerCase() === form.name.trim().toLowerCase() &&
                        (editing ? p.id !== editing.id : true)
                    ) && (
                      <p className="text-danger small mb-0 mt-1" role="alert">
                        Already have this payment
                      </p>
                    )}
                </div>
                <div className="col-12 d-flex align-items-end gap-2 pt-1">
                  <Button type="button" variant="outline" onClick={closeForm}>
                    Cancel
                  </Button>
                  <Button type="submit" style={{ backgroundColor: 'var(--aima-primary)' }}>
                    {editing ? 'Update' : 'Add'} Payment
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {!showForm && (
        <div className="card">
          <div className="card-body">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
              <h6 className="mb-0 fw-semibold">Payments</h6>
              <div className="d-flex align-items-center gap-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  style={{ maxWidth: 220 }}
                  placeholder="Search by name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => {}} title="Filter by name (type above)">
                  <Search size={18} />
                </Button>
                {searchName.trim() && (
                  <Button type="button" variant="ghost" size="sm" onClick={clearSearch}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
            {loadError && <div className="alert alert-warning py-2 mb-3">{loadError}</div>}
            {success && <div className="alert alert-success py-2 mb-3">Saved successfully.</div>}
            {loading ? (
              <p className="text-muted mb-0">Loading...</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Status</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map((p) => (
                      <tr key={p.id}>
                        <td className="fw-medium align-middle">{p.name}</td>
                        <td className="align-middle">
                          <div className="form-check form-switch mb-0 category-status-switch">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`pay-toggle-${p.id}`}
                              checked={p.isActive !== false}
                              onChange={() => handleToggleStatus(p)}
                              title={p.isActive !== false ? 'Turn off' : 'Turn on'}
                            />
                          </div>
                        </td>
                        <td className="text-end align-middle">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 d-inline-flex align-items-center justify-content-center"
                            style={{ minHeight: 36 }}
                            onClick={() => openEdit(p)}
                            title="Edit"
                          >
                            <EditIcon size={18} className="text-dark" style={{ marginTop: 3 }} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && filteredList.length === 0 && (
              <p className="text-muted mb-0">
                {searchName.trim() ? 'No payments match your search.' : 'No payment types. Click Add Payment to create one.'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
