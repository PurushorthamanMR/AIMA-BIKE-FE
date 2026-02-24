import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { saveTransfer, getTransfers, type TransferDto } from '@/lib/transferApi'
import { getStocksPage, type StockDto } from '@/lib/stockApi'
import { useAuth } from '@/hooks/useAuth'
import { Eye, Plus } from 'lucide-react'
import Swal from 'sweetalert2'

const emptyForm = {
  stockId: 0,
  quantity: 1,
  companyName: '',
  contactNumber: '',
  address: '',
  deliveryDetails: '',
}

export default function Transfer() {
  const { user } = useAuth()
  const [transfers, setTransfers] = useState<TransferDto[]>([])
  const [stocks, setStocks] = useState<StockDto[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingStocks, setLoadingStocks] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewTransfer, setViewTransfer] = useState<TransferDto | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    let cancelled = false
    getTransfers().then((list) => {
      if (!cancelled) setTransfers(list ?? [])
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoadingStocks(true)
    getStocksPage(1, 200).then((list) => {
      if (!cancelled) setStocks(list ?? [])
      setLoadingStocks(false)
    })
    return () => { cancelled = true }
  }, [])

  const filteredTransfers = transfers.filter((t) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    const company = (t.companyName ?? '').toLowerCase()
    const address = (t.address ?? '').toLowerCase()
    const stock = (t.stockDto?.name ?? t.stockDto?.modelDto?.name ?? '').toLowerCase()
    return company.includes(q) || address.includes(q) || stock.includes(q)
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError('')
    const userId = user?.id ? parseInt(String(user.id), 10) : 0
    if (!userId) {
      setSaveError('User not found. Please login again.')
      return
    }
    if (!form.stockId) {
      setSaveError('Please select stock.')
      return
    }
    const parseNum = (s: string) => {
      const n = parseInt(String(s || ''), 10)
      return !isNaN(n) ? n : undefined
    }
    const result = await saveTransfer({
      stockId: form.stockId,
      userId,
      quantity: form.quantity || 1,
      companyName: form.companyName.trim(),
      contactNumber: parseNum(form.contactNumber),
      address: form.address.trim(),
      deliveryDetails: form.deliveryDetails.trim(),
    })
    if (result.success) {
      setSaveSuccess(true)
      setForm(emptyForm)
      setShowForm(false)
      getTransfers().then((list) => setTransfers(list ?? []))
      setTimeout(() => setSaveSuccess(false), 3000)
      await Swal.fire({
        icon: 'success',
        title: 'Successfully Saved',
        text: 'Transfer saved successfully.',
      })
    } else {
      setSaveError(result.error || 'Failed to save transfer')
    }
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Transfer</h2>
        {!showForm && (
          <Button onClick={() => { setShowForm(true); setSaveError(''); setForm(emptyForm) }} style={{ backgroundColor: '#AA336A' }}>
            <Plus size={18} className="me-1" />
            Add Transfer
          </Button>
        )}
      </div>

      {/* Transfer Form - inline, like Dealer Invoice */}
      {showForm && (
      <div className="card mb-4">
        <form onSubmit={handleSubmit}>
          <div className="card-body">
            {saveError && <div className="alert alert-danger py-2 mb-3">{saveError}</div>}
            {saveSuccess && <div className="alert alert-success py-2 mb-3">Transfer saved successfully.</div>}
            <div className="row g-2">
              <div className="col-md-6">
                <label className="form-label">Stock <span className="text-danger">*</span></label>
                <select
                  className="form-select"
                  value={form.stockId}
                  onChange={(e) => setForm({ ...form, stockId: parseInt(e.target.value, 10) || 0 })}
                  required
                >
                  <option value={0}>Select stock (model - color)</option>
                  {stocks.filter((s) => (s.quantity ?? 0) > 0).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.modelDto?.name ?? `Stock #${s.id}`} - {s.color ?? '-'} (Qty: {s.quantity ?? 0})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Company Name <span className="text-danger">*</span></label>
                <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="Company/Receiver name" required className="form-control" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Contact Number</label>
                <Input type="tel" value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} placeholder="Contact" className="form-control" />
              </div>
              <div className="col-12">
                <label className="form-label">Address <span className="text-danger">*</span></label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Delivery address" required className="form-control" />
              </div>
              <div className="col-12">
                <label className="form-label">Delivery Details <span className="text-danger">*</span></label>
                <Input value={form.deliveryDetails} onChange={(e) => setForm({ ...form, deliveryDetails: e.target.value })} placeholder="Delivery instructions/details" required className="form-control" />
              </div>
            </div>
          </div>
          <div className="card-footer d-flex justify-content-between align-items-center">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" style={{ backgroundColor: '#AA336A' }}>
              Save Transfer
            </Button>
          </div>
        </form>
      </div>
      )}

      {/* Transfers Table - only show when form is hidden */}
      {!showForm && (
      <div className="card">
        <div className="card-body">
          <Input
            placeholder="Search by company, address, stock..."
            className="mb-3"
            style={{ maxWidth: '400px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {loading ? (
            <p className="text-muted mb-0">Loading transfers...</p>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Stock / Model</th>
                      <th>Quantity</th>
                      <th>Company Name</th>
                      <th>Contact</th>
                      <th>Address</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransfers.map((t) => (
                      <tr key={t.id}>
                        <td className="fw-medium">{t.stockDto?.name || t.stockDto?.modelDto?.name || `Stock #${t.stockId}`}</td>
                        <td>{t.quantity ?? '-'}</td>
                        <td>{t.companyName ?? '-'}</td>
                        <td>{t.contactNumber != null ? String(t.contactNumber) : '-'}</td>
                        <td>{t.address ?? '-'}</td>
                        <td>
                          <Button variant="ghost" size="sm" className="p-1" onClick={() => setViewTransfer(t)} title="View">
                            <Eye size={20} className="text-primary" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredTransfers.length === 0 && <p className="text-muted mb-0">No transfers found</p>}
            </>
          )}
        </div>
      </div>
      )}

      {viewTransfer && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setViewTransfer(null)}>
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Transfer Details - {viewTransfer.companyName}</h5>
                <button type="button" className="btn-close" onClick={() => setViewTransfer(null)} aria-label="Close" />
              </div>
              <div className="modal-body">
                <div className="row g-2">
                  <div className="col-md-6"><strong>Stock/Model:</strong> {(viewTransfer.stockDto?.name || viewTransfer.stockDto?.modelDto?.name) ?? '-'}</div>
                  <div className="col-md-6"><strong>Quantity:</strong> {viewTransfer.quantity ?? '-'}</div>
                  <div className="col-md-6"><strong>Company Name:</strong> {viewTransfer.companyName ?? '-'}</div>
                  <div className="col-md-6"><strong>Contact:</strong> {viewTransfer.contactNumber ?? '-'}</div>
                  <div className="col-12"><strong>Address:</strong> {viewTransfer.address ?? '-'}</div>
                  <div className="col-12"><strong>Delivery Details:</strong> {viewTransfer.deliveryDetails ?? '-'}</div>
                </div>
              </div>
              <div className="modal-footer">
                <Button variant="outline" onClick={() => setViewTransfer(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
