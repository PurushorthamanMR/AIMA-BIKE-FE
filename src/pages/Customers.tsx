import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCustomersByStatus, getCustomersByDateOfPurchaseAndStatus, approveCustomer, returnCustomer, deliveryCustomer, updateCustomer, updateCash, updateLease, type CustomerDto } from '@/lib/customerApi'
import { formatCurrency, formatDateDDMMYYYY } from '@/lib/utils'
import { FileDown, ArrowLeft, Users, Printer } from 'lucide-react'
import ViewIcon from '@/components/icons/ViewIcon'
import EditIcon from '@/components/icons/EditIcon'
import { UploadDisplay } from '@/components/UploadDisplay'
import { FileUploadField } from '@/components/FileUploadField'
import { isUploadPath, getUploadUrl } from '@/lib/uploadApi'
import { useShopDetail } from '@/context/ShopDetailContext'
import { jsPDF } from 'jspdf'
import Swal from 'sweetalert2'

const PAGE_W = 210
const MARGIN = 15
const COL1_X = MARGIN
const COL2_X = 110
const ROW_H = 6
const IMG_W = 45
const IMG_H = 35

type DisplayCustomer = ReturnType<typeof dtoToDisplay>

function fmtVal(v: string | number | undefined): string {
  return v != null && v !== '' ? String(v) : '-'
}

async function pathToDataUrl(path: string): Promise<string | null> {
  try {
    let url: string
    if (path.startsWith('http') || path.startsWith('data:')) {
      url = path
    } else if (isUploadPath(path)) {
      const u = await getUploadUrl(path)
      if (!u) return null
      url = u
    } else {
      return null
    }
    const res = await fetch(url)
    const blob = await res.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

async function buildCustomerDetailPDF(c: DisplayCustomer, shopName: string): Promise<jsPDF> {
  const doc = new jsPDF()
  let y = 18

  // Document border
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
  doc.text('CUSTOMER DETAILS', PAGE_W / 2, y, { align: 'center' })
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

  const row2 = (label: string, val: string | number | undefined) => {
    if (y > 285) { doc.addPage(); y = 15 }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    const labelStr = `${label}:  `
    doc.text(labelStr, COL1_X, y)
    doc.setFont('helvetica', 'normal')
    doc.text(fmtVal(val), COL1_X + doc.getTextWidth(labelStr), y, { maxWidth: PAGE_W - MARGIN - COL1_X - 10 })
    y += ROW_H
  }

  // Section: Customer Details (matches h6 border-bottom)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Customer Details', MARGIN, y)
  doc.setDrawColor(200, 200, 200)
  doc.line(MARGIN, y + 2, PAGE_W - MARGIN, y + 2)
  y += 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  row('Name in Full', c.nameInFull ?? c.name, 1)
  row('Contact Number', c.phone, 2)
  row('Address', c.address, 1)
  row('Province', c.province, 2)
  row('District', c.district, 1)
  row('Occupation', c.occupation, 2)
  row('Date of Birth', formatDateDDMMYYYY(c.dateOfBirth), 1)
  row('Religion', c.religion, 2)
  row('WhatsApp Number', c.whatsAppNumber, 1)
  row('NIC/Business Reg No', c.nicOrBusinessRegNo, 2)
  y += 4

  // Section: Vehicle Purchase Details
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Vehicle Purchase Details', MARGIN, y)
  doc.line(MARGIN, y + 2, PAGE_W - MARGIN, y + 2)
  y += 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  row('Model', c.model, 1)
  row('Chassis Number', c.chassisNumber, 2)
  row('Motor Number', c.motorNumber, 1)
  row('Colour', c.colourOfVehicle, 2)
  row('Date of Purchase', formatDateDDMMYYYY(c.dateOfPurchase), 1)
  row('Selling Price', c.sellingPrice != null ? formatCurrency(c.sellingPrice) : undefined, 2)
  row('Registration Fee', c.registrationFee != null ? formatCurrency(c.registrationFee) : undefined, 1)
  row('Advance Payment', c.advancePaymentAmount != null ? formatCurrency(c.advancePaymentAmount) : undefined, 2)
  row('Advance Date', formatDateDDMMYYYY(c.advancePaymentDate), 1)
  row('Balance Amount', c.balancePaymentAmount != null ? formatCurrency(c.balancePaymentAmount) : undefined, 2)
  row('Balance Date', formatDateDDMMYYYY(c.balancePaymentDate), 1)
  row('Payment Type', c.paymentType, 2)
  row('Date of Delivery', formatDateDDMMYYYY(c.dateOfDeliveryToCustomer), 1)
  row('AIMA CARE Loyalty Card', c.aimaCareLoyaltyCardNo, 2)
  y += 4

  const addImageBlock = async (label: string, path: string | undefined, x: number): Promise<number> => {
    let ny = y
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(`${label}:  `, x, ny)
    ny += 4
    if (path && (isUploadPath(path) || path.startsWith('http') || path.startsWith('data:'))) {
      const dataUrl = await pathToDataUrl(path)
      if (dataUrl && dataUrl.startsWith('data:image/')) {
        if (ny + IMG_H > 285) { doc.addPage(); ny = 15; doc.setFont('helvetica', 'normal'); doc.setFontSize(9) }
        const fmt = dataUrl.includes('image/png') ? 'PNG' : dataUrl.includes('image/gif') ? 'GIF' : dataUrl.includes('image/webp') ? 'WEBP' : 'JPEG'
        try {
          doc.addImage(dataUrl, fmt, x, ny, IMG_W, IMG_H)
        } catch {
          doc.setFont('helvetica', 'normal')
          doc.text('Uploaded', x, ny + 5)
        }
        ny += IMG_H + 4
      } else if (dataUrl && dataUrl.startsWith('data:application/pdf')) {
        doc.setFont('helvetica', 'normal')
        doc.text('PDF document', x, ny + 5)
        ny += 10
      } else {
        doc.setFont('helvetica', 'normal')
        doc.text('Uploaded', x, ny + 5)
        ny += 10
      }
    } else {
      doc.setFont('helvetica', 'normal')
      doc.text(path ? path : '-', x, ny + 5)
      ny += 10
    }
    return ny
  }

  if (c.paymentOption === 'cash' && c.cashData) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('Cash - Requirement for registration', MARGIN, y)
    doc.line(MARGIN, y + 2, PAGE_W - MARGIN, y + 2)
    y += 10
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)

    const cashItems = [
      { label: 'Copy of NIC', path: c.cashData.copyOfNic },
      { label: 'Photograph 1', path: c.cashData.photographOne },
      { label: 'Photograph 2', path: c.cashData.photographTwo },
      { label: 'Payment Receipt', path: c.cashData.paymentReceipt },
      { label: 'MTA 2', path: c.cashData.mta2 },
      { label: 'Slip', path: c.cashData.slip },
    ]
    let rowY = y
    for (let i = 0; i < cashItems.length; i += 2) {
      const left = cashItems[i]
      const right = cashItems[i + 1]
      const yLeft = await addImageBlock(left.label, left.path, COL1_X)
      const yRight = right ? await addImageBlock(right.label, right.path, COL2_X) : rowY
      rowY = Math.max(yLeft, yRight)
      y = rowY
    }
    row2('Cheque Number', c.cashData.chequeNumber != null ? String(c.cashData.chequeNumber) : undefined)
    y += 4
  }

  if (c.paymentOption === 'lease' && c.leaseData) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('Lease - Requirement for registration', MARGIN, y)
    doc.line(MARGIN, y + 2, PAGE_W - MARGIN, y + 2)
    y += 10
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)

    row('Company Name', fmtUpload(c.leaseData.companyName), 1)
    row('Purchase Order Number', c.leaseData.purchaseOrderNumber != null ? String(c.leaseData.purchaseOrderNumber) : undefined, 2)

    const leaseItems = [
      { label: 'Copy of NIC', path: c.leaseData.copyOfNic },
      { label: 'Photograph 1', path: c.leaseData.photographOne },
      { label: 'Photograph 2', path: c.leaseData.photographTwo },
      { label: 'Payment Receipt', path: c.leaseData.paymentReceipt },
      { label: 'MTA 2', path: c.leaseData.mta2 },
      { label: 'MTA 3', path: c.leaseData.mta3 },
    ]
    let rowY = y
    for (let i = 0; i < leaseItems.length; i += 2) {
      const left = leaseItems[i]
      const right = leaseItems[i + 1]
      const yLeft = await addImageBlock(left.label, left.path, COL1_X)
      const yRight = right ? await addImageBlock(right.label, right.path, COL2_X) : rowY
      rowY = Math.max(yLeft, yRight)
      y = rowY
    }
    row2('Cheque Number', c.leaseData.chequeNumber != null ? String(c.leaseData.chequeNumber) : undefined)
  }

  return doc
}

