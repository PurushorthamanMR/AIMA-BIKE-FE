import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getDealerConsignmentNoteById, type DealerConsignmentNoteDto } from '@/lib/dealerConsignmentNoteApi'
import { ArrowLeft, FileDown } from 'lucide-react'
import { jsPDF } from 'jspdf'

const PAGE_W = 210
const MARGIN = 15

// Company details - can be replaced with Shop Details API later
const COMPANY = {
  name: 'AIMA Bike',
  address: '',
  email: '',
  tel: '',
}

const TERMS = [
  'Items are supplied on consignment basis. Ownership remains with the company until sold.',
  'Dealer shall store items safely and maintain proper records.',
  'Unsold items may be returned as per company policy.',
  'Pricing and discounts are as per company guidelines.',
  'Dealer agrees to settle accounts as per agreed terms.',
]

function downloadDealerInvoicePDF(note: DealerConsignmentNoteDto) {
  const doc = new jsPDF()
  let y = 15

  // Company info - top center
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(COMPANY.name, PAGE_W / 2, y, { align: 'center' })
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const companyLine2 = [COMPANY.address, COMPANY.email ? `Email: ${COMPANY.email}` : '', COMPANY.tel ? `Tel: ${COMPANY.tel}` : ''].filter(Boolean).join(' / ')
  if (companyLine2) {
    doc.text(companyLine2, PAGE_W / 2, y, { align: 'center' })
    y += 6
  } else y += 2

  // Document title - centered
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('DEALER CONSIGNMENT NOTE', PAGE_W / 2, y, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  y += 12

  // Two columns: Left - Dealer | Right - Consignment details
  const col1X = MARGIN
  const col2X = PAGE_W / 2 + 5

  doc.setFontSize(9)
  doc.text(`Dealer Code: ${note.dealerCode ?? '-'}`, col1X, y)
  doc.text(`Consignment Note No: ${note.consignmentNoteNo ?? '-'}`, col2X, y)
  y += 6
  doc.text(`Dealer Name: ${note.dealerName ?? '-'}`, col1X, y)
  doc.text(`Date: ${note.date ?? '-'}`, col2X, y)
  y += 6
  doc.text(`Address: ${note.address ?? '-'}`, col1X, y)
  doc.text(`Delivery Mode: ${note.deliveryMode ?? '-'}`, col2X, y)
  y += 6
  doc.text(`Contact Person: ${note.contactPerson ?? '-'}`, col1X, y)
  doc.text(`Vehicle No: ${note.vehicleNo ?? '-'}`, col2X, y)
  y += 6
  doc.text(`Reference: ${note.references ?? '-'}`, col2X, y)
  y += 10

  // Items table - Bike Model | Item Code | Chasis Number / VIN | Motor Number | Color | QTY
  const colW = [47, 25, 38, 34, 20, 16] // Bike Model, Item Code, Chasis, Motor, Color, QTY
  const tableStartY = y
  const tableWidth = colW.reduce((a, b) => a + b, 0)
  const headers = ['Bike Model', 'Item Code', 'Chasis Number / VIN', 'Motor Number', 'Color', 'QTY']
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

  const items = note.items ?? []
  let totalQty = 0
  items.forEach((it) => {
    if (y > 250) {
      doc.addPage()
      y = 20
    }
    doc.line(MARGIN, y, MARGIN + tableWidth, y)
    const modelName = `${it.modelDto?.name ?? '-'}${it.color ? `-${it.color}` : ''}`.substring(0, 35)
    const qty = Number(it.quantity) || 0
    totalQty += qty

    x = MARGIN
    doc.setFontSize(8)
    doc.text(modelName, x + 2, y + 4)
    x += colW[0]
    doc.text((it.itemCode ?? '-').substring(0, 12), x + 2, y + 4)
    x += colW[1]
    doc.text((it.chassisNumber ?? '-').substring(0, 18), x + 2, y + 4)
    x += colW[2]
    doc.text((it.motorNumber ?? '-').substring(0, 16), x + 2, y + 4)
    x += colW[3]
    doc.text((it.color ?? '-').substring(0, 8), x + 2, y + 4)
    x += colW[4]
    doc.text(qty.toFixed(2), x + 2, y + 4)
    y += 6
  })
  doc.line(MARGIN, y, MARGIN + tableWidth, y)

  // Total row - "Total" label and value in QTY column
  y += 4
  const qtyColX = MARGIN + colW[0] + colW[1] + colW[2] + colW[3] + colW[4]
  doc.setFont('helvetica', 'bold')
  doc.text('Total', MARGIN + 4, y + 4)
  doc.text(totalQty.toFixed(2), qtyColX + 4, y + 4)
  doc.setFont('helvetica', 'normal')
  y += 12

  // Terms & Conditions
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Terms & Conditions', MARGIN, y)
  doc.setFont('helvetica', 'normal')
  y += 6
  doc.setFontSize(8)
  TERMS.forEach((t, i) => {
    doc.text(`${i + 1}. ${t}`, MARGIN + 2, y)
    y += 5
  })
  y += 6

  // Acknowledgement
  doc.setFontSize(8)
  doc.text('I, the undersigned, acknowledge receipt of the above items on a consignment basis and agree to the above terms.', MARGIN, y, { maxWidth: PAGE_W - 2 * MARGIN })
  y += 12

  // Signature blocks - Dealer Representative & Driver
  const sigY = y
  doc.setFontSize(8)
  doc.text('Dealer Representative', MARGIN, sigY)
  doc.text('Driver', PAGE_W / 2 + 10, sigY)
  y += 6
  doc.text('Signature: _______________  Date: _______________', MARGIN, y)
  doc.text('Signature: _______________  Date: _______________', PAGE_W / 2 + 10, y)
  y += 5
  doc.text('Name: _______________  Designation: _______________', MARGIN, y)
  doc.text('Name: _______________  Designation: _______________', PAGE_W / 2 + 10, y)
  y += 15

  // For Office Use Only
  doc.setFontSize(8)
  doc.text('For office use only', MARGIN, y)
  y += 5
  doc.text('Manager: _______________  Stores Incharge: _______________', MARGIN, y)
  y += 12

  // Footer
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  doc.setFontSize(7)
  doc.setTextColor(120, 120, 120)
  doc.text(`${dateStr} ${timeStr}`, MARGIN, 288)
  doc.text(`Page 1 of 1`, PAGE_W / 2, 288, { align: 'center' })
  doc.text(`Consignment Note ID - ${note.id.toLocaleString()}`, PAGE_W / 2, 292, { align: 'center' })
  doc.text('Printed by AIMA Bike POS', PAGE_W - MARGIN, 288, { align: 'right' })
  doc.setTextColor(0, 0, 0)

  doc.save(`Dealer-Consignment-Note-${note.consignmentNoteNo ?? note.id}.pdf`)
}

export default function DealerInvoiceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [note, setNote] = useState<DealerConsignmentNoteDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const noteId = id ? parseInt(id, 10) : NaN
    if (isNaN(noteId)) {
      setError('Invalid ID')
      setLoading(false)
      return
    }
    let cancelled = false
    getDealerConsignmentNoteById(noteId).then((data) => {
      if (!cancelled) {
        setNote(data ?? null)
        if (!data) setError('Dealer invoice not found')
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <div className="container-fluid">
        <p className="text-muted">Loading...</p>
      </div>
    )
  }

  if (error || !note) {
    return (
      <div className="container-fluid">
        <div className="alert alert-warning">{error || 'Not found'}</div>
        <Button variant="outline" onClick={() => navigate('/dealer-invoice')}>
          <ArrowLeft size={18} className="me-1" />
          Back to Dealer Invoice
        </Button>
      </div>
    )
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Dealer Invoice - {note.consignmentNoteNo}</h2>
        <div className="d-flex gap-2">
          <Button variant="outline" onClick={() => downloadDealerInvoicePDF(note)} style={{ borderColor: '#AA336A', color: '#AA336A' }}>
            <FileDown size={18} className="me-1" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => navigate('/dealer-invoice')}>
            <ArrowLeft size={18} className="me-1" />
            Back
          </Button>
        </div>
      </div>

      {/* Form on page - same layout as Dealer Invoice add form */}
      <div className="card">
        <div className="card-body">
          <h6 className="border-bottom pb-2 mb-3">Header</h6>
          <div className="row g-2 mb-4">
            <div className="col-md-6">
              <label className="form-label">Dealer Code</label>
              <Input value={note.dealerCode ?? ''} readOnly className="form-control bg-light" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Dealer Name</label>
              <Input value={note.dealerName ?? ''} readOnly className="form-control bg-light" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Consignment Note No</label>
              <Input value={note.consignmentNoteNo ?? ''} readOnly className="form-control bg-light" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Date</label>
              <Input value={note.date ?? ''} readOnly className="form-control bg-light" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Address</label>
              <Input value={note.address ?? ''} readOnly className="form-control bg-light" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Contact Person</label>
              <Input value={note.contactPerson ?? ''} readOnly className="form-control bg-light" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Delivery Mode</label>
              <Input value={note.deliveryMode ?? ''} readOnly className="form-control bg-light" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Vehicle No</label>
              <Input value={note.vehicleNo ?? ''} readOnly className="form-control bg-light" />
            </div>
            <div className="col-md-6">
              <label className="form-label">References</label>
              <Input value={note.references ?? ''} readOnly className="form-control bg-light" />
            </div>
          </div>

          <h6 className="border-bottom pb-2 mb-3">Items</h6>
          {note.items && note.items.length > 0 ? (
            note.items.map((it, idx) => (
              <div key={it.id ?? idx} className="row g-2 align-items-end mb-2 p-2 border rounded">
                <div className="col-md-3">
                  <label className="form-label small">Model</label>
                  <Input value={it.modelDto?.name ?? '-'} readOnly className="form-control form-control-sm bg-light" />
                </div>
                <div className="col-md-2">
                  <label className="form-label small">Color</label>
                  <Input value={it.color ?? ''} readOnly className="form-control form-control-sm bg-light" />
                </div>
                <div className="col-md-2">
                  <label className="form-label small">Item Code</label>
                  <Input value={it.itemCode ?? ''} readOnly className="form-control form-control-sm bg-light" />
                </div>
                <div className="col-md-2">
                  <label className="form-label small">Chassis Number</label>
                  <Input value={it.chassisNumber ?? ''} readOnly className="form-control form-control-sm bg-light" />
                </div>
                <div className="col-md-2">
                  <label className="form-label small">Motor Number</label>
                  <Input value={it.motorNumber ?? ''} readOnly className="form-control form-control-sm bg-light" />
                </div>
                <div className="col-md-1">
                  <label className="form-label small">Qty</label>
                  <Input value={it.quantity ?? ''} readOnly className="form-control form-control-sm bg-light" />
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted mb-0">No items</p>
          )}
        </div>
      </div>
    </div>
  )
}
