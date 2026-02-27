import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { saveTransfer, updateTransfer, getTransfersPage, getTransferById, type TransferDto } from '@/lib/transferApi'
import { getStocksPage, type StockDto } from '@/lib/stockApi'
import { useAuth } from '@/hooks/useAuth'
import { useShopDetail } from '@/context/ShopDetailContext'
import { isValidSriLankaNIC } from '@/lib/nicUtils'
import { Plus, ArrowRightLeft, Trash2, FileDown, Printer } from 'lucide-react'
import { jsPDF } from 'jspdf'
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
  nic: '',
  transferList: [{ stockId: 0, quantity: 1 }] as FormLine[],
}

const PAGE_W = 210
const MARGIN = 15

function buildTransferDetailPDF(t: TransferDto, shopName: string): jsPDF {
  const doc = new jsPDF()
  let y = 15

  // Company info - top center (dealer invoice style)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(shopName || 'AIMA Bike', PAGE_W / 2, y, { align: 'center' })
  y += 8

  // Document title - centered
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('TRANSFER', PAGE_W / 2, y, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  y += 12

  // Two columns: Left - Handed by, Company, Address, Delivery | Right - Contact, NIC, Transfer ID
  const col1X = MARGIN
  const col2X = PAGE_W / 2 + 5
  doc.setFontSize(9)
  doc.text(`Handed by: ${t.userDto?.firstName ?? '-'}`, col1X, y)
  doc.text(`Contact Number: ${t.contactNumber != null ? String(t.contactNumber) : '-'}`, col2X, y)
  y += 6
  doc.text(`Company Name: ${t.companyName ?? '-'}`, col1X, y)
  doc.text(`NIC: ${t.nic ?? '-'}`, col2X, y)
  y += 6
  doc.text(`Address: ${(t.address ?? '-').substring(0, 45)}`, col1X, y)
  doc.text(`Transfer ID: ${t.id}`, col2X, y)
  y += 6
  doc.text(`Delivery Details: ${(t.deliveryDetails ?? '-').substring(0, 45)}`, col1X, y)
  y += 10

  // Items table - Bike Model | Item Code | Color | QTY (dealer invoice style: bordered header, row lines)
  const colW = [70, 45, 45, 20]
  const tableStartY = y
  const tableWidth = colW.reduce((a, b) => a + b, 0)
  const headers = ['Bike Model', 'Item Code', 'Color', 'QTY']
  let x = MARGIN

  doc.setDrawColor(180, 180, 180)
  doc.setLineWidth(0.2)
  doc.rect(MARGIN, tableStartY, tableWidth, 8)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  headers.forEach((h, i) => {
    doc.text(h, x + 2, y + 5)
    if (i < headers.length - 1) doc.line(x + colW[i], tableStartY, x + colW[i], tableStartY + 8)
    x += colW[i]
  })
  doc.setFont('helvetica', 'normal')
  y += 8

  const list = t.transferList ?? []
  let totalQty = 0
  list.forEach((line) => {
    if (y > 250) {
      doc.addPage()
      y = 20
    }
    doc.line(MARGIN, y, MARGIN + tableWidth, y)
    const modelName = (line.stockDto?.modelDto?.name ?? '-').substring(0, 35)
    const qty = Number(line.quantity) || 1
    totalQty += qty
    x = MARGIN
    doc.setFontSize(8)
    doc.text(modelName, x + 2, y + 4)
    x += colW[0]
    doc.text((line.stockDto?.itemCode ?? '-').substring(0, 18), x + 2, y + 4)
    x += colW[1]
    doc.text((line.stockDto?.color ?? '-').substring(0, 18), x + 2, y + 4)
    x += colW[2]
    doc.text(String(qty), x + 2, y + 4)
    y += 6
  })
  doc.line(MARGIN, y, MARGIN + tableWidth, y)

  // Total row
  y += 4
  const qtyColX = MARGIN + colW[0] + colW[1] + colW[2]
  doc.setFont('helvetica', 'bold')
  doc.text('Total', MARGIN + 4, y + 4)
  doc.text(String(totalQty), qtyColX + 4, y + 4)
  doc.setFont('helvetica', 'normal')
  y += 14

  // Received by / Signature (dealer invoice style)
  doc.setFontSize(8)
  doc.text('Received by: _______________  Date: _______________', MARGIN, y)
  y += 10
  doc.text('Name: _______________  Signature: _______________', MARGIN, y)
  y += 14

  // Footer (dealer invoice style)
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  doc.setFontSize(7)
  doc.setTextColor(120, 120, 120)
  doc.text(`${dateStr} ${timeStr}`, MARGIN, 288)
  doc.text('Page 1 of 1', PAGE_W / 2, 288, { align: 'center' })
  doc.text(`Transfer ID - ${t.id}`, PAGE_W / 2, 292, { align: 'center' })
  doc.text(`Printed by ${shopName || 'AIMA Bike'} POS`, PAGE_W - MARGIN, 288, { align: 'right' })
  doc.setTextColor(0, 0, 0)
  return doc
}

function downloadTransferDetailPDF(t: TransferDto, shopName: string) {
  const doc = buildTransferDetailPDF(t, shopName)
  doc.save(`Transfer-${t.companyName ?? t.id}.pdf`)
}

function printTransferDetailPDF(t: TransferDto, shopName: string) {
  const doc = buildTransferDetailPDF(t, shopName)
  const blob = doc.output('blob')
  const url = URL.createObjectURL(blob)
  const w = window.open(url, '_blank')
  if (w) {
    setTimeout(() => {
      try { w.print() } catch { /* PDF viewer may block */ }
      URL.revokeObjectURL(url)
    }, 800)
  } else {
    URL.revokeObjectURL(url)
  }
}

export default function Transfer() {
  const { user } = useAuth()
  const { shopDetail } = useShopDetail()
  const shopName = shopDetail?.name?.trim() || 'AIMA Bike'
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
  const [searchNic, setSearchNic] = useState('')
  const [viewTransfer, setViewTransfer] = useState<TransferDto | null>(null)
  const [editingTransferId, setEditingTransferId] = useState<number | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [formErrors, setFormErrors] = useState<{ contactNumber?: string; nic?: string }>({})
  const [showForm, setShowForm] = useState(false)
  const [loadingView, setLoadingView] = useState(false)

  const validateForm = (): boolean => {
    const err: { contactNumber?: string; nic?: string } = {}
    const contact = form.contactNumber.trim()
    if (contact && !/^\d{10}$/.test(contact)) err.contactNumber = 'Contact number must be exactly 10 digits.'
    if (form.nic.trim() && !isValidSriLankaNIC(form.nic)) err.nic = 'NIC must be Sri Lanka format: old (9 digits + V or X) or new (12 digits).'
    setFormErrors(err)
    return Object.keys(err).length === 0
  }

  /** Restrict NIC input: digits only, or 9 digits + one V/X (old format). No extra letters after V/X. */
  const handleNicChange = (value: string) => {
    let v = value.toUpperCase().replace(/[^0-9VX]/g, '')
    const letters = v.match(/[VX]/g)
    if (letters && letters.length > 0) {
      const digits = v.replace(/[VX]/g, '').slice(0, 9)
      v = digits + letters[0]
    } else {
      v = v.slice(0, 12)
    }
    setForm({ ...form, nic: v })
  }

  const searchParams = {
    isActive: true,
    companyName: searchQuery.trim() || undefined,
    nic: searchNic.trim() || undefined,
  }

  const fetchTransfersPage = () => {
    setLoading(true)
    getTransfersPage(pageNumber, pageSize, searchParams).then((res) => {
      setTransfers(res.content ?? [])
      setTotalElements(res.totalElements ?? 0)
      setTotalPages(res.totalPages ?? 0)
      setLoading(false)
    })
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getTransfersPage(pageNumber, pageSize, searchParams).then((res) => {
      if (!cancelled) {
        setTransfers(res.content ?? [])
        setTotalElements(res.totalElements ?? 0)
        setTotalPages(res.totalPages ?? 0)
      }
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [pageNumber, pageSize, searchQuery, searchNic])

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

  const openFormForView = (t: TransferDto) => {
    setLoadingView(true)
    getTransferById(t.id).then((data) => {
      if (data) {
        setViewTransfer(data)
        setEditingTransferId(null)
        setIsViewMode(true)
        setShowForm(true)
        setSaveError('')
        setFormErrors({})
      }
      setLoadingView(false)
    })
  }

  const openFormForEdit = (t: TransferDto) => {
    setLoadingView(true)
    getTransferById(t.id).then((data) => {
      if (data) {
        setViewTransfer(data)
        setEditingTransferId(data.id)
        setIsViewMode(false)
        setForm({
          companyName: data.companyName ?? '',
          contactNumber: data.contactNumber != null ? String(data.contactNumber) : '',
          address: data.address ?? '',
          deliveryDetails: data.deliveryDetails ?? '',
          nic: data.nic ?? '',
          transferList: [],
        })
        setShowForm(true)
        setSaveError('')
        setFormErrors({})
      }
      setLoadingView(false)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError('')
    setFormErrors({})
    if (!validateForm()) return
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
        nic: form.nic.trim() || null,
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
    const parseNum = (s: string) => {
      const n = parseInt(String(s || ''), 10)
      return !isNaN(n) ? n : undefined
    }
    const result = await saveTransfer({
      userId,
      companyName: form.companyName.trim(),
      address: form.address.trim(),
      deliveryDetails: form.deliveryDetails.trim(),
      contactNumber: parseNum(form.contactNumber) ?? undefined,
      nic: form.nic.trim() || null,
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
          <Button onClick={() => { setShowForm(true); setIsViewMode(false); setSaveError(''); setFormErrors({}); setEditingTransferId(null); setViewTransfer(null); setForm({ ...emptyForm, transferList: [{ stockId: 0, quantity: 1 }] }) }} style={{ backgroundColor: 'var(--aima-primary)' }}>
            <Plus size={18} className="me-1" />
            Add Transfer
          </Button>
        )}
      </div>

      {/* Transfer Form - inline, like Dealer */}
      {showForm && isViewMode && viewTransfer && (
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="border-bottom pb-2 mb-0">Transfer Details</h6>
            <div className="d-flex gap-2">
              <Button type="button" onClick={() => printTransferDetailPDF(viewTransfer, shopName)} style={{ backgroundColor: '#374151', color: '#fff', border: 'none' }}>
                <Printer size={18} className="me-1" />
                Print
              </Button>
              <Button type="button" onClick={() => downloadTransferDetailPDF(viewTransfer, shopName)} style={{ backgroundColor: 'var(--aima-primary)', color: '#fff', border: 'none' }}>
                <FileDown size={18} className="me-1" />
                PDF
              </Button>
            </div>
          </div>
          <div className="row g-2">
            <div className="col-12">
              <label className="form-label text-muted">Handed by</label>
              <Input value={viewTransfer.userDto?.firstName ?? viewTransfer.userId ?? '-'} readOnly className="form-control bg-light" />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted">companyName</label>
              <Input value={viewTransfer.companyName ?? '-'} readOnly className="form-control bg-light" />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted">Contact Number</label>
              <Input value={viewTransfer.contactNumber != null ? String(viewTransfer.contactNumber) : '-'} readOnly className="form-control bg-light" />
            </div>
            <div className="col-12">
              <label className="form-label text-muted">address</label>
              <Input value={viewTransfer.address ?? '-'} readOnly className="form-control bg-light" />
            </div>
            <div className="col-12">
              <label className="form-label text-muted">deliveryDetails</label>
              <Input value={viewTransfer.deliveryDetails ?? '-'} readOnly className="form-control bg-light" />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted">NIC</label>
              <Input value={viewTransfer.nic ?? '-'} readOnly className="form-control bg-light" />
            </div>
          </div>
          <h6 className="border-bottom pb-2 mb-2 mt-3">transferList</h6>
          {(viewTransfer.transferList?.length ?? 0) > 0 ? (
            <div className="table-responsive">
              <table className="table table-sm table-bordered">
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Item Code</th>
                    <th>Color</th>
                    <th>quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {viewTransfer.transferList.map((line, idx) => (
                    <tr key={line.id ?? idx}>
                      <td>{line.stockDto?.modelDto?.name ?? '-'}</td>
                      <td>{line.stockDto?.itemCode ?? '-'}</td>
                      <td>{line.stockDto?.color ?? '-'}</td>
                      <td>{line.quantity ?? 1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted mb-0">No stock lines</p>
          )}
        </div>
        <div className="card-footer">
          <Button type="button" variant="outline" onClick={() => { setShowForm(false); setViewTransfer(null); setIsViewMode(false) }}>
            Close
          </Button>
        </div>
      </div>
      )}

      {showForm && !isViewMode && (
      <div className="card mb-4">
        <form onSubmit={handleSubmit}>
          <div className="card-body">
            <h6 className="border-bottom pb-2 mb-3">{editingTransferId != null ? 'Transfer Details' : 'Add Transfer'}</h6>
            {saveError && <div className="alert alert-danger py-2 mb-3">{saveError}</div>}
            {saveSuccess && <div className="alert alert-success py-2 mb-3">Transfer saved successfully.</div>}
            <div className="row g-2">
              {editingTransferId != null && viewTransfer && (
                <div className="col-12">
                  <label className="form-label text-muted">Handed by</label>
                  <Input value={viewTransfer.userDto?.firstName ?? viewTransfer.userId ?? '-'} readOnly className="form-control bg-light" />
                </div>
              )}
              <div className="col-md-6">
                <label className="form-label">companyName <span className="text-danger">*</span></label>
                <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="Company/Receiver name" required className="form-control" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Contact Number</label>
                <Input
                  type="tel"
                  value={form.contactNumber}
                  onChange={(e) => setForm({ ...form, contactNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder="10 digits"
                  className="form-control"
                />
                {formErrors.contactNumber && <p className="text-danger small mb-0 mt-1">{formErrors.contactNumber}</p>}
              </div>
              <div className="col-12">
                <label className="form-label">address <span className="text-danger">*</span></label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Delivery address" required className="form-control" />
              </div>
              <div className="col-12">
                <label className="form-label">deliveryDetails <span className="text-danger">*</span></label>
                <Input value={form.deliveryDetails} onChange={(e) => setForm({ ...form, deliveryDetails: e.target.value })} placeholder="Delivery instructions/details" required className="form-control" />
              </div>
              <div className="col-md-6">
                <label className="form-label">NIC</label>
                <Input
                  value={form.nic}
                  onChange={(e) => handleNicChange(e.target.value)}
                  placeholder="National Identity Card number"
                  className="form-control"
                />
                {formErrors.nic && <p className="text-danger small mb-0 mt-1">{formErrors.nic}</p>}
              </div>
            </div>

            {editingTransferId != null && viewTransfer ? (
              <>
                {viewTransfer.nic != null && viewTransfer.nic !== '' && (
                  <div className="mb-2">
                    <label className="form-label text-muted small">NIC</label>
                    <Input value={viewTransfer.nic} readOnly className="form-control bg-light" />
                  </div>
                )}
                <h6 className="border-bottom pb-2 mb-2 mt-3">transferList</h6>
                {(viewTransfer.transferList?.length ?? 0) > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered">
                      <thead>
                        <tr>
                          <th>Model</th>
                          <th>Item Code</th>
                          <th>Color</th>
                          <th>quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewTransfer.transferList.map((line, idx) => (
                          <tr key={line.id ?? idx}>
                            <td>{line.stockDto?.modelDto?.name ?? '-'}</td>
                            <td>{line.stockDto?.itemCode ?? '-'}</td>
                            <td>{line.stockDto?.color ?? '-'}</td>
                            <td>{line.quantity ?? 1}</td>
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
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingTransferId(null); setViewTransfer(null); setIsViewMode(false) }}>
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
          <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
            <Input
              placeholder="Search by company name..."
              style={{ maxWidth: '240px' }}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPageNumber(1) }}
            />
            <Input
              placeholder="Search by NIC..."
              style={{ maxWidth: '240px' }}
              value={searchNic}
              onChange={(e) => { setSearchNic(e.target.value); setPageNumber(1) }}
            />
          </div>
          {loading ? (
            <p className="text-muted mb-0">Loading transfers...</p>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>NIC</th>
                      <th>Handed by</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map((t) => (
                      <tr key={t.id}>
                        <td className="align-middle">{t.companyName ?? '-'}</td>
                        <td className="align-middle">{t.nic ?? '-'}</td>
                        <td className="align-middle">{t.userDto?.name ?? t.userId ?? '-'}</td>
                        <td className="align-middle">
                          <div className="d-flex align-items-center gap-1">
                            <Button variant="ghost" size="sm" className="p-1 d-inline-flex align-items-center" onClick={() => openFormForView(t)} title="View">
                              <ViewIcon size={20} className="text-primary" />
                            </Button>
                            <Button variant="ghost" size="sm" className="p-1 d-inline-flex align-items-center" onClick={() => openFormForEdit(t)} title="Edit">
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