async function downloadCustomerDetailPDF(c: DisplayCustomer, shopName: string) {
  const doc = await buildCustomerDetailPDF(c, shopName)
  doc.save(`Customer-${c.name ?? c.id}-Details.pdf`)
}

async function printCustomerDetailPDF(c: DisplayCustomer, shopName: string) {
  const doc = await buildCustomerDetailPDF(c, shopName)
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

function dtoToDisplay(c: CustomerDto) {
  return {
    id: String(c.id),
    name: c.name,
    phone: c.contactNumber != null ? String(c.contactNumber) : '',
    bikeNumber: c.chassisNumber,
    chassisNumber: c.chassisNumber,
    address: c.address ?? '',
    nameInFull: c.name,
    province: c.province ?? '',
    district: c.district ?? '',
    occupation: c.occupation ?? '',
    dateOfBirth: c.dateOfBirth ?? '',
    religion: c.religion ?? '',
    whatsAppNumber: c.whatsappNumber != null ? String(c.whatsappNumber) : '',
    nicOrBusinessRegNo: c.nic ?? '',
    model: c.modelDto?.name ?? '',
    modelId: c.modelId ?? c.modelDto?.id,
    motorNumber: c.motorNumber ?? '',
    colourOfVehicle: c.colorOfVehicle ?? '',
    dateOfPurchase: c.dateOfPurchase ?? '',
    aimaCareLoyaltyCardNo: c.loyalityCardNo != null ? String(c.loyalityCardNo) : '',
    dateOfDeliveryToCustomer: c.dateOfDelivery ?? '',
    sellingPrice: c.sellingAmount,
    registrationFee: c.registrationFees,
    advancePaymentAmount: c.advancePaymentAmount,
    advancePaymentDate: c.advancePaymentDate ?? '',
    balancePaymentAmount: c.balancePaymentAmount,
    balancePaymentDate: c.balancePaymentDate ?? '',
    paymentType: c.paymentDto?.name ?? '',
    paymentId: c.paymentId ?? c.paymentDto?.id,
    paymentOption: c.cashData ? ('cash' as const) : c.leaseData ? ('lease' as const) : undefined,
    cashData: c.cashData,
    leaseData: c.leaseData,
    status: c.status ?? 'pending',
  }
}

function filterBySearch(list: CustomerDto[], searchQuery: string): CustomerDto[] {
  const q = searchQuery.toLowerCase().trim()
  if (!q) return list
  return list.filter((c) => {
    const name = (c.name ?? '').toLowerCase()
    const phone = String(c.contactNumber ?? '')
    const whatsapp = String(c.whatsappNumber ?? '')
    const nic = (c.nic ?? '').toLowerCase()
    const address = (c.address ?? '').toLowerCase()
    const chassis = (c.chassisNumber ?? '').toLowerCase()
    const district = (c.district ?? '').toLowerCase()
    const province = (c.province ?? '').toLowerCase()
    return (
      name.includes(q) ||
      phone.includes(searchQuery) ||
      whatsapp.includes(searchQuery) ||
      nic.includes(q) ||
      address.includes(q) ||
      chassis.includes(q) ||
      district.includes(q) ||
      province.includes(q)
    )
  })
}

const PAGE_SIZE_OPTIONS = [10, 25, 50]

type StatusFilter = 'pending' | 'complete' | 'return'

export default function Customers() {
  const { shopDetail } = useShopDetail()
  const shopName = shopDetail?.name?.trim() || ''
  const [listContent, setListContent] = useState<CustomerDto[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateOfPurchaseFilter, setDateOfPurchaseFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending')
  const [viewCustomer, setViewCustomer] = useState<ReturnType<typeof dtoToDisplay> | null>(null)
  const [editCustomer, setEditCustomer] = useState<ReturnType<typeof dtoToDisplay> | null>(null)
  const [actionError, setActionError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const dateTrimmed = dateOfPurchaseFilter.trim()
    const fetchPromise = dateTrimmed
      ? getCustomersByDateOfPurchaseAndStatus(dateTrimmed, statusFilter, pageNumber, pageSize, true)
      : getCustomersByStatus(statusFilter, pageNumber, pageSize, true)
    fetchPromise.then((res) => {
      if (!cancelled) {
        setListContent(res.content)
        setTotalElements(res.totalElements)
        setTotalPages(res.totalPages)
      }
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [statusFilter, pageNumber, pageSize, dateOfPurchaseFilter])

  const displayList = filterBySearch(listContent, searchQuery)

  const refreshAll = () => {
    const dateTrimmed = dateOfPurchaseFilter.trim()
    const fetchPromise = dateTrimmed
      ? getCustomersByDateOfPurchaseAndStatus(dateTrimmed, statusFilter, pageNumber, pageSize, true)
      : getCustomersByStatus(statusFilter, pageNumber, pageSize, true)
    fetchPromise.then((res) => {
      setListContent(res.content)
      setTotalElements(res.totalElements)
      setTotalPages(res.totalPages)
    })
  }

  const handleStatusFilterClick = (status: StatusFilter) => {
    setStatusFilter(status)
    setPageNumber(1)
  }

  const handleDateOfPurchaseChange = (value: string) => {
    setDateOfPurchaseFilter(value)
    setPageNumber(1)
  }

  const handlePageSizeChange = (value: number) => {
    setPageSize(value)
    setPageNumber(1)
  }

  const startItem = totalElements === 0 ? 0 : (pageNumber - 1) * pageSize + 1
  const endItem = Math.min(pageNumber * pageSize, totalElements)

  const handleApproved = async () => {
    if (!editCustomer?.id) return
    setActionError('')
    setActionLoading(true)
    const result = await approveCustomer(parseInt(editCustomer.id, 10))
    setActionLoading(false)
    if (result.success) {
      refreshAll()
      setEditCustomer(null)
    } else {
      setActionError(result.error ?? 'Failed to approve')
    }
  }

  const handleReturn = async () => {
    if (!editCustomer?.id) return
    setActionError('')
    setActionLoading(true)
    const result = await returnCustomer(parseInt(editCustomer.id, 10))
    setActionLoading(false)
    if (result.success) {
      refreshAll()
      setEditCustomer(null)
    } else {
      setActionError(result.error ?? 'Failed to return')
    }
  }

  const handleDelivery = async () => {
    const detailCustomer = editCustomer ?? viewCustomer
    if (!detailCustomer?.id) return
    setActionError('')
    setActionLoading(true)
    const result = await deliveryCustomer(parseInt(detailCustomer.id, 10))
    setActionLoading(false)
    if (result.success) {
      const today = new Date().toISOString().split('T')[0]
      if (editCustomer?.id === detailCustomer.id) setEditCustomer({ ...editCustomer, dateOfDeliveryToCustomer: today })
      if (viewCustomer?.id === detailCustomer.id) setViewCustomer({ ...viewCustomer, dateOfDeliveryToCustomer: today })
      refreshAll()
      await Swal.fire({ icon: 'success', title: 'Done', text: 'Date of Delivery updated to today.' })
    } else {
      setActionError(result.error ?? 'Failed to update delivery')
    }
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editCustomer?.id) return
    setActionError('')
    setActionLoading(true)
    const customerId = parseInt(editCustomer.id, 10)
    const parseNum = (s: string) => { const n = parseInt(String(s || ''), 10); return !isNaN(n) ? n : undefined }
    const req = {
      id: customerId,
      name: editCustomer.nameInFull ?? editCustomer.name,
      address: editCustomer.address,
      province: editCustomer.province,
      district: editCustomer.district,
      occupation: editCustomer.occupation,
      religion: editCustomer.religion,
      nic: editCustomer.nicOrBusinessRegNo,
      chassisNumber: editCustomer.chassisNumber,
      motorNumber: editCustomer.motorNumber,
      colorOfVehicle: editCustomer.colourOfVehicle,
      modelId: editCustomer.modelId,
      paymentId: editCustomer.paymentId,
      dateOfBirth: editCustomer.dateOfBirth || undefined,
      contactNumber: parseNum(editCustomer.phone),
      whatsappNumber: parseNum(editCustomer.whatsAppNumber),
      dateOfPurchase: editCustomer.dateOfPurchase || undefined,
      loyalityCardNo: parseNum(editCustomer.aimaCareLoyaltyCardNo),
      dateOfDelivery: editCustomer.dateOfDeliveryToCustomer || undefined,
      sellingAmount: editCustomer.sellingPrice ?? undefined,
      registrationFees: editCustomer.registrationFee ?? undefined,
      advancePaymentAmount: editCustomer.advancePaymentAmount ?? undefined,
      advancePaymentDate: editCustomer.advancePaymentDate || undefined,
      balancePaymentAmount: editCustomer.balancePaymentAmount ?? undefined,
      balancePaymentDate: editCustomer.balancePaymentDate || undefined,
    }
    const result = await updateCustomer(req)
    let err = result.success ? '' : (result.error ?? 'Failed to update customer')
    if (result.success && editCustomer.paymentOption === 'cash' && editCustomer.cashData?.id) {
      const cashRes = await updateCash({
        id: editCustomer.cashData.id,
        customerId,
        copyOfNic: editCustomer.cashData.copyOfNic,
        photographOne: editCustomer.cashData.photographOne,
        photographTwo: editCustomer.cashData.photographTwo,
        paymentReceipt: editCustomer.cashData.paymentReceipt,
        mta2: editCustomer.cashData.mta2,
        slip: editCustomer.cashData.slip,
        chequeNumber: parseNum(String(editCustomer.cashData.chequeNumber ?? '')),
      })
      if (!cashRes.success) err = cashRes.error ?? 'Failed to update cash'
    }
    if (result.success && !err && editCustomer.paymentOption === 'lease' && editCustomer.leaseData?.id) {
      const leaseRes = await updateLease({
        id: editCustomer.leaseData.id,
        customerId,
        companyName: editCustomer.leaseData.companyName,
        purchaseOrderNumber: parseNum(String(editCustomer.leaseData.purchaseOrderNumber ?? '')),
        copyOfNic: editCustomer.leaseData.copyOfNic,
        photographOne: editCustomer.leaseData.photographOne,
        photographTwo: editCustomer.leaseData.photographTwo,
        paymentReceipt: editCustomer.leaseData.paymentReceipt,
        mta2: editCustomer.leaseData.mta2,
        mta3: editCustomer.leaseData.mta3,
        chequeNumber: parseNum(String(editCustomer.leaseData.chequeNumber ?? '')),
      })
      if (!leaseRes.success) err = leaseRes.error ?? 'Failed to update lease'
    }
    setActionLoading(false)
    setActionError(err)
    if (result.success && !err) {
      await Swal.fire({ icon: 'success', title: 'Saved', text: 'Customer updated successfully.' })
      refreshAll()
      setEditCustomer(null)
    }
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 p-2" style={{ background: 'rgba(170, 51, 106, 0.1)' }}>
            <Users size={28} style={{ color: 'var(--aima-primary)' }} />
          </div>
          <h2 className="mb-0" style={{ color: 'var(--aima-secondary)' }}>Customers</h2>
        </div>
        <div className="d-flex gap-1">
          <Button
            size="sm"
            variant={statusFilter === 'pending' ? 'default' : 'outline'}
            onClick={() => handleStatusFilterClick('pending')}
            style={statusFilter === 'pending' ? { backgroundColor: 'var(--aima-primary)' } : {}}
          >
            Pending
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'complete' ? 'default' : 'outline'}
            onClick={() => handleStatusFilterClick('complete')}
            style={statusFilter === 'complete' ? { backgroundColor: 'var(--aima-primary)' } : {}}
          >
            Complete
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'return' ? 'default' : 'outline'}
            onClick={() => handleStatusFilterClick('return')}
            style={statusFilter === 'return' ? { backgroundColor: 'var(--aima-primary)' } : {}}
          >
            Return
          </Button>
        </div>
      </div>

      {/* Customer details inline - View (read-only) or Edit (form) */}
      {(viewCustomer || editCustomer) && (() => {
        const detailCustomer = editCustomer ?? viewCustomer
        const isEdit = !!editCustomer
        return (
        <div className="card mb-4 customer-detail-print">
          <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
            <h5 className="mb-0">{isEdit ? 'Edit' : 'Customer Details'} - {detailCustomer.name}</h5>
            <div className="d-flex flex-wrap gap-2 align-items-center no-print">
              <Button size="sm" disabled={pdfLoading} onClick={async () => { setPdfLoading(true); await downloadCustomerDetailPDF(detailCustomer, shopName); setPdfLoading(false); }} style={{ backgroundColor: 'var(--aima-primary)', color: '#fff', border: 'none' }}>
                <FileDown size={16} className="me-1" />
                {pdfLoading ? 'Generating...' : 'PDF'}
              </Button>
              <Button variant="outline" size="sm" disabled={pdfLoading} onClick={async () => { setPdfLoading(true); await printCustomerDetailPDF(detailCustomer, shopName); setPdfLoading(false); }} style={{ borderColor: 'var(--aima-secondary)', color: 'var(--aima-secondary)' }}>
                <Printer size={16} className="me-1" />
                {pdfLoading ? 'Generating...' : 'Print'}
              </Button>
              {editCustomer && editCustomer.status === 'pending' && (
                <>
                  <Button size="sm" className="!bg-[#22c55e] !text-white hover:!bg-[#1a9e47] border-0" onClick={handleApproved} disabled={actionLoading}>Approved</Button>
                  <Button size="sm" className="!bg-[#dc2626] !text-white hover:!bg-[#b91c1c] border-0" onClick={handleReturn} disabled={actionLoading}>Return</Button>
                </>
              )}
              {editCustomer && detailCustomer.status === 'complete' && (
                <Button
                  size="sm"
                  onClick={handleDelivery}
                  disabled={actionLoading || !!(detailCustomer.dateOfDeliveryToCustomer && detailCustomer.dateOfDeliveryToCustomer.trim())}
                  className="!bg-[#eab308] !text-black hover:!bg-[#ca9a04] border-0"
                >
                  Delivery
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => { setViewCustomer(null); setEditCustomer(null); setActionError(''); }}>
                <ArrowLeft size={16} className="me-1" />
                Back to list
              </Button>
            </div>
          </div>
          <div className="card-body customer-document-body">
            {actionError && <div className="alert alert-danger py-2 no-print">{actionError}</div>}
            {isEdit ? (
              <form onSubmit={handleSaveEdit}>
                <h6 className="border-bottom pb-2 mb-3">Customer Details</h6>
                <div className="row g-2 mb-4">
                  <div className="col-md-6"><label className="form-label">Name in Full</label><Input className="form-control" value={detailCustomer.nameInFull ?? detailCustomer.name ?? ''} onChange={(e) => setEditCustomer({ ...detailCustomer, nameInFull: e.target.value, name: e.target.value })} /></div>
                  <div className="col-md-6"><label className="form-label">Contact Number</label><Input type="tel" className="form-control" value={detailCustomer.phone ?? ''} onChange={(e) => setEditCustomer({ ...detailCustomer, phone: e.target.value })} /></div>
                  <div className="col-md-6"><label className="form-label">Address</label><Input className="form-control" value={detailCustomer.address ?? ''} onChange={(e) => setEditCustomer({ ...detailCustomer, address: e.target.value })} /></div>
                  <div className="col-md-6"><label className="form-label">Province</label><Input className="form-control" value={detailCustomer.province ?? ''} onChange={(e) => setEditCustomer({ ...detailCustomer, province: e.target.value })} /></div>
                  <div className="col-md-6"><label className="form-label">District</label><Input className="form-control" value={detailCustomer.district ?? ''} onChange={(e) => setEditCustomer({ ...detailCustomer, district: e.target.value })} /></div>
                  <div className="col-md-6"><label className="form-label">Occupation</label><Input className="form-control" value={detailCustomer.occupation ?? ''} onChange={(e) => setEditCustomer({ ...detailCustomer, occupation: e.target.value })} /></div>
                  <div className="col-md-6"><label className="form-label">Date of Birth</label><Input type="date" className="form-control" value={detailCustomer.dateOfBirth ?? ''} onChange={(e) => setEditCustomer({ ...detailCustomer, dateOfBirth: e.target.value })} /></div>
                  <div className="col-md-6"><label className="form-label">Religion</label><Input className="form-control" value={detailCustomer.religion ?? ''} onChange={(e) => setEditCustomer({ ...detailCustomer, religion: e.target.value })} /></div>
                  <div className="col-md-6"><label className="form-label">WhatsApp Number</label><Input type="tel" className="form-control" value={detailCustomer.whatsAppNumber ?? ''} onChange={(e) => setEditCustomer({ ...detailCustomer, whatsAppNumber: e.target.value })} /></div>
                  <div className="col-md-6"><label className="form-label">NIC/Business Reg No</label><Input className="form-control" value={detailCustomer.nicOrBusinessRegNo ?? ''} onChange={(e) => setEditCustomer({ ...detailCustomer, nicOrBusinessRegNo: e.target.value })} /></div>
                </div>
                <h6 className="border-bottom pb-2 mb-3">Vehicle Purchase Details</h6>
                <div className="row g-2 mb-4">
                  <div className="col-md-6"><label className="form-label">Model</label><Input className="form-control bg-light" value={detailCustomer.model ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">Chassis Number</label><Input className="form-control bg-light" value={detailCustomer.chassisNumber ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">Motor Number</label><Input className="form-control bg-light" value={detailCustomer.motorNumber ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">Colour</label><Input className="form-control bg-light" value={detailCustomer.colourOfVehicle ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">Date of Purchase</label><Input type="date" className="form-control" value={detailCustomer.dateOfPurchase ?? ''} onChange={(e) => setEditCustomer({ ...detailCustomer, dateOfPurchase: e.target.value })} /></div>
                  <div className="col-md-6"><label className="form-label">Selling Price</label><Input type="number" className="form-control" value={detailCustomer.sellingPrice ?? ''} onChange={(e) => setEditCustomer({ ...detailCustomer, sellingPrice: e.target.value ? parseFloat(e.target.value) : undefined })} /></div>
                  <div className="col-md-6"><label className="form-label">Registration Fee</label><Input type="number" className="form-control" value={detailCustomer.registrationFee ?? ''} onChange={(e) => setEditCustomer({ ...detailCustomer, registrationFee: e.target.value ? parseFloat(e.target.value) : undefined })} /></div>
                  <div className="col-md-6"><label className="form-label">Advance Payment</label><Input type="number" className="form-control" value={detailCustomer.advancePaymentAmount ?? ''} onChange={(e) => setEditCustomer({ ...detailCustomer, advancePaymentAmount: e.target.value ? parseFloat(e.target.value) : undefined })} /></div>
                  <div className="col-md-6"><label className="form-label">Advance Date</label><Input type="date" className="form-control" value={detailCustomer.advancePaymentDate ?? ''} onChange={(e) => setEditCustomer({ ...detailCustomer, advancePaymentDate: e.target.value })} /></div>
                  <div className="col-md-6"><label className="form-label">Balance Amount</label><Input type="number" className="form-control" value={detailCustomer.balancePaymentAmount ?? ''} onChange={(e) => setEditCustomer({ ...detailCustomer, balancePaymentAmount: e.target.value ? parseFloat(e.target.value) : undefined })} /></div>
                  <div className="col-md-6"><label className="form-label">Balance Date</label><Input type="date" className="form-control" value={detailCustomer.balancePaymentDate ?? ''} onChange={(e) => setEditCustomer({ ...detailCustomer, balancePaymentDate: e.target.value })} /></div>
                  <div className="col-md-6"><label className="form-label">Payment Type</label><Input className="form-control" value={detailCustomer.paymentType ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">Date of Delivery</label><Input type="date" className="form-control" value={detailCustomer.dateOfDeliveryToCustomer ?? ''} onChange={(e) => setEditCustomer({ ...detailCustomer, dateOfDeliveryToCustomer: e.target.value })} /></div>
                  <div className="col-md-6"><label className="form-label">AIMA CARE Loyalty Card</label><Input className="form-control" value={detailCustomer.aimaCareLoyaltyCardNo ?? ''} onChange={(e) => setEditCustomer({ ...detailCustomer, aimaCareLoyaltyCardNo: e.target.value })} /></div>
                </div>
                {detailCustomer.paymentOption === 'cash' && detailCustomer.cashData && (
                  <>
                    <h6 className="border-bottom pb-2 mb-3">Cash - Requirement for registration</h6>
                    <div className="row g-2 mb-4">
                      <FileUploadField label="Copy of NIC" value={detailCustomer.cashData.copyOfNic ?? ''} onChange={(v) => setEditCustomer({ ...detailCustomer, cashData: { ...detailCustomer.cashData!, copyOfNic: v } })} subfolder="cash" fieldName="copyOfNic" />
                      <FileUploadField label="Photograph 1" value={detailCustomer.cashData.photographOne ?? ''} onChange={(v) => setEditCustomer({ ...detailCustomer, cashData: { ...detailCustomer.cashData!, photographOne: v } })} subfolder="cash" fieldName="photographOne" />
                      <FileUploadField label="Photograph 2" value={detailCustomer.cashData.photographTwo ?? ''} onChange={(v) => setEditCustomer({ ...detailCustomer, cashData: { ...detailCustomer.cashData!, photographTwo: v } })} subfolder="cash" fieldName="photographTwo" />
                      <FileUploadField label="Payment Receipt" value={detailCustomer.cashData.paymentReceipt ?? ''} onChange={(v) => setEditCustomer({ ...detailCustomer, cashData: { ...detailCustomer.cashData!, paymentReceipt: v } })} subfolder="cash" fieldName="paymentReceipt" />
                      <FileUploadField label="MTA 2" value={detailCustomer.cashData.mta2 ?? ''} onChange={(v) => setEditCustomer({ ...detailCustomer, cashData: { ...detailCustomer.cashData!, mta2: v } })} subfolder="cash" fieldName="mta2" />
                      <FileUploadField label="Slip" value={detailCustomer.cashData.slip ?? ''} onChange={(v) => setEditCustomer({ ...detailCustomer, cashData: { ...detailCustomer.cashData!, slip: v } })} subfolder="cash" fieldName="slip" />
                      <div className="col-md-6"><label className="form-label">Cheque Number</label><Input type="number" className="form-control" value={String(detailCustomer.cashData.chequeNumber ?? '')} onChange={(e) => setEditCustomer({ ...detailCustomer, cashData: { ...detailCustomer.cashData!, chequeNumber: e.target.value } })} /></div>
                    </div>
                  </>
                )}
                {detailCustomer.paymentOption === 'lease' && detailCustomer.leaseData && (
                  <>
                    <h6 className="border-bottom pb-2 mb-3">Lease - Requirement for registration</h6>
                    <div className="row g-2 mb-4">
                      <FileUploadField label="Company Name" value={detailCustomer.leaseData.companyName ?? ''} onChange={(v) => setEditCustomer({ ...detailCustomer, leaseData: { ...detailCustomer.leaseData!, companyName: v } })} subfolder="lease" fieldName="companyName" />
                      <div className="col-md-6"><label className="form-label">Purchase Order Number</label><Input type="number" className="form-control" value={String(detailCustomer.leaseData.purchaseOrderNumber ?? '')} onChange={(e) => setEditCustomer({ ...detailCustomer, leaseData: { ...detailCustomer.leaseData!, purchaseOrderNumber: e.target.value } })} /></div>
                      <FileUploadField label="Copy of NIC" value={detailCustomer.leaseData.copyOfNic ?? ''} onChange={(v) => setEditCustomer({ ...detailCustomer, leaseData: { ...detailCustomer.leaseData!, copyOfNic: v } })} subfolder="lease" fieldName="copyOfNic" />
                      <FileUploadField label="Photograph 1" value={detailCustomer.leaseData.photographOne ?? ''} onChange={(v) => setEditCustomer({ ...detailCustomer, leaseData: { ...detailCustomer.leaseData!, photographOne: v } })} subfolder="lease" fieldName="photographOne" />
                      <FileUploadField label="Photograph 2" value={detailCustomer.leaseData.photographTwo ?? ''} onChange={(v) => setEditCustomer({ ...detailCustomer, leaseData: { ...detailCustomer.leaseData!, photographTwo: v } })} subfolder="lease" fieldName="photographTwo" />
                      <FileUploadField label="Payment Receipt" value={detailCustomer.leaseData.paymentReceipt ?? ''} onChange={(v) => setEditCustomer({ ...detailCustomer, leaseData: { ...detailCustomer.leaseData!, paymentReceipt: v } })} subfolder="lease" fieldName="paymentReceipt" />
                      <FileUploadField label="MTA 2" value={detailCustomer.leaseData.mta2 ?? ''} onChange={(v) => setEditCustomer({ ...detailCustomer, leaseData: { ...detailCustomer.leaseData!, mta2: v } })} subfolder="lease" fieldName="mta2" />
                      <FileUploadField label="MTA 3" value={detailCustomer.leaseData.mta3 ?? ''} onChange={(v) => setEditCustomer({ ...detailCustomer, leaseData: { ...detailCustomer.leaseData!, mta3: v } })} subfolder="lease" fieldName="mta3" />
                      <div className="col-md-6"><label className="form-label">Cheque Number</label><Input type="number" className="form-control" value={String(detailCustomer.leaseData.chequeNumber ?? '')} onChange={(e) => setEditCustomer({ ...detailCustomer, leaseData: { ...detailCustomer.leaseData!, chequeNumber: e.target.value } })} /></div>
                    </div>
                  </>
                )}
                <div className="d-flex justify-content-end gap-2 mt-4 no-print">
                  <Button type="submit" disabled={actionLoading} style={{ backgroundColor: 'var(--aima-primary)' }}>Save</Button>
                </div>
              </form>
            ) : (
              <>
                <h6 className="border-bottom pb-2 mb-3">Customer Details</h6>
                <div className="row g-2 mb-4">
                  <div className="col-md-6"><label className="form-label">Name in Full</label><Input className="form-control bg-light" value={detailCustomer.nameInFull ?? detailCustomer.name ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">Contact Number</label><Input type="tel" className="form-control bg-light" value={detailCustomer.phone ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">Address</label><Input className="form-control bg-light" value={detailCustomer.address ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">Province</label><Input className="form-control bg-light" value={detailCustomer.province ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">District</label><Input className="form-control bg-light" value={detailCustomer.district ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">Occupation</label><Input className="form-control bg-light" value={detailCustomer.occupation ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">Date of Birth</label><Input type="date" className="form-control bg-light" value={detailCustomer.dateOfBirth ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">Religion</label><Input className="form-control bg-light" value={detailCustomer.religion ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">WhatsApp Number</label><Input type="tel" className="form-control bg-light" value={detailCustomer.whatsAppNumber ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">NIC/Business Reg No</label><Input className="form-control bg-light" value={detailCustomer.nicOrBusinessRegNo ?? ''} readOnly /></div>
                </div>
                <h6 className="border-bottom pb-2 mb-3">Vehicle Purchase Details</h6>
                <div className="row g-2 mb-4">
                  <div className="col-md-6"><label className="form-label">Model</label><Input className="form-control bg-light" value={detailCustomer.model ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">Chassis Number</label><Input className="form-control bg-light" value={detailCustomer.chassisNumber ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">Motor Number</label><Input className="form-control bg-light" value={detailCustomer.motorNumber ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">Colour</label><Input className="form-control bg-light" value={detailCustomer.colourOfVehicle ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">Date of Purchase</label><Input type="date" className="form-control bg-light" value={detailCustomer.dateOfPurchase ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">Selling Price</label><Input type="number" className="form-control bg-light" value={detailCustomer.sellingPrice ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">Registration Fee</label><Input type="number" className="form-control bg-light" value={detailCustomer.registrationFee ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">Advance Payment</label><Input type="number" className="form-control bg-light" value={detailCustomer.advancePaymentAmount ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">Advance Date</label><Input type="date" className="form-control bg-light" value={detailCustomer.advancePaymentDate ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">Balance Amount</label><Input type="number" className="form-control bg-light" value={detailCustomer.balancePaymentAmount ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">Balance Date</label><Input type="date" className="form-control bg-light" value={detailCustomer.balancePaymentDate ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">Payment Type</label><Input className="form-control bg-light" value={detailCustomer.paymentType ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">Date of Delivery</label><Input type="date" className="form-control bg-light" value={detailCustomer.dateOfDeliveryToCustomer ?? ''} readOnly /></div>
                  <div className="col-md-6"><label className="form-label">AIMA CARE Loyalty Card</label><Input className="form-control bg-light" value={detailCustomer.aimaCareLoyaltyCardNo ?? ''} readOnly /></div>
                </div>
                {detailCustomer.paymentOption === 'cash' && detailCustomer.cashData && (
                  <>
                    <h6 className="border-bottom pb-2 mb-3">Cash - Requirement for registration</h6>
                    <div className="row g-2 mb-4">
                      <div className="col-md-6">
                        <label className="form-label">Copy of NIC</label>
                        {(detailCustomer.cashData.copyOfNic && (isUploadPath(detailCustomer.cashData.copyOfNic) || detailCustomer.cashData.copyOfNic.startsWith('http') || detailCustomer.cashData.copyOfNic.startsWith('data:'))) ? (
                          <UploadDisplay path={detailCustomer.cashData.copyOfNic} label="" />
                        ) : <Input className="form-control bg-light" value={detailCustomer.cashData.copyOfNic ?? ''} readOnly />}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Photograph 1</label>
                        {(detailCustomer.cashData.photographOne && (isUploadPath(detailCustomer.cashData.photographOne) || detailCustomer.cashData.photographOne.startsWith('http') || detailCustomer.cashData.photographOne.startsWith('data:'))) ? (
                          <UploadDisplay path={detailCustomer.cashData.photographOne} label="" />
                        ) : <Input className="form-control bg-light" value={detailCustomer.cashData.photographOne ?? ''} readOnly />}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Photograph 2</label>
                        {(detailCustomer.cashData.photographTwo && (isUploadPath(detailCustomer.cashData.photographTwo) || detailCustomer.cashData.photographTwo.startsWith('http') || detailCustomer.cashData.photographTwo.startsWith('data:'))) ? (
                          <UploadDisplay path={detailCustomer.cashData.photographTwo} label="" />
                        ) : <Input className="form-control bg-light" value={detailCustomer.cashData.photographTwo ?? ''} readOnly />}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Payment Receipt</label>
                        {(detailCustomer.cashData.paymentReceipt && (isUploadPath(detailCustomer.cashData.paymentReceipt) || detailCustomer.cashData.paymentReceipt.startsWith('http') || detailCustomer.cashData.paymentReceipt.startsWith('data:'))) ? (
                          <UploadDisplay path={detailCustomer.cashData.paymentReceipt} label="" />
                        ) : <Input className="form-control bg-light" value={detailCustomer.cashData.paymentReceipt ?? ''} readOnly />}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">MTA 2</label>
                        {(detailCustomer.cashData.mta2 && (isUploadPath(detailCustomer.cashData.mta2) || detailCustomer.cashData.mta2.startsWith('http') || detailCustomer.cashData.mta2.startsWith('data:'))) ? (
                          <UploadDisplay path={detailCustomer.cashData.mta2} label="" />
                        ) : <Input className="form-control bg-light" value={detailCustomer.cashData.mta2 ?? ''} readOnly />}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Slip</label>
                        {(detailCustomer.cashData.slip && (isUploadPath(detailCustomer.cashData.slip) || detailCustomer.cashData.slip.startsWith('http') || detailCustomer.cashData.slip.startsWith('data:'))) ? (
                          <UploadDisplay path={detailCustomer.cashData.slip} label="" />
                        ) : <Input className="form-control bg-light" value={detailCustomer.cashData.slip ?? ''} readOnly />}
                      </div>
                      <div className="col-md-6"><label className="form-label">Cheque Number</label><Input type="number" className="form-control bg-light" value={String(detailCustomer.cashData.chequeNumber ?? '')} readOnly /></div>
                    </div>
                  </>
                )}
                {detailCustomer.paymentOption === 'lease' && detailCustomer.leaseData && (
                  <>
                    <h6 className="border-bottom pb-2 mb-3">Lease - Requirement for registration</h6>
                    <div className="row g-2 mb-4">
                      <div className="col-md-6">
                        <label className="form-label">Company Name</label>
                        {(detailCustomer.leaseData.companyName && (isUploadPath(detailCustomer.leaseData.companyName) || detailCustomer.leaseData.companyName.startsWith('http') || detailCustomer.leaseData.companyName.startsWith('data:'))) ? (
                          <UploadDisplay path={detailCustomer.leaseData.companyName} label="" />
                        ) : <Input className="form-control bg-light" value={detailCustomer.leaseData.companyName ?? ''} readOnly />}
                      </div>
                      <div className="col-md-6"><label className="form-label">Purchase Order Number</label><Input type="number" className="form-control bg-light" value={String(detailCustomer.leaseData.purchaseOrderNumber ?? '')} readOnly /></div>
                      <div className="col-md-6">
                        <label className="form-label">Copy of NIC</label>
                        {(detailCustomer.leaseData.copyOfNic && (isUploadPath(detailCustomer.leaseData.copyOfNic) || detailCustomer.leaseData.copyOfNic.startsWith('http') || detailCustomer.leaseData.copyOfNic.startsWith('data:'))) ? (
                          <UploadDisplay path={detailCustomer.leaseData.copyOfNic} label="" />
                        ) : <Input className="form-control bg-light" value={detailCustomer.leaseData.copyOfNic ?? ''} readOnly />}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Photograph 1</label>
                        {(detailCustomer.leaseData.photographOne && (isUploadPath(detailCustomer.leaseData.photographOne) || detailCustomer.leaseData.photographOne.startsWith('http') || detailCustomer.leaseData.photographOne.startsWith('data:'))) ? (
                          <UploadDisplay path={detailCustomer.leaseData.photographOne} label="" />
                        ) : <Input className="form-control bg-light" value={detailCustomer.leaseData.photographOne ?? ''} readOnly />}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Photograph 2</label>
                        {(detailCustomer.leaseData.photographTwo && (isUploadPath(detailCustomer.leaseData.photographTwo) || detailCustomer.leaseData.photographTwo.startsWith('http') || detailCustomer.leaseData.photographTwo.startsWith('data:'))) ? (
                          <UploadDisplay path={detailCustomer.leaseData.photographTwo} label="" />
                        ) : <Input className="form-control bg-light" value={detailCustomer.leaseData.photographTwo ?? ''} readOnly />}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Payment Receipt</label>
                        {(detailCustomer.leaseData.paymentReceipt && (isUploadPath(detailCustomer.leaseData.paymentReceipt) || detailCustomer.leaseData.paymentReceipt.startsWith('http') || detailCustomer.leaseData.paymentReceipt.startsWith('data:'))) ? (
                          <UploadDisplay path={detailCustomer.leaseData.paymentReceipt} label="" />
                        ) : <Input className="form-control bg-light" value={detailCustomer.leaseData.paymentReceipt ?? ''} readOnly />}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">MTA 2</label>
                        {(detailCustomer.leaseData.mta2 && (isUploadPath(detailCustomer.leaseData.mta2) || detailCustomer.leaseData.mta2.startsWith('http') || detailCustomer.leaseData.mta2.startsWith('data:'))) ? (
                          <UploadDisplay path={detailCustomer.leaseData.mta2} label="" />
                        ) : <Input className="form-control bg-light" value={detailCustomer.leaseData.mta2 ?? ''} readOnly />}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">MTA 3</label>
                        {(detailCustomer.leaseData.mta3 && (isUploadPath(detailCustomer.leaseData.mta3) || detailCustomer.leaseData.mta3.startsWith('http') || detailCustomer.leaseData.mta3.startsWith('data:'))) ? (
                          <UploadDisplay path={detailCustomer.leaseData.mta3} label="" />
                        ) : <Input className="form-control bg-light" value={detailCustomer.leaseData.mta3 ?? ''} readOnly />}
                      </div>
                      <div className="col-md-6"><label className="form-label">Cheque Number</label><Input type="number" className="form-control bg-light" value={String(detailCustomer.leaseData.chequeNumber ?? '')} readOnly /></div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        )
      })()}

      {/* Table card: show only when NOT showing customer detail (view or edit) */}
      {!viewCustomer && !editCustomer && (
        <div className="card">
          <div className="card-body">
            <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
              <Input
                placeholder="Search by name, phone, NIC, address..."
                style={{ maxWidth: '320px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Input
                type="date"
                className="form-control"
                style={{ maxWidth: '180px' }}
                value={dateOfPurchaseFilter}
                onChange={(e) => handleDateOfPurchaseChange(e.target.value)}
                title="Filter by Date of Purchase"
              />
            </div>
            {loading ? (
              <p className="text-muted mb-0">Loading customers...</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Phone Number</th>
                      <th>NIC Number</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayList.map((customer) => (
                      <tr key={customer.id}>
                        <td className="fw-medium align-middle">{customer.name ?? '-'}</td>
                        <td className="align-middle">{customer.contactNumber != null ? String(customer.contactNumber) : customer.whatsappNumber != null ? String(customer.whatsappNumber) : '-'}</td>
                        <td className="align-middle">{customer.nic ?? '-'}</td>
                        <td className="align-middle">
                          <div className="d-flex align-items-center gap-1">
                            <Button variant="ghost" size="sm" className="p-1 d-inline-flex align-items-center" onClick={() => { setViewCustomer(dtoToDisplay(customer)); setEditCustomer(null); }} title="View details">
                              <ViewIcon size={20} className="text-primary" />
                            </Button>
                            <Button variant="ghost" size="sm" className="p-1 d-inline-flex align-items-center" title="Edit" type="button" onClick={() => { setEditCustomer(dtoToDisplay(customer)); setViewCustomer(null); setActionError(''); }}>
                              <EditIcon size={18} className="text-dark" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && displayList.length === 0 && (
              <p className="text-muted mb-0 mt-2">No {statusFilter} customers found</p>
            )}
          </div>
          {/* Table pagination footer */}
          <div className="card-footer border-top bg-light d-flex flex-wrap align-items-center justify-content-between gap-2 py-2">
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">Rows per page</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto', minWidth: '70px' }}
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <span className="text-muted small">
                  {totalElements === 0 ? '0' : `${startItem}–${endItem}`} of {totalElements}
                </span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber(1)}
                  title="First page"
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  title="Previous"
                >
                  Prev
                </Button>
                <span className="px-2 text-muted small">
                  Page {pageNumber} of {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pageNumber >= totalPages}
                  onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                  title="Next"
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pageNumber >= totalPages}
                  onClick={() => setPageNumber(totalPages)}
                  title="Last page"
                >
                  Last
                </Button>
              </div>
            </div>
        </div>
      )}

    </div>
  )
}
