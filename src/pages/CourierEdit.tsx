import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCourierById, updateCourier } from '@/lib/courierApi'
import { getCategoriesPage, type CategoryDto } from '@/lib/categoryApi'
import { getCustomersPage, type CustomerDto } from '@/lib/customerApi'
import { ArrowLeft, Pencil } from 'lucide-react'
import Swal from 'sweetalert2'

export default function CourierEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [customers, setCustomers] = useState<CustomerDto[]>([])
  const [form, setForm] = useState({
    name: '',
    address: '',
    categoryId: 0,
    customerId: 0,
    contactNumber: '',
    sentDate: '',
  })

  useEffect(() => {
    let cancelled = false
    const courierId = parseInt(id ?? '0', 10)
    if (!courierId) {
      setLoading(false)
      return
    }
    Promise.all([
      getCourierById(courierId),
      getCategoriesPage(1, 100, true),
      getCustomersPage(1, 500, true),
    ]).then(([courier, cats, custRes]) => {
      if (cancelled) return
      if (courier) {
        setForm({
          name: courier.name ?? '',
          address: courier.address ?? '',
          categoryId: courier.categoryId ?? 0,
          customerId: courier.customerId ?? 0,
          contactNumber: courier.contactNumber != null ? String(courier.contactNumber) : '',
          sentDate: courier.sentDate ?? new Date().toISOString().split('T')[0],
        })
      }
      setCategories(cats ?? [])
      setCustomers(custRes?.content ?? [])
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
    const parseNum = (s: string) => { const n = parseInt(String(s || ''), 10); return !isNaN(n) ? n : undefined }
    const result = await updateCourier({
      id: courierId,
      name: form.name.trim() || undefined,
      address: form.address.trim() || undefined,
      categoryId: form.categoryId || undefined,
      customerId: form.customerId || undefined,
      contactNumber: parseNum(form.contactNumber),
      sentDate: form.sentDate || undefined,
    })
    setSaving(false)
    if (result.success) {
      await Swal.fire({ icon: 'success', title: 'Success', text: 'Courier updated successfully.' })
      navigate(`/courier/${id}`)
    } else {
      setError(result.error ?? 'Failed to update')
    }
  }

  if (loading) return <p className="text-muted">Loading...</p>

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 p-2" style={{ background: 'rgba(170, 51, 106, 0.1)' }}>
            <Pencil size={28} style={{ color: 'var(--aima-primary)' }} />
          </div>
          <h2 className="mb-0" style={{ color: 'var(--aima-secondary)' }}>Edit Courier</h2>
        </div>
        <Button variant="outline" onClick={() => navigate('/courier')}>
          <ArrowLeft size={18} className="me-1" />
          Back
        </Button>
      </div>
      <div className="card">
        <div className="card-body">
          <p className="text-muted mb-4">Update courier details. Uses POST /courier/update API.</p>
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <label className="form-label">Name <span className="text-danger">*</span></label>
                <Input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Courier/item name" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Customer <span className="text-danger">*</span></label>
                <select
                  className="form-select"
                  value={form.customerId}
                  onChange={(e) => setForm({ ...form, customerId: parseInt(e.target.value, 10) || 0 })}
                  required
                >
                  <option value={0}>Select customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}{c.contactNumber ? ` - ${c.contactNumber}` : ''}{c.chassisNumber ? ` - ${c.chassisNumber}` : ''}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Category <span className="text-danger">*</span></label>
                <select
                  className="form-select"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: parseInt(e.target.value, 10) || 0 })}
                  required
                >
                  <option value={0}>Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Contact Number</label>
                <Input
                  type="tel"
                  className="form-control"
                  value={form.contactNumber}
                  onChange={(e) => setForm({ ...form, contactNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  onKeyDown={(e) => { if (!/^\d$/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) e.preventDefault() }}
                  placeholder="10 numbers only"
                  maxLength={10}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Sent Date</label>
                <Input type="date" className="form-control" value={form.sentDate} onChange={(e) => setForm({ ...form, sentDate: e.target.value })} />
              </div>
              <div className="col-12">
                <label className="form-label">Address <span className="text-danger">*</span></label>
                <Input className="form-control" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Delivery address" required />
              </div>
            </div>
            <div className="d-flex gap-2 mt-4">
              <Button type="submit" disabled={saving} style={{ backgroundColor: 'var(--aima-primary)' }}>
                {saving ? 'Saving...' : 'Update Courier'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/courier')}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
