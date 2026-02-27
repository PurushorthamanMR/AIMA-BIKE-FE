import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { saveDealerConsignmentNote, updateDealerConsignmentNote, getDealerConsignmentNotesPage, getDealerConsignmentNoteById, type DealerConsignmentNoteDto } from '@/lib/dealerConsignmentNoteApi'
import { getModelsPage, type ModelDto } from '@/lib/modelApi'
import { Link } from 'react-router-dom'
import { Plus, Trash2, FileText } from 'lucide-react'
import ViewIcon from '@/components/icons/ViewIcon'
import EditIcon from '@/components/icons/EditIcon'
import Swal from 'sweetalert2'

interface FormItem {
  modelId: number
  modelName?: string
  quantity: number
  color?: string
  itemCode?: string
  chassisNumber?: string
  motorNumber?: string
}

const emptyForm = {
  dealerCode: '',
  dealerName: '',
  address: '',
  consignmentNoteNo: '',
  date: new Date().toISOString().split('T')[0],
  deliveryMode: '',
  vehicleNo: '',
  references: '',
  contactPerson: '',
  items: [{ modelId: 0, quantity: 1 }] as FormItem[],
}

export default function DealerInvoice() {
  const [notes, setNotes] = useState<DealerConsignmentNoteDto[]>([])
  const [models, setModels] = useState<ModelDto[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingModels, setLoadingModels] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [searchQuery, setSearchQuery] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    getDealerConsignmentNotesPage(1, 100, true).then((res) => {
      if (!cancelled && res?.content) setNotes(res.content)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoadingModels(true)
    getModelsPage(1, 200, true).then((list) => {
      if (!cancelled) setModels(list ?? [])
      setLoadingModels(false)
    })
    return () => { cancelled = true }
  }, [])

  const filteredNotes = notes.filter((n) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    const code = (n.dealerCode ?? '').toLowerCase()
    const name = (n.dealerName ?? '').toLowerCase()
    const consign = (n.consignmentNoteNo ?? '').toLowerCase()
    return code.includes(q) || name.includes(q) || consign.includes(q)
  })

  const addItem = () => {
    setForm((f) => ({ ...f, items: [...f.items, { modelId: 0, quantity: 1 }] }))
  }

  const removeItem = (idx: number) => {
    setForm((f) => ({
      ...f,
      items: f.items.filter((_, i) => i !== idx),
    }))
  }

  const updateItem = (idx: number, upd: Partial<FormItem>) => {
    setForm((f) => ({
      ...f,
      items: f.items.map((it, i) => (i === idx ? { ...it, ...upd } : it)),
    }))
  }

  const contactPersonError = useMemo(() => {
    const v = form.contactPerson.trim()
    if (!v) return null
    if (!/^\d{10}$/.test(v)) return 'Contact person must be exactly 10 digits.'
    return null
  }, [form.contactPerson])

  const savedChassisAndMotor = useMemo(() => {
    const chassisSet = new Set<string>()
    const motorSet = new Set<string>()
    notes.forEach((n) => {
      if (editingId != null && n.id === editingId) return
      ;(n.items ?? []).forEach((it) => {
        const c = (it.chassisNumber ?? '').trim().toLowerCase()
        const m = (it.motorNumber ?? '').trim().toLowerCase()
        if (c) chassisSet.add(c)
        if (m) motorSet.add(m)
      })
    })
    return { chassisSet, motorSet }
  }, [notes, editingId])

  const getItemDuplicateErrors = (idx: number) => {
    const items = form.items
    const chassis = (items[idx]?.chassisNumber ?? '').trim().toLowerCase()
    const motor = (items[idx]?.motorNumber ?? '').trim().toLowerCase()
    const chassisDupInForm = chassis && items.some((it, i) => i !== idx && (it.chassisNumber ?? '').trim().toLowerCase() === chassis)
    const motorDupInForm = motor && items.some((it, i) => i !== idx && (it.motorNumber ?? '').trim().toLowerCase() === motor)
    const chassisDupSaved = chassis && savedChassisAndMotor.chassisSet.has(chassis)
    const motorDupSaved = motor && savedChassisAndMotor.motorSet.has(motor)
    return {
      chassis: chassisDupInForm || chassisDupSaved,
      motor: motorDupInForm || motorDupSaved,
    }
  }

  const handleEditClick = async (note: DealerConsignmentNoteDto) => {
    const full = await getDealerConsignmentNoteById(note.id)
    if (!full) return
    const items = full.items ?? []
    const formItems: FormItem[] = items.length > 0
      ? items.map((it) => {
          const parts = (it.itemCode ?? '').split('-')
          const code = parts.length > 1 ? parts.slice(0, -1).join('-') : (it.itemCode ?? '')
          return {
            modelId: it.modelId ?? 0,
            quantity: it.quantity ?? 1,
            color: (it.color ?? '').toUpperCase(),
            itemCode: code,
            chassisNumber: it.chassisNumber ?? '',
            motorNumber: it.motorNumber ?? '',
          }
        })
      : [{ modelId: 0, quantity: 1 }]
    setForm({
      dealerCode: full.dealerCode ?? '',
      dealerName: full.dealerName ?? '',
      address: full.address ?? '',
      consignmentNoteNo: full.consignmentNoteNo ?? '',
      date: full.date ?? new Date().toISOString().split('T')[0],
      deliveryMode: full.deliveryMode ?? '',
      vehicleNo: full.vehicleNo ?? '',
      references: full.references ?? '',
      contactPerson: full.contactPerson ?? '',
      items: formItems,
    })
    setEditingId(full.id)
    setSaveError('')
    setShowForm(true)
  }

  const mapItemsForApi = (validItems: FormItem[]) =>
    validItems.map((it) => {
      const code = (it.itemCode ?? '').trim()
      const colorFull = (it.color ?? '').trim().toUpperCase()
      const colorShort = colorFull.length > 5 ? colorFull.substring(0, 5) : colorFull
      const itemCodeCombined = code && colorShort ? `${code}-${colorShort}` : code || undefined
      return {
        modelId: it.modelId,
        quantity: it.quantity || 1,
        color: colorFull || undefined,
        itemCode: itemCodeCombined,
        chassisNumber: it.chassisNumber?.trim() || undefined,
        motorNumber: it.motorNumber?.trim() || undefined,
      }
    })

  const hasItemDuplicates = form.items.some((_, idx) => {
    const d = getItemDuplicateErrors(idx)
    return d.chassis || d.motor
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError('')
    if (contactPersonError) {
      setSaveError(contactPersonError)
      return
    }
    if (hasItemDuplicates) {
      setSaveError('Remove duplicate chassis or motor numbers in items.')
      return
    }
    const validItems = form.items.filter((it) => it.modelId > 0)
    if (validItems.length === 0) {
      setSaveError('Add at least one item with model.')
      return
    }
    const payload = {
      dealerCode: form.dealerCode.trim(),
      dealerName: form.dealerName.trim(),
      address: form.address.trim() || undefined,
      consignmentNoteNo: form.consignmentNoteNo.trim(),
      date: form.date || undefined,
      deliveryMode: form.deliveryMode.trim() || undefined,
      vehicleNo: form.vehicleNo.trim() || undefined,
      references: form.references.trim() || undefined,
      contactPerson: form.contactPerson.trim() || undefined,
      items: mapItemsForApi(validItems),
    }
    const result = editingId
      ? await updateDealerConsignmentNote({ ...payload, id: editingId })
      : await saveDealerConsignmentNote(payload)
    if (result.success) {
      setSaveSuccess(true)
      setForm({ ...emptyForm, items: [{ modelId: 0, quantity: 1 }] })
      setShowForm(false)
      setEditingId(null)
      getDealerConsignmentNotesPage(1, 100, true).then((res) => res?.content && setNotes(res.content))
      setTimeout(() => setSaveSuccess(false), 3000)
      await Swal.fire({
        icon: 'success',
        title: editingId ? 'Successfully Updated' : 'Successfully Saved',
        text: editingId ? 'Dealer updated successfully.' : 'Dealer saved successfully.',
      })
    } else {
      setSaveError(result.error || (editingId ? 'Failed to update' : 'Failed to save dealer'))
    }
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 p-2" style={{ background: 'rgba(170, 51, 106, 0.1)' }}>
            <FileText size={28} style={{ color: 'var(--aima-primary)' }} />
          </div>
          <h2 className="mb-0" style={{ color: 'var(--aima-secondary)' }}>Dealer</h2>
        </div>
        {!showForm && (
          <Button onClick={() => { setShowForm(true); setSaveError(''); setEditingId(null); setForm({ ...emptyForm, items: [{ modelId: 0, quantity: 1 }] }) }} style={{ backgroundColor: 'var(--aima-primary)' }}>
            <Plus size={18} className="me-1" />
            Add Dealer
          </Button>
        )}
      </div>

      {/* Dealer Form - inline, like Category page style */}
      {showForm && (
      <div className="card mb-4">
        <form onSubmit={handleSubmit}>
          <div className="card-body">
            {saveError && <div className="alert alert-danger py-2 mb-3">{saveError}</div>}
            {saveSuccess && <div className="alert alert-success py-2 mb-3">Dealer saved successfully.</div>}
            {editingId && <h6 className="text-muted mb-3">Edit Dealer</h6>}
            <h6 className="border-bottom pb-2 mb-3">Header</h6>
            <div className="row g-2 mb-4">
              <div className="col-md-6">
                <label className="form-label">Dealer Code <span className="text-danger">*</span></label>
                <Input value={form.dealerCode} onChange={(e) => setForm({ ...form, dealerCode: e.target.value })} placeholder="Dealer code" required className="form-control" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Dealer Name <span className="text-danger">*</span></label>
                <Input value={form.dealerName} onChange={(e) => setForm({ ...form, dealerName: e.target.value })} placeholder="Dealer name" required className="form-control" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Consignment Note No <span className="text-danger">*</span></label>
                <Input value={form.consignmentNoteNo} onChange={(e) => setForm({ ...form, consignmentNoteNo: e.target.value })} placeholder="CN number" required className="form-control" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Date</label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="form-control" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Address</label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" className="form-control" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Contact Person</label>
                <Input
                  type="tel"
                  inputMode="numeric"
                  value={form.contactPerson}
                  onChange={(e) => setForm({ ...form, contactPerson: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder="10 digits only"
                  className="form-control"
                  maxLength={10}
                />
                {contactPersonError && <p className="text-danger small mb-0 mt-1">{contactPersonError}</p>}
              </div>
              <div className="col-md-6">
                <label className="form-label">Delivery Mode</label>
                <Input value={form.deliveryMode} onChange={(e) => setForm({ ...form, deliveryMode: e.target.value })} placeholder="e.g. Truck, Van" className="form-control" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Vehicle No</label>
                <Input value={form.vehicleNo} onChange={(e) => setForm({ ...form, vehicleNo: e.target.value })} placeholder="Vehicle number" className="form-control" />
              </div>
              <div className="col-md-6">
                <label className="form-label">References</label>
                <Input value={form.references} onChange={(e) => setForm({ ...form, references: e.target.value })} placeholder="References" className="form-control" />
              </div>
            </div>

            <h6 className="border-bottom pb-2 mb-3">Items</h6>
            {form.items.map((it, idx) => {
              const dup = getItemDuplicateErrors(idx)
              return (
                <div key={idx} className="row g-2 align-items-end mb-2 p-2 border rounded">
                  <div className="col-md-3">
                    <label className="form-label small">Model *</label>
                    <select
                      className="form-select form-select-sm"
                      value={it.modelId}
                      onChange={(e) => updateItem(idx, { modelId: parseInt(e.target.value, 10) || 0 })}
                      required
                    >
                      <option value={0}>Select model</option>
                      {models.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small">Color</label>
                    <Input value={it.color} onChange={(e) => updateItem(idx, { color: e.target.value.toUpperCase() })} placeholder="Color (saved as UPPERCASE)" className="form-control form-control-sm" />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small">Item Code</label>
                    <Input value={it.itemCode} onChange={(e) => updateItem(idx, { itemCode: e.target.value })} placeholder="Code only (e.g. A500)" className="form-control form-control-sm" />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small">Chassis Number</label>
                    <Input value={it.chassisNumber ?? ''} onChange={(e) => updateItem(idx, { chassisNumber: e.target.value })} placeholder="Chassis" className="form-control form-control-sm" />
                    {dup.chassis && <p className="text-danger small mb-0 mt-1">Chassis number is duplicate in this invoice.</p>}
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small">Motor Number</label>
                    <Input value={it.motorNumber ?? ''} onChange={(e) => updateItem(idx, { motorNumber: e.target.value })} placeholder="Motor" className="form-control form-control-sm" />
                    {dup.motor && <p className="text-danger small mb-0 mt-1">Motor number is duplicate in this invoice.</p>}
                  </div>
                  <div className="col-md-1">
                    <Button type="button" variant="outline" size="sm" className="p-1" onClick={() => removeItem(idx)} title="Remove">
                      <Trash2 size={18} className="text-danger" />
                    </Button>
                  </div>
                </div>
              )
            })}
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="mb-3">
              <Plus size={18} className="me-1" />
              Add Item
            </Button>
          </div>
          <div className="card-footer d-flex justify-content-between align-items-center">
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>
              Cancel
            </Button>
            <Button type="submit" style={{ backgroundColor: 'var(--aima-primary)' }} disabled={!!contactPersonError || hasItemDuplicates}>
              {editingId ? 'Update Dealer' : 'Save Dealer'}
            </Button>
          </div>
        </form>
      </div>
      )}

      {/* Table - only show when form is hidden */}
      {!showForm && (
      <div className="card">
        <div className="card-body">
          {saveSuccess && <div className="alert alert-success py-2 mb-3">Dealer saved successfully.</div>}
          <Input
            placeholder="Search by dealer code, name, consignment no..."
            className="mb-3"
            style={{ maxWidth: '400px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {loading ? (
            <p className="text-muted mb-0">Loading...</p>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Consignment Note No</th>
                      <th>Dealer Code</th>
                      <th>Dealer Name</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNotes.map((n) => (
                      <tr key={n.id}>
                        <td className="fw-medium align-middle">{n.consignmentNoteNo ?? '-'}</td>
                        <td className="align-middle">{n.dealerCode ?? '-'}</td>
                        <td className="align-middle">{n.dealerName ?? '-'}</td>
                        <td className="align-middle">{n.date ?? '-'}</td>
                        <td className="align-middle">{n.items?.length ?? 0} item(s)</td>
                        <td className="align-middle">
                          <div className="d-flex align-items-center gap-1">
                            <Button variant="ghost" size="sm" className="p-1 d-inline-flex align-items-center" title="Edit" onClick={() => handleEditClick(n)}>
                              <EditIcon size={20} className="text-dark" />
                            </Button>
                            <Link to={`/dealer-invoice/${n.id}`} className="text-decoration-none d-inline-flex align-items-center">
                              <Button variant="ghost" size="sm" className="p-1 d-inline-flex align-items-center" title="View">
                                <ViewIcon size={20} className="text-primary" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredNotes.length === 0 && <p className="text-muted mb-0">No dealer notes found</p>}
            </>
          )}
        </div>
      </div>
      )}
    </div>
  )
}
