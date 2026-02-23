import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { saveDealerConsignmentNote, getDealerConsignmentNotesPage, type DealerConsignmentNoteDto } from '@/lib/dealerConsignmentNoteApi'
import { getModelsPage, type ModelDto } from '@/lib/modelApi'
import { Eye, Plus, Trash2 } from 'lucide-react'

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
  const [viewNote, setViewNote] = useState<DealerConsignmentNoteDto | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError('')
    const validItems = form.items.filter((it) => it.modelId > 0 && (it.quantity ?? 1) > 0)
    if (validItems.length === 0) {
      setSaveError('Add at least one item with model and quantity.')
      return
    }
    const result = await saveDealerConsignmentNote({
      dealerCode: form.dealerCode.trim(),
      dealerName: form.dealerName.trim(),
      address: form.address.trim() || undefined,
      consignmentNoteNo: form.consignmentNoteNo.trim(),
      date: form.date || undefined,
      deliveryMode: form.deliveryMode.trim() || undefined,
      vehicleNo: form.vehicleNo.trim() || undefined,
      references: form.references.trim() || undefined,
      contactPerson: form.contactPerson.trim() || undefined,
      items: validItems.map((it) => ({
        modelId: it.modelId,
        quantity: it.quantity || 1,
        color: it.color?.trim() || undefined,
        itemCode: it.itemCode?.trim() || undefined,
        chassisNumber: it.chassisNumber?.trim() || undefined,
        motorNumber: it.motorNumber?.trim() || undefined,
      })),
    })
    if (result.success) {
      setSaveSuccess(true)
      setForm({ ...emptyForm, items: [{ modelId: 0, quantity: 1 }] })
      getDealerConsignmentNotesPage(1, 100, true).then((res) => res?.content && setNotes(res.content))
      setTimeout(() => setSaveSuccess(false), 3000)
    } else {
      setSaveError(result.error || 'Failed to save dealer consignment note')
    }
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Dealer Invoice (Consignment Note)</h2>
      </div>

      {/* Dealer Form */}
      <div className="card mb-4">
        <div className="card-header bg-info text-dark">
          <h5 className="mb-0">New Dealer Consignment Note</h5>
          <small>Record dealer stock receipt - increases stock</small>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="card-body">
            {saveError && <div className="alert alert-danger py-2 mb-3">{saveError}</div>}
            {saveSuccess && <div className="alert alert-success py-2 mb-3">Dealer consignment note saved successfully.</div>}
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
                <Input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} placeholder="Contact" className="form-control" />
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
            {form.items.map((it, idx) => (
              <div key={idx} className="row g-2 align-items-end mb-2 p-2 border rounded">
                <div className="col-md-4">
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
                  <label className="form-label small">Qty</label>
                  <Input type="number" min={1} value={it.quantity} onChange={(e) => updateItem(idx, { quantity: parseInt(e.target.value, 10) || 1 })} className="form-control form-control-sm" />
                </div>
                <div className="col-md-2">
                  <label className="form-label small">Color</label>
                  <Input value={it.color} onChange={(e) => updateItem(idx, { color: e.target.value })} placeholder="Color" className="form-control form-control-sm" />
                </div>
                <div className="col-md-2">
                  <label className="form-label small">Item Code</label>
                  <Input value={it.itemCode} onChange={(e) => updateItem(idx, { itemCode: e.target.value })} placeholder="Code" className="form-control form-control-sm" />
                </div>
                <div className="col-md-1">
                  <Button type="button" variant="outline" size="sm" className="p-1" onClick={() => removeItem(idx)} title="Remove">
                    <Trash2 size={18} className="text-danger" />
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="mb-3">
              <Plus size={18} className="me-1" />
              Add Item
            </Button>
          </div>
          <div className="card-footer">
            <Button type="submit" style={{ backgroundColor: '#AA336A' }}>
              Save Dealer Consignment Note
            </Button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body">
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
                        <td className="fw-medium">{n.consignmentNoteNo ?? '-'}</td>
                        <td>{n.dealerCode ?? '-'}</td>
                        <td>{n.dealerName ?? '-'}</td>
                        <td>{n.date ?? '-'}</td>
                        <td>{n.items?.length ?? 0} item(s)</td>
                        <td>
                          <Button variant="ghost" size="sm" className="p-1" onClick={() => setViewNote(n)} title="View">
                            <Eye size={20} className="text-primary" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredNotes.length === 0 && <p className="text-muted mb-0">No dealer consignment notes found</p>}
            </>
          )}
        </div>
      </div>

      {viewNote && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setViewNote(null)}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Dealer Consignment Note - {viewNote.consignmentNoteNo}</h5>
                <button type="button" className="btn-close" onClick={() => setViewNote(null)} aria-label="Close" />
              </div>
              <div className="modal-body">
                <h6 className="border-bottom pb-2 mb-3">Header</h6>
                <div className="row g-2 mb-4">
                  <div className="col-md-6"><strong>Dealer Code:</strong> {viewNote.dealerCode ?? '-'}</div>
                  <div className="col-md-6"><strong>Dealer Name:</strong> {viewNote.dealerName ?? '-'}</div>
                  <div className="col-md-6"><strong>Date:</strong> {viewNote.date ?? '-'}</div>
                  <div className="col-md-6"><strong>Contact Person:</strong> {viewNote.contactPerson ?? '-'}</div>
                  <div className="col-12"><strong>Address:</strong> {viewNote.address ?? '-'}</div>
                  <div className="col-md-6"><strong>Delivery Mode:</strong> {viewNote.deliveryMode ?? '-'}</div>
                  <div className="col-md-6"><strong>Vehicle No:</strong> {viewNote.vehicleNo ?? '-'}</div>
                  <div className="col-12"><strong>References:</strong> {viewNote.references ?? '-'}</div>
                </div>
                <h6 className="border-bottom pb-2 mb-3">Items</h6>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Model</th>
                        <th>Color</th>
                        <th>Item Code</th>
                        <th>Chassis</th>
                        <th>Motor</th>
                        <th>Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewNote.items?.map((it) => (
                        <tr key={it.id ?? Math.random()}>
                          <td>{it.modelDto?.name ?? '-'}</td>
                          <td>{it.color ?? '-'}</td>
                          <td>{it.itemCode ?? '-'}</td>
                          <td>{it.chassisNumber ?? '-'}</td>
                          <td>{it.motorNumber ?? '-'}</td>
                          <td>{it.quantity ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <Button variant="outline" onClick={() => setViewNote(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
