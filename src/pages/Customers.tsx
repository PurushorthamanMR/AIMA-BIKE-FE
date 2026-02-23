import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCustomersByStatus, approveCustomer, returnCustomer, type CustomerDto } from '@/lib/customerApi'
import { formatCurrency } from '@/lib/utils'
import { Eye, Pencil, ArrowLeft } from 'lucide-react'
import { UploadDisplay } from '@/components/UploadDisplay'
import { isUploadPath } from '@/lib/uploadApi'

function dtoToDisplay(c: CustomerDto) {
  return {
    id: String(c.id),
    name: c.name,
    phone: c.contactNumber != null ? String(c.contactNumber) : '',
    bikeNumber: c.chassisNumber,
    chassisNumber: c.chassisNumber,
    address: c.address,
    nameInFull: c.name,
    province: c.province ?? '',
    district: c.district ?? '',
    occupation: c.occupation ?? '',
    dateOfBirth: c.dateOfBirth ?? '',
    religion: c.religion ?? '',
    whatsAppNumber: c.whatsappNumber != null ? String(c.whatsappNumber) : '',
    nicOrBusinessRegNo: c.nic,
    model: c.modelDto?.name ?? '',
    motorNumber: c.motorNumber,
    colourOfVehicle: c.colorOfVehicle,
    dateOfPurchase: c.dateOfPurchase,
    aimaCareLoyaltyCardNo: c.loyalityCardNo != null ? String(c.loyalityCardNo) : '',
    dateOfDeliveryToCustomer: c.dateOfDelivery,
    sellingPrice: c.sellingAmount,
    registrationFee: c.registrationFees,
    advancePaymentAmount: c.advancePaymentAmount,
    advancePaymentDate: c.advancePaymentDate ?? '',
    balancePaymentAmount: c.balancePaymentAmount,
    balancePaymentDate: c.balancePaymentDate ?? '',
    paymentType: c.paymentDto?.name ?? '',
    paymentOption: c.cashData ? ('cash' as const) : c.leaseData ? ('lease' as const) : undefined,
    cashData: c.cashData,
    leaseData: c.leaseData,
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
  const [listContent, setListContent] = useState<CustomerDto[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending')
  const [viewCustomer, setViewCustomer] = useState<ReturnType<typeof dtoToDisplay> | null>(null)
  const [editCustomer, setEditCustomer] = useState<ReturnType<typeof dtoToDisplay> | null>(null)
  const [actionError, setActionError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getCustomersByStatus(statusFilter, pageNumber, pageSize, true).then((res) => {
      if (!cancelled) {
        setListContent(res.content)
        setTotalElements(res.totalElements)
        setTotalPages(res.totalPages)
      }
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [statusFilter, pageNumber, pageSize])

  const displayList = filterBySearch(listContent, searchQuery)

  const refreshAll = () => {
    getCustomersByStatus(statusFilter, pageNumber, pageSize, true).then((res) => {
      setListContent(res.content)
      setTotalElements(res.totalElements)
      setTotalPages(res.totalPages)
    })
  }

  const handleStatusFilterChange = (value: StatusFilter) => {
    setStatusFilter(value)
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

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Customers</h2>
      </div>

      {/* Customer details inline (form) - show for both View and Edit */}
      {(viewCustomer || editCustomer) && (() => {
        const detailCustomer = editCustomer ?? viewCustomer
        return (
        <div className="card mb-4">
          <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
            <h5 className="mb-0">Customer Details - {detailCustomer.name}</h5>
            <div className="d-flex flex-wrap gap-2 align-items-center">
              {editCustomer && (
                <>
                  <Button
                    size="sm"
                    style={{ backgroundColor: '#28a745', color: 'white' }}
                    onClick={handleApproved}
                    disabled={actionLoading}
                  >
                    Approved
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-info border-info"
                    onClick={handleReturn}
                    disabled={actionLoading}
                  >
                    Return
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => { setViewCustomer(null); setEditCustomer(null); setActionError(''); }}>
                <ArrowLeft size={16} className="me-1" />
                Back to list
              </Button>
            </div>
          </div>
          <div className="card-body">
            {actionError && <div className="alert alert-danger py-2">{actionError}</div>}
            <h6 className="border-bottom pb-2 mb-3">Customer Details</h6>
            <div className="row g-2 mb-4">
              <div className="col-md-6"><strong>Name in Full:</strong> {detailCustomer.nameInFull ?? detailCustomer.name ?? '-'}</div>
              <div className="col-md-6"><strong>Contact Number:</strong> {detailCustomer.phone ?? '-'}</div>
              <div className="col-md-6"><strong>Address:</strong> {detailCustomer.address ?? '-'}</div>
              <div className="col-md-6"><strong>Province:</strong> {detailCustomer.province ?? '-'}</div>
              <div className="col-md-6"><strong>District:</strong> {detailCustomer.district ?? '-'}</div>
              <div className="col-md-6"><strong>Occupation:</strong> {detailCustomer.occupation ?? '-'}</div>
              <div className="col-md-6"><strong>Date of Birth:</strong> {detailCustomer.dateOfBirth ?? '-'}</div>
              <div className="col-md-6"><strong>Religion:</strong> {detailCustomer.religion ?? '-'}</div>
              <div className="col-md-6"><strong>WhatsApp Number:</strong> {detailCustomer.whatsAppNumber ?? '-'}</div>
              <div className="col-md-6"><strong>NIC/Business Reg No:</strong> {detailCustomer.nicOrBusinessRegNo ?? '-'}</div>
            </div>
            <h6 className="border-bottom pb-2 mb-3">Vehicle Purchase Details</h6>
            <div className="row g-2 mb-4">
              <div className="col-md-6"><strong>Model:</strong> {detailCustomer.model ?? '-'}</div>
              <div className="col-md-6"><strong>Chassis Number:</strong> {detailCustomer.chassisNumber ?? '-'}</div>
              <div className="col-md-6"><strong>Motor Number:</strong> {detailCustomer.motorNumber ?? '-'}</div>
              <div className="col-md-6"><strong>Colour:</strong> {detailCustomer.colourOfVehicle ?? '-'}</div>
              <div className="col-md-6"><strong>Date of Purchase:</strong> {detailCustomer.dateOfPurchase ?? '-'}</div>
              <div className="col-md-6"><strong>Selling Price:</strong> {detailCustomer.sellingPrice != null ? formatCurrency(detailCustomer.sellingPrice) : '-'}</div>
              <div className="col-md-6"><strong>Registration Fee:</strong> {detailCustomer.registrationFee != null ? formatCurrency(detailCustomer.registrationFee) : '-'}</div>
              <div className="col-md-6"><strong>Advance Payment:</strong> {detailCustomer.advancePaymentAmount != null ? formatCurrency(detailCustomer.advancePaymentAmount) : '-'}</div>
              <div className="col-md-6"><strong>Advance Date:</strong> {detailCustomer.advancePaymentDate ?? '-'}</div>
              <div className="col-md-6"><strong>Balance Amount:</strong> {detailCustomer.balancePaymentAmount != null ? formatCurrency(detailCustomer.balancePaymentAmount) : '-'}</div>
              <div className="col-md-6"><strong>Balance Date:</strong> {detailCustomer.balancePaymentDate ?? '-'}</div>
              <div className="col-md-6"><strong>Payment Type:</strong> {detailCustomer.paymentType ?? '-'}</div>
              <div className="col-md-6"><strong>Date of Delivery:</strong> {detailCustomer.dateOfDeliveryToCustomer ?? '-'}</div>
              <div className="col-md-6"><strong>AIMA CARE Loyalty Card:</strong> {detailCustomer.aimaCareLoyaltyCardNo ?? '-'}</div>
            </div>
            {detailCustomer.paymentOption === 'cash' && detailCustomer.cashData && (
              <>
                <h6 className="border-bottom pb-2 mb-3">Cash - Requirement for registration</h6>
                <div className="row g-2 mb-4">
                  {(detailCustomer.cashData.copyOfNic && (isUploadPath(detailCustomer.cashData.copyOfNic) || detailCustomer.cashData.copyOfNic.startsWith('http') || detailCustomer.cashData.copyOfNic.startsWith('data:'))) ? (
                    <UploadDisplay path={detailCustomer.cashData.copyOfNic} label="Copy of NIC" />
                  ) : <div className="col-md-6"><strong>Copy of NIC:</strong> {detailCustomer.cashData.copyOfNic ?? '-'}</div>}
                  {(detailCustomer.cashData.photographOne && (isUploadPath(detailCustomer.cashData.photographOne) || detailCustomer.cashData.photographOne.startsWith('http') || detailCustomer.cashData.photographOne.startsWith('data:'))) ? (
                    <UploadDisplay path={detailCustomer.cashData.photographOne} label="Photograph 1" />
                  ) : <div className="col-md-6"><strong>Photograph 1:</strong> {detailCustomer.cashData.photographOne ?? '-'}</div>}
                  {(detailCustomer.cashData.photographTwo && (isUploadPath(detailCustomer.cashData.photographTwo) || detailCustomer.cashData.photographTwo.startsWith('http') || detailCustomer.cashData.photographTwo.startsWith('data:'))) ? (
                    <UploadDisplay path={detailCustomer.cashData.photographTwo} label="Photograph 2" />
                  ) : <div className="col-md-6"><strong>Photograph 2:</strong> {detailCustomer.cashData.photographTwo ?? '-'}</div>}
                  {(detailCustomer.cashData.paymentReceipt && (isUploadPath(detailCustomer.cashData.paymentReceipt) || detailCustomer.cashData.paymentReceipt.startsWith('http') || detailCustomer.cashData.paymentReceipt.startsWith('data:'))) ? (
                    <UploadDisplay path={detailCustomer.cashData.paymentReceipt} label="Payment Receipt" />
                  ) : <div className="col-md-6"><strong>Payment Receipt:</strong> {detailCustomer.cashData.paymentReceipt ?? '-'}</div>}
                  {(detailCustomer.cashData.mta2 && (isUploadPath(detailCustomer.cashData.mta2) || detailCustomer.cashData.mta2.startsWith('http') || detailCustomer.cashData.mta2.startsWith('data:'))) ? (
                    <UploadDisplay path={detailCustomer.cashData.mta2} label="MTA 2" />
                  ) : <div className="col-md-6"><strong>MTA 2:</strong> {detailCustomer.cashData.mta2 ?? '-'}</div>}
                  {(detailCustomer.cashData.slip && (isUploadPath(detailCustomer.cashData.slip) || detailCustomer.cashData.slip.startsWith('http') || detailCustomer.cashData.slip.startsWith('data:'))) ? (
                    <UploadDisplay path={detailCustomer.cashData.slip} label="Slip" />
                  ) : <div className="col-md-6"><strong>Slip:</strong> {detailCustomer.cashData.slip ?? '-'}</div>}
                  <div className="col-md-6"><strong>Cheque Number:</strong> {detailCustomer.cashData.chequeNumber ?? '-'}</div>
                </div>
              </>
            )}
            {detailCustomer.paymentOption === 'lease' && detailCustomer.leaseData && (
              <>
                <h6 className="border-bottom pb-2 mb-3">Lease - Requirement for registration</h6>
                <div className="row g-2 mb-4">
                  {(detailCustomer.leaseData.companyName && (isUploadPath(detailCustomer.leaseData.companyName) || detailCustomer.leaseData.companyName.startsWith('http') || detailCustomer.leaseData.companyName.startsWith('data:'))) ? (
                    <UploadDisplay path={detailCustomer.leaseData.companyName} label="Company Name" />
                  ) : <div className="col-md-6"><strong>Company Name:</strong> {detailCustomer.leaseData.companyName ?? '-'}</div>}
                  <div className="col-md-6"><strong>Purchase Order Number:</strong> {detailCustomer.leaseData.purchaseOrderNumber ?? '-'}</div>
                  {(detailCustomer.leaseData.copyOfNic && (isUploadPath(detailCustomer.leaseData.copyOfNic) || detailCustomer.leaseData.copyOfNic.startsWith('http') || detailCustomer.leaseData.copyOfNic.startsWith('data:'))) ? (
                    <UploadDisplay path={detailCustomer.leaseData.copyOfNic} label="Copy of NIC" />
                  ) : <div className="col-md-6"><strong>Copy of NIC:</strong> {detailCustomer.leaseData.copyOfNic ?? '-'}</div>}
                  {(detailCustomer.leaseData.photographOne && (isUploadPath(detailCustomer.leaseData.photographOne) || detailCustomer.leaseData.photographOne.startsWith('http') || detailCustomer.leaseData.photographOne.startsWith('data:'))) ? (
                    <UploadDisplay path={detailCustomer.leaseData.photographOne} label="Photograph 1" />
                  ) : <div className="col-md-6"><strong>Photograph 1:</strong> {detailCustomer.leaseData.photographOne ?? '-'}</div>}
                  {(detailCustomer.leaseData.photographTwo && (isUploadPath(detailCustomer.leaseData.photographTwo) || detailCustomer.leaseData.photographTwo.startsWith('http') || detailCustomer.leaseData.photographTwo.startsWith('data:'))) ? (
                    <UploadDisplay path={detailCustomer.leaseData.photographTwo} label="Photograph 2" />
                  ) : <div className="col-md-6"><strong>Photograph 2:</strong> {detailCustomer.leaseData.photographTwo ?? '-'}</div>}
                  {(detailCustomer.leaseData.paymentReceipt && (isUploadPath(detailCustomer.leaseData.paymentReceipt) || detailCustomer.leaseData.paymentReceipt.startsWith('http') || detailCustomer.leaseData.paymentReceipt.startsWith('data:'))) ? (
                    <UploadDisplay path={detailCustomer.leaseData.paymentReceipt} label="Payment Receipt" />
                  ) : <div className="col-md-6"><strong>Payment Receipt:</strong> {detailCustomer.leaseData.paymentReceipt ?? '-'}</div>}
                  {(detailCustomer.leaseData.mta2 && (isUploadPath(detailCustomer.leaseData.mta2) || detailCustomer.leaseData.mta2.startsWith('http') || detailCustomer.leaseData.mta2.startsWith('data:'))) ? (
                    <UploadDisplay path={detailCustomer.leaseData.mta2} label="MTA 2" />
                  ) : <div className="col-md-6"><strong>MTA 2:</strong> {detailCustomer.leaseData.mta2 ?? '-'}</div>}
                  {(detailCustomer.leaseData.mta3 && (isUploadPath(detailCustomer.leaseData.mta3) || detailCustomer.leaseData.mta3.startsWith('http') || detailCustomer.leaseData.mta3.startsWith('data:'))) ? (
                    <UploadDisplay path={detailCustomer.leaseData.mta3} label="MTA 3" />
                  ) : <div className="col-md-6"><strong>MTA 3:</strong> {detailCustomer.leaseData.mta3 ?? '-'}</div>}
                  <div className="col-md-6"><strong>Cheque Number:</strong> {detailCustomer.leaseData.chequeNumber ?? '-'}</div>
                </div>
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
              <select
                className="form-select"
                style={{ width: 'auto', minWidth: '160px' }}
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value as StatusFilter)}
              >
                <option value="pending">Pending</option>
                <option value="complete">Complete</option>
                <option value="return">Return</option>
              </select>
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
                        <td className="fw-medium">{customer.name ?? '-'}</td>
                        <td>{customer.contactNumber != null ? String(customer.contactNumber) : customer.whatsappNumber != null ? String(customer.whatsappNumber) : '-'}</td>
                        <td>{customer.nic ?? '-'}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button variant="ghost" size="sm" className="p-1" onClick={() => { setViewCustomer(dtoToDisplay(customer)); setEditCustomer(null); }} title="View details">
                              <Eye size={20} className="text-primary" />
                            </Button>
                            {statusFilter === 'pending' && (
                              <Button variant="ghost" size="sm" className="p-1" title="Edit" type="button" onClick={() => { setEditCustomer(dtoToDisplay(customer)); setViewCustomer(null); setActionError(''); }}>
                                <Pencil size={18} className="text-secondary" />
                              </Button>
                            )}
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
