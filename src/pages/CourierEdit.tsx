import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCourierById, updateCourier, markCourierReceived, type CourierDto } from '@/lib/courierApi'
import { getCategoriesPage, type CategoryDto } from '@/lib/categoryApi'
import { getCustomersByStatus, type CustomerDto } from '@/lib/customerApi'
import { isValidSriLankaNIC } from '@/lib/nicUtils'
import { ArrowLeft, Pencil, PackageCheck } from 'lucide-react'
import Swal from 'sweetalert2'
import { SearchableSelect } from '@/components/SearchableSelect'

export default function CourierEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [receiveSaving, setReceiveSaving] = useState(false)
  const [error, setError] = useState('')
  const [courier, setCourier] = useState<CourierDto | null>(null)
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [customers, setCustomers] = useState<CustomerDto[]>([])
  const [showReceiveForm, setShowReceiveForm] = useState(false)
  const [nicError, setNicError] = useState('')
  const [receiveForm, setReceiveForm] = useState({
    receivedDate: new Date().toISOString().split('T')[0],
    receivername: '',
    nic: '',
  })
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
      getCustomersByStatus('pending', 1, 500, true),
    ]).then(([courierData, cats, pendingRes]) => {
      if (cancelled) return
      if (courierData) {
        setCourier(courierData)
        setForm({
          name: courierData.name ?? '',
          address: courierData.address ?? '',
          categoryId: courierData.categoryId ?? 0,
          customerId: courierData.customerId ?? 0,
          contactNumber: courierData.contactNumber != null ? String(courierData.contactNumber) : '',
          sentDate: courierData.sentDate ?? new Date().toISOString().split('T')[0],
        })
        setReceiveForm({
          receivedDate: courierData.receivedDate ?? new Date().toISOString().split('T')[0],
          receivername: courierData.receivername ?? '',
          nic: courierData.nic ?? '',
        })
        // Customer dropdown: only pending (not received/complete). Include current courier's customer if not in list (e.g. already complete).
        let customerList: CustomerDto[] = pendingRes?.content ?? []
        const currentCustomerId = courierData.customerId ?? courierData.customerDto?.id
        if (currentCustomerId && !customerList.some((c) => c.id === currentCustomerId) && courierData.customerDto) {
          const curr = courierData.customerDto as CustomerDto
          customerList = [{ ...curr, id: curr.id, name: curr.name ?? 'Customer' }, ...customerList]
        }
        setCustomers(customerList)
      } else {
        setCustomers(pendingRes?.content ?? [])
      }
      setCategories(cats ?? [])
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

  const hasReceivedData = courier && (
    (courier.receivedDate && String(courier.receivedDate).trim() !== '') ||
    (courier.receivername && String(courier.receivername).trim() !== '') ||
    (courier.nic && String(courier.nic).trim() !== '')
  )
  const canMarkReceived = !hasReceivedData

  const handleReceiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const courierId = parseInt(id ?? '0', 10)
    if (!courierId) return
    const nicTrimmed = receiveForm.nic.trim()
    if (nicTrimmed && !isValidSriLankaNIC(nicTrimmed)) {
      setNicError('NIC must be Sri Lanka format: old (9 digits + V or X) or new (12 digits).')
      return
    }
    setNicError('')
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
      setShowReceiveForm(false)
      setNicError('')
      getCourierById(courierId).then((data) => setCourier(data ?? null))
    } else {
      await Swal.fire({ icon: 'error', title: 'Error', text: result.error ?? 'Failed to mark as received' })
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
                <SearchableSelect
                  options={customers.map((c) => ({
                    value: c.id,
                    label: [c.name, c.contactNumber ? String(c.contactNumber) : '', c.chassisNumber ?? ''].filter(Boolean).join(' - '),
                  }))}
                  value={form.customerId}
                  onChange={(v) => setForm({ ...form, customerId: v })}
                  placeholder="Select customer"
                  required
                />
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
            <div className="d-flex flex-wrap gap-2 mt-4 align-items-center">
              <Button type="submit" disabled={saving} style={{ backgroundColor: 'var(--aima-primary)' }}>
                {saving ? 'Saving...' : 'Update Courier'}
              </Button>
              {canMarkReceived && !showReceiveForm && (
                <Button
                  type="button"
                  variant="outline"
                  style={{ borderColor: 'var(--aima-accent)', color: 'var(--aima-accent)' }}
                  onClick={() => setShowReceiveForm(true)}
                >
                  <PackageCheck size={18} className="me-1" />
                  Mark Received
                </Button>
              )}
              {canMarkReceived && showReceiveForm && (
                <>
                  <span className="small text-muted me-1">Receive:</span>
                  <Input
                    type="date"
                    className="form-control form-control-sm d-inline-block"
                    style={{ width: '140px' }}
                    value={receiveForm.receivedDate}
                    onChange={(e) => setReceiveForm({ ...receiveForm, receivedDate: e.target.value })}
                  />
                  <Input
                    className="form-control form-control-sm d-inline-block"
                    style={{ width: '120px' }}
                    placeholder="Receiver name"
                    value={receiveForm.receivername}
                    onChange={(e) => setReceiveForm({ ...receiveForm, receivername: e.target.value })}
                  />
                  <div className="d-inline-block align-top">
                    <Input
                      className={`form-control form-control-sm d-inline-block ${nicError ? 'is-invalid' : ''}`}
                      style={{ width: '120px' }}
                      placeholder="NIC (9 digits+V/X or 12 digits)"
                      value={receiveForm.nic}
                      onChange={(e) => {
                        setReceiveForm({ ...receiveForm, nic: e.target.value })
                        if (nicError) setNicError('')
                      }}
                    />
                    {nicError && <p className="text-danger small mb-0 mt-1" style={{ whiteSpace: 'nowrap' }}>{nicError}</p>}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={receiveSaving}
                    style={{ backgroundColor: 'var(--aima-accent)', color: '#fff', border: 'none' }}
                    onClick={handleReceiveSubmit}
                  >
                    {receiveSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => { setShowReceiveForm(false); setNicError(''); }}>
                    Cancel
                  </Button>
                </>
              )}
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
