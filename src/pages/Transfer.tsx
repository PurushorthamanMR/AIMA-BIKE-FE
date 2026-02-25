import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { saveTransfer, updateTransfer, getTransfersPage, getTransferById, type TransferDto } from '@/lib/transferApi'
import { getStocksPage, type StockDto } from '@/lib/stockApi'
import { useAuth } from '@/hooks/useAuth'
import { Plus, ArrowRightLeft, Trash2 } from 'lucide-react'
import ViewIcon from '@/components/icons/ViewIcon'
import EditIcon from '@/components/icons/EditIcon'
import Swal from 'sweetalert2'

interface FormLine {
  stockId: number
  quantity: number
}

const emptyForm = {
  companyName: '',
  contactNumber: '',
  address: '',
  deliveryDetails: '',
  transferList: [{ stockId: 0, quantity: 1 }] as FormLine[],
}

export default function Transfer() {
  const { user } = useAuth()
  const [transfers, setTransfers] = useState<TransferDto[]>([])
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(10)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [stocks, setStocks] = useState<StockDto[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingStocks, setLoadingStocks] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewTransfer, setViewTransfer] = useState<TransferDto | null>(null)
  const [editingTransferId, setEditingTransferId] = useState<number | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loadingView, setLoadingView] = useState(false)

  const fetchTransfersPage = () => {
    setLoading(true)
    getTransfersPage(pageNumber, pageSize, { isActive: true, companyName: searchQuery.trim() || undefined }).then((res) => {
      setTransfers(res.content ?? [])
      setTotalElements(res.totalElements ?? 0)
      setTotalPages(res.totalPages ?? 0)
      setLoading(false)
    })
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getTransfersPage(pageNumber, pageSize, { isActive: true, companyName: searchQuery.trim() || undefined }).then((res) => {
      if (!cancelled) {
        setTransfers(res.content ?? [])
        setTotalElements(res.totalElements ?? 0)
        setTotalPages(res.totalPages ?? 0)
      }
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [pageNumber, pageSize, searchQuery])

  useEffect(() => {
    let cancelled = false
    setLoadingStocks(true)
    getStocksPage(1, 200).then((r) => {
      if (!cancelled) setStocks(r.content ?? [])
      setLoadingStocks(false)
    })
    return () => { cancelled = true }
  }, [])

  const addLine = () => {
    setForm((f) => ({ ...f, transferList: [...f.transferList, { stockId: 0, quantity: 1 }] }))
  }

  const removeLine = (idx: number) => {
    setForm((f) => ({
      ...f,
      transferList: f.transferList.filter((_, i) => i !== idx),
    }))
  }

  const updateLine = (idx: number, upd: Partial<FormLine>) => {
    setForm((f) => ({
      ...f,
      transferList: f.transferList.map((line, i) => (i === idx ? { ...line, ...upd } : line)),
    }))
  }

  const goToPage = (p: number) => {
    if (p >= 1 && p <= totalPages) setPageNumber(p)
  }

  const openFormForViewOrEdit = (t: TransferDto) => {
    setLoadingView(true)
    getTransferById(t.id).then((data) => {
      if (data) {
        setViewTransfer(data)
        setEditingTransferId(data.id)
        setForm({
          companyName: data.companyName ?? '',
          contactNumber: data.contactNumber != null ? String(data.contactNumber) : '',
          address: data.address ?? '',
          deliveryDetails: data.deliveryDetails ?? '',
          transferList: [],
        })
        setShowForm(true)
        setSaveError('')
      }
      setLoadingView(false)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError('')
    if (editingTransferId != null) {
      const parseNum = (s: string) => {
        const n = parseInt(String(s || ''), 10)
        return !isNaN(n) ? n : undefined
      }
      const result = await updateTransfer({
        id: editingTransferId,
        companyName: form.companyName.trim(),
        address: form.address.trim(),
        deliveryDetails: form.deliveryDetails.trim(),
        contactNumber: parseNum(form.contactNumber),
      })
      if (result.success) {
        await Swal.fire({ icon: 'success', title: 'Success', text: 'Transfer updated successfully.' })
        setSaveSuccess(true)
        setShowForm(false)
        setEditingTransferId(null)
        setViewTransfer(null)
        setForm({ ...emptyForm, transferList: [{ stockId: 0, quantity: 1 }] })
        fetchTransfersPage()
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        setSaveError(result.error || 'Failed to update transfer')
      }
      return
    }
    const userId = user?.id ? parseInt(String(user.id), 10) : 0
    if (!userId) {
      setSaveError('User not found. Please login again.')
      return
    }
    const validLines = form.transferList.filter((line) => line.stockId > 0)
    if (validLines.length === 0) {
      setSaveError('Add at least one stock line with a selected stock.')
      return
    }
    const result = await saveTransfer({
      userId,
      companyName: form.companyName.trim(),
      address: form.address.trim(),
      deliveryDetails: form.deliveryDetails.trim(),
      transferList: validLines.map((line) => ({ stockId: line.stockId, quantity: 1 })),
    })
    if (result.success) {
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Transfer saved successfully.',
      })
      setSaveSuccess(true)
      setForm({ ...emptyForm, transferList: [{ stockId: 0, quantity: 1 }] })
      setShowForm(false)
      fetchTransfersPage()
      setTimeout(() => setSaveSuccess(false), 3000)
    } else {
      setSaveError(result.error || 'Failed to save transfer')
    }
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 p-2" style={{ background: 'rgba(170, 51, 106, 0.1)' }}>
            <ArrowRightLeft size={28} style={{ color: 'var(--aima-primary)' }} />
          </div>
          <h2 className="mb-0" style={{ color: 'var(--aima-secondary)' }}>Transfer</h2>
        </div>
        {!showForm && (
          <Button onClick={() => { setShowForm(true); setSaveError(''); setEditingTransferId(null); setViewTransfer(null); setForm({ ...emptyForm, transferList: [{ stockId: 0, quantity: 1 }] }) }} style={{ backgroundColor: 'var(--aima-primary)' }}>
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
            <h6 className="border-bottom pb-2 mb-3">{editingTransferId != null ? 'Transfer Details' : 'Add Transfer'}</h6>
            {saveError && <div className="alert alert-danger py-2 mb-3">{saveError}</div>}
            {saveSuccess && <div className="alert alert-success py-2 mb-3">Transfer saved successfully.</div>}
            <div className="row g-2">
              {editingTransferId != null && viewTransfer && (
                <div className="col-12">
                  <label className="form-label text-muted">userId</label>
                  <Input value={viewTransfer.userId ?? viewTransfer.userDto?.id ?? ''} readOnly className="form-control bg-light" />
                </div>
              )}
              <div className="col-md-6">
                <label className="form-label">companyName <span className="text-danger">*</span></label>
                <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="Company/Receiver name" required className="form-control" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Contact Number</label>
                <Input type="tel" value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} placeholder="Contact" className="form-control" />
              </div>
              <div className="col-12">
                <label className="form-label">address <span className="text-danger">*</span></label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Delivery address" required className="form-control" />
              </div>
              <div className="col-12">
                <label className="form-label">deliveryDetails <span className="text-danger">*</span></label>
                <Input value={form.deliveryDetails} onChange={(e) => setForm({ ...form, deliveryDetails: e.target.value })} placeholder="Delivery instructions/details" required className="form-control" />
              </div>
            </div>

            {editingTransferId != null && viewTransfer ? (
              <>
                <h6 className="border-bottom pb-2 mb-2 mt-3">transferList</h6>
                {(viewTransfer.transferList?.length ?? 0) > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered">
                      <thead>
                        <tr>
                          <th>stockId</th>
                          <th>quantity</th>
                          <th>Stock / Model</th>
                          <th>Color</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewTransfer.transferList.map((line, idx) => (
                          <tr key={line.id ?? idx}>
                            <td>{line.stockId}</td>
                            <td>{line.quantity ?? 1}</td>
                            <td>{line.stockDto?.name || line.stockDto?.modelDto?.name || `Stock #${line.stockId}`}</td>
                            <td>{line.stockDto?.color ?? '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted mb-0">No stock lines</p>
                )}
              </>
            ) : (
              <>
                <h6 className="border-bottom pb-2 mb-3 mt-3">Stock lines</h6>
                {form.transferList.map((line, idx) => {
                  const optionsForLine = stocks.filter(
                    (s) =>
                      (s.quantity ?? 0) > 0 &&
                      (s.id === line.stockId || !form.transferList.some((l, i) => i !== idx && l.stockId === s.id))
                  )
                  return (
                    <div key={idx} className="row g-2 align-items-end mb-2 p-2 border rounded">
                      <div className="col-md-10">
                        <label className="form-label small">Stock <span className="text-danger">*</span></label>
                        <select
                          className="form-select form-select-sm"
                          value={line.stockId}
                          onChange={(e) => updateLine(idx, { stockId: parseInt(e.target.value, 10) || 0 })}
                          required
                        >
                          <option value={0}>Select stock (model - chassis - color)</option>
                          {optionsForLine.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.modelDto?.name ?? `Stock #${s.id}`} - {s.chassisNumber ?? '-'} - {s.color ?? '-'}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-2">
                        <Button type="button" variant="outline" size="sm" className="p-1" onClick={() => removeLine(idx)} title="Remove line" disabled={form.transferList.length <= 1}>
                          <Trash2 size={18} className="text-danger" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
                <Button type="button" variant="outline" size="sm" onClick={addLine} className="mb-3">
                  <Plus size={18} className="me-1" />
                  Add stock line
                </Button>
              </>
            )}
          </div>
          <div className="card-footer d-flex justify-content-between align-items-center">
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingTransferId(null); setViewTransfer(null) }}>
              Cancel
            </Button>
            <Button type="submit" style={{ backgroundColor: 'var(--aima-primary)' }}>
              {editingTransferId != null ? 'Update Transfer' : 'Save Transfer'}
            </Button>
          </div>
        </form>
      </div>
      )}

      {/* Transfers Table - only show when form is hidden */}
      {!showForm && (
      <div className="card">
        <div className="card-body">
          {loadingView && <p className="text-muted mb-2">Loading transfer details...</p>}
          <Input
            placeholder="Search by company, address, stock..."
            className="mb-3"
            style={{ maxWidth: '400px' }}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPageNumber(1) }}
          />
          {loading ? (
            <p className="text-muted mb-0">Loading transfers...</p>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>User ID</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map((t) => (
                      <tr key={t.id}>
                        <td className="align-middle">{t.companyName ?? '-'}</td>
                        <td className="align-middle">{t.userId ?? t.userDto?.id ?? '-'}</td>
                        <td className="align-middle">
                          <div className="d-flex align-items-center gap-1">
                            <Button variant="ghost" size="sm" className="p-1 d-inline-flex align-items-center" onClick={() => openFormForViewOrEdit(t)} title="View">
                              <ViewIcon size={20} className="text-primary" />
                            </Button>
                            <Button variant="ghost" size="sm" className="p-1 d-inline-flex align-items-center" onClick={() => openFormForViewOrEdit(t)} title="Edit">
                              <EditIcon size={18} className="text-dark" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {transfers.length === 0 && !loading && <p className="text-muted mb-0">No transfers found</p>}
            {totalPages > 1 && (
              <div className="d-flex align-items-center justify-content-between mt-3">
                <p className="text-muted small mb-0">
                  Page {pageNumber} of {totalPages} ({totalElements} total)
                </p>
                <div className="d-flex gap-1">
                  <Button type="button" variant="outline" size="sm" onClick={() => goToPage(pageNumber - 1)} disabled={pageNumber <= 1}>
                    Previous
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => goToPage(pageNumber + 1)} disabled={pageNumber >= totalPages}>
                    Next
                  </Button>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      </div>
      )}

    </div>
  )
}
