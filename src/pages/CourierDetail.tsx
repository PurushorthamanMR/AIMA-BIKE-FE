import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { getCourierById, type CourierDto } from '@/lib/courierApi'
import { useShopDetail } from '@/context/ShopDetailContext'
import { ArrowLeft, PackageCheck, FileDown, Printer } from 'lucide-react'
import { jsPDF } from 'jspdf'

const PAGE_W = 210
const MARGIN = 15
const COL1_X = MARGIN
const COL2_X = 110
const ROW_H = 6

function fmtVal(v: string | number | undefined): string {
  return v != null && v !== '' ? String(v) : '-'
}

function buildCourierDetailPDF(c: CourierDto, shopName: string): jsPDF {
  const doc = new jsPDF()
  let y = 18

  // Document border (customer style)
  doc.setDrawColor(180, 180, 180)
  doc.setLineWidth(0.5)
  doc.rect(MARGIN - 5, 10, PAGE_W - 2 * (MARGIN - 5), 277)

  // Shop name - top
  if (shopName) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(40, 40, 40)
    doc.text(shopName, PAGE_W / 2, y, { align: 'center' })
    y += 6
  }
  // Title - document style
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('COURIER DETAILS', PAGE_W / 2, y, { align: 'center' })
  y += 6
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(c.name ?? 'N/A', PAGE_W / 2, y, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  y += 10
  doc.setDrawColor(200, 200, 200)
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
  y += 10

  const row = (label: string, val: string | number | undefined, col: 1 | 2 = 1) => {
    if (y > 285) { doc.addPage(); y = 15 }
    const x = col === 1 ? COL1_X : COL2_X
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    const labelStr = `${label}:  `
    doc.text(labelStr, x, y)
    doc.setFont('helvetica', 'normal')
    const labelW = doc.getTextWidth(labelStr)
    doc.text(fmtVal(val), x + labelW, y, { maxWidth: (col === 1 ? COL2_X : PAGE_W - MARGIN) - x - labelW - 2 })
    if (col === 2) y += ROW_H
  }

  // Section: Courier Information (customer-style section header)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Courier Information', MARGIN, y)
  doc.setDrawColor(200, 200, 200)
  doc.line(MARGIN, y + 2, PAGE_W - MARGIN, y + 2)
  y += 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  row('Name', c.name, 1)
  row('Category', c.categoryDto?.name, 2)
  row('Customer', c.customerDto?.name, 1)
  row('Contact Number', c.contactNumber, 2)
  row('Address', c.address, 1)
  row('Sent Date', c.sentDate, 2)
  row('Received Date', c.receivedDate, 1)
  row('Receiver Name', c.receivername, 2)
  row('Receiver NIC', c.nic, 1)
  y += 4

  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.text(`Courier ID: ${c.id}`, MARGIN, 285)
  doc.setTextColor(0, 0, 0)
  return doc
}

function downloadCourierDetailPDF(c: CourierDto, shopName: string) {
  const doc = buildCourierDetailPDF(c, shopName)
  doc.save(`Courier-${c.name ?? c.id}.pdf`)
}

function printCourierDetailPDF(c: CourierDto, shopName: string) {
  const doc = buildCourierDetailPDF(c, shopName)
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

export default function CourierDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { shopDetail } = useShopDetail()
  const shopName = shopDetail?.name?.trim() || ''
  const [courier, setCourier] = useState<CourierDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const courierId = parseInt(id ?? '0', 10)
    if (!courierId) {
      setLoading(false)
      return
    }
    getCourierById(courierId).then((data) => {
      if (!cancelled) setCourier(data ?? null)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [id])

  if (loading) return <p className="text-muted">Loading courier...</p>
  if (!courier) return <p className="text-muted">Courier not found.</p>

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 p-2" style={{ background: 'rgba(170, 51, 106, 0.1)' }}>
            <PackageCheck size={28} style={{ color: 'var(--aima-primary)' }} />
          </div>
          <h2 className="mb-0" style={{ color: 'var(--aima-secondary)' }}>Courier Details</h2>
        </div>
        <div className="d-flex gap-2">
          <Button onClick={() => printCourierDetailPDF(courier, shopName)} style={{ backgroundColor: '#374151', color: '#fff', border: 'none' }}>
            <Printer size={18} className="me-1" />
            Print
          </Button>
          <Button onClick={() => downloadCourierDetailPDF(courier, shopName)} style={{ backgroundColor: 'var(--aima-primary)', color: '#fff', border: 'none' }}>
            <FileDown size={18} className="me-1" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => navigate('/courier')}>
            <ArrowLeft size={18} className="me-1" />
            Back
          </Button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">Courier details</h5>
          </div>
          <h6 className="border-bottom pb-2 mb-3 text-muted small text-uppercase fw-semibold">Courier Information</h6>
          <dl className="row mb-0">
            <dt className="col-sm-3 text-muted fw-normal">Name</dt>
            <dd className="col-sm-9 mb-2">{courier.name ?? '-'}</dd>
            <dt className="col-sm-3 text-muted fw-normal">Category</dt>
            <dd className="col-sm-9 mb-2">{courier.categoryDto?.name ?? '-'}</dd>
            <dt className="col-sm-3 text-muted fw-normal">Customer</dt>
            <dd className="col-sm-9 mb-2">{courier.customerDto?.name ?? '-'}</dd>
            <dt className="col-sm-3 text-muted fw-normal">Contact Number</dt>
            <dd className="col-sm-9 mb-2">{courier.contactNumber != null ? String(courier.contactNumber) : '-'}</dd>
            <dt className="col-sm-3 text-muted fw-normal">Address</dt>
            <dd className="col-sm-9 mb-2">{courier.address ?? '-'}</dd>
            <dt className="col-sm-3 text-muted fw-normal">Sent Date</dt>
            <dd className="col-sm-9 mb-2">{courier.sentDate ?? '-'}</dd>
            <dt className="col-sm-3 text-muted fw-normal">Received Date</dt>
            <dd className="col-sm-9 mb-2">{courier.receivedDate ?? '-'}</dd>
            <dt className="col-sm-3 text-muted fw-normal">Receiver Name</dt>
            <dd className="col-sm-9 mb-2">{courier.receivername ?? '-'}</dd>
            <dt className="col-sm-3 text-muted fw-normal">Receiver NIC</dt>
            <dd className="col-sm-9 mb-0">{courier.nic ?? '-'}</dd>
          </dl>
        </div>
      </div>
    </div>
  )
}
