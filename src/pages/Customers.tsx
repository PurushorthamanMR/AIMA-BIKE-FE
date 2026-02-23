import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCustomersPage, type CustomerDto } from '@/lib/customerApi'
import { formatCurrency } from '@/lib/utils'
import { Eye } from 'lucide-react'
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

export default function Customers() {
  const [customers, setCustomers] = useState<CustomerDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewCustomer, setViewCustomer] = useState<ReturnType<typeof dtoToDisplay> | null>(null)

  useEffect(() => {
    let cancelled = false
    getCustomersPage(1, 500, true).then((res) => {
      if (!cancelled && res?.content) setCustomers(res.content)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
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

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Customers</h2>
      </div>
      <div className="card">
        <div className="card-body">
          <Input
            placeholder="Search by name, phone, NIC, address..."
            className="mb-3"
            style={{ maxWidth: '400px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {loading ? (
            <p className="text-muted mb-0">Loading customers...</p>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Phone Number</th>
                      <th>NIC Number</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id}>
                        <td className="fw-medium">{customer.name ?? '-'}</td>
                        <td>{customer.contactNumber != null ? String(customer.contactNumber) : customer.whatsappNumber != null ? String(customer.whatsappNumber) : '-'}</td>
                        <td>{customer.nic ?? '-'}</td>
                        <td>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1"
                            onClick={() => setViewCustomer(dtoToDisplay(customer))}
                            title="View details"
                          >
                            <Eye size={20} className="text-primary" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredCustomers.length === 0 && (
                <p className="text-muted mb-0">No customers found</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* View Customer Modal */}
      {viewCustomer && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setViewCustomer(null)}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Customer Details - {viewCustomer.name}</h5>
                <button type="button" className="btn-close" onClick={() => setViewCustomer(null)} aria-label="Close" />
              </div>
              <div className="modal-body">
                <h6 className="border-bottom pb-2 mb-3">Customer Details</h6>
                <div className="row g-2 mb-4">
                  <div className="col-md-6"><strong>Name in Full:</strong> {viewCustomer.nameInFull ?? viewCustomer.name ?? '-'}</div>
                  <div className="col-md-6"><strong>Contact Number:</strong> {viewCustomer.phone ?? '-'}</div>
                  <div className="col-md-6"><strong>Address:</strong> {viewCustomer.address ?? '-'}</div>
                  <div className="col-md-6"><strong>Province:</strong> {viewCustomer.province ?? '-'}</div>
                  <div className="col-md-6"><strong>District:</strong> {viewCustomer.district ?? '-'}</div>
                  <div className="col-md-6"><strong>Occupation:</strong> {viewCustomer.occupation ?? '-'}</div>
                  <div className="col-md-6"><strong>Date of Birth:</strong> {viewCustomer.dateOfBirth ?? '-'}</div>
                  <div className="col-md-6"><strong>Religion:</strong> {viewCustomer.religion ?? '-'}</div>
                  <div className="col-md-6"><strong>WhatsApp Number:</strong> {viewCustomer.whatsAppNumber ?? '-'}</div>
                  <div className="col-md-6"><strong>NIC/Business Reg No:</strong> {viewCustomer.nicOrBusinessRegNo ?? '-'}</div>
                </div>

                <h6 className="border-bottom pb-2 mb-3">Vehicle Purchase Details</h6>
                <div className="row g-2 mb-4">
                  <div className="col-md-6"><strong>Model:</strong> {viewCustomer.model ?? '-'}</div>
                  <div className="col-md-6"><strong>Chassis Number:</strong> {viewCustomer.chassisNumber ?? '-'}</div>
                  <div className="col-md-6"><strong>Motor Number:</strong> {viewCustomer.motorNumber ?? '-'}</div>
                  <div className="col-md-6"><strong>Colour:</strong> {viewCustomer.colourOfVehicle ?? '-'}</div>
                  <div className="col-md-6"><strong>Date of Purchase:</strong> {viewCustomer.dateOfPurchase ?? '-'}</div>
                  <div className="col-md-6"><strong>Selling Price:</strong> {viewCustomer.sellingPrice != null ? formatCurrency(viewCustomer.sellingPrice) : '-'}</div>
                  <div className="col-md-6"><strong>Registration Fee:</strong> {viewCustomer.registrationFee != null ? formatCurrency(viewCustomer.registrationFee) : '-'}</div>
                  <div className="col-md-6"><strong>Advance Payment:</strong> {viewCustomer.advancePaymentAmount != null ? formatCurrency(viewCustomer.advancePaymentAmount) : '-'}</div>
                  <div className="col-md-6"><strong>Advance Date:</strong> {viewCustomer.advancePaymentDate ?? '-'}</div>
                  <div className="col-md-6"><strong>Balance Amount:</strong> {viewCustomer.balancePaymentAmount != null ? formatCurrency(viewCustomer.balancePaymentAmount) : '-'}</div>
                  <div className="col-md-6"><strong>Balance Date:</strong> {viewCustomer.balancePaymentDate ?? '-'}</div>
                  <div className="col-md-6"><strong>Payment Type:</strong> {viewCustomer.paymentType ?? '-'}</div>
                  <div className="col-md-6"><strong>Date of Delivery:</strong> {viewCustomer.dateOfDeliveryToCustomer ?? '-'}</div>
                  <div className="col-md-6"><strong>AIMA CARE Loyalty Card:</strong> {viewCustomer.aimaCareLoyaltyCardNo ?? '-'}</div>
                </div>

                {viewCustomer.paymentOption === 'cash' && viewCustomer.cashData && (
                  <>
                    <h6 className="border-bottom pb-2 mb-3">Cash - Requirement for registration</h6>
                    <div className="row g-2 mb-4">
                      {(viewCustomer.cashData.copyOfNic && (isUploadPath(viewCustomer.cashData.copyOfNic) || viewCustomer.cashData.copyOfNic.startsWith('http') || viewCustomer.cashData.copyOfNic.startsWith('data:'))) ? (
                        <UploadDisplay path={viewCustomer.cashData.copyOfNic} label="Copy of NIC" />
                      ) : <div className="col-md-6"><strong>Copy of NIC:</strong> {viewCustomer.cashData.copyOfNic ?? '-'}</div>}
                      {(viewCustomer.cashData.photographOne && (isUploadPath(viewCustomer.cashData.photographOne) || viewCustomer.cashData.photographOne.startsWith('http') || viewCustomer.cashData.photographOne.startsWith('data:'))) ? (
                        <UploadDisplay path={viewCustomer.cashData.photographOne} label="Photograph 1" />
                      ) : <div className="col-md-6"><strong>Photograph 1:</strong> {viewCustomer.cashData.photographOne ?? '-'}</div>}
                      {(viewCustomer.cashData.photographTwo && (isUploadPath(viewCustomer.cashData.photographTwo) || viewCustomer.cashData.photographTwo.startsWith('http') || viewCustomer.cashData.photographTwo.startsWith('data:'))) ? (
                        <UploadDisplay path={viewCustomer.cashData.photographTwo} label="Photograph 2" />
                      ) : <div className="col-md-6"><strong>Photograph 2:</strong> {viewCustomer.cashData.photographTwo ?? '-'}</div>}
                      {(viewCustomer.cashData.paymentReceipt && (isUploadPath(viewCustomer.cashData.paymentReceipt) || viewCustomer.cashData.paymentReceipt.startsWith('http') || viewCustomer.cashData.paymentReceipt.startsWith('data:'))) ? (
                        <UploadDisplay path={viewCustomer.cashData.paymentReceipt} label="Payment Receipt" />
                      ) : <div className="col-md-6"><strong>Payment Receipt:</strong> {viewCustomer.cashData.paymentReceipt ?? '-'}</div>}
                      {(viewCustomer.cashData.mta2 && (isUploadPath(viewCustomer.cashData.mta2) || viewCustomer.cashData.mta2.startsWith('http') || viewCustomer.cashData.mta2.startsWith('data:'))) ? (
                        <UploadDisplay path={viewCustomer.cashData.mta2} label="MTA 2" />
                      ) : <div className="col-md-6"><strong>MTA 2:</strong> {viewCustomer.cashData.mta2 ?? '-'}</div>}
                      {(viewCustomer.cashData.slip && (isUploadPath(viewCustomer.cashData.slip) || viewCustomer.cashData.slip.startsWith('http') || viewCustomer.cashData.slip.startsWith('data:'))) ? (
                        <UploadDisplay path={viewCustomer.cashData.slip} label="Slip" />
                      ) : <div className="col-md-6"><strong>Slip:</strong> {viewCustomer.cashData.slip ?? '-'}</div>}
                      <div className="col-md-6"><strong>Cheque Number:</strong> {viewCustomer.cashData.chequeNumber ?? '-'}</div>
                    </div>
                  </>
                )}

                {viewCustomer.paymentOption === 'lease' && viewCustomer.leaseData && (
                  <>
                    <h6 className="border-bottom pb-2 mb-3">Lease - Requirement for registration</h6>
                    <div className="row g-2 mb-4">
                      {(viewCustomer.leaseData.companyName && (isUploadPath(viewCustomer.leaseData.companyName) || viewCustomer.leaseData.companyName.startsWith('http') || viewCustomer.leaseData.companyName.startsWith('data:'))) ? (
                        <UploadDisplay path={viewCustomer.leaseData.companyName} label="Company Name" />
                      ) : <div className="col-md-6"><strong>Company Name:</strong> {viewCustomer.leaseData.companyName ?? '-'}</div>}
                      <div className="col-md-6"><strong>Purchase Order Number:</strong> {viewCustomer.leaseData.purchaseOrderNumber ?? '-'}</div>
                      {(viewCustomer.leaseData.copyOfNic && (isUploadPath(viewCustomer.leaseData.copyOfNic) || viewCustomer.leaseData.copyOfNic.startsWith('http') || viewCustomer.leaseData.copyOfNic.startsWith('data:'))) ? (
                        <UploadDisplay path={viewCustomer.leaseData.copyOfNic} label="Copy of NIC" />
                      ) : <div className="col-md-6"><strong>Copy of NIC:</strong> {viewCustomer.leaseData.copyOfNic ?? '-'}</div>}
                      {(viewCustomer.leaseData.photographOne && (isUploadPath(viewCustomer.leaseData.photographOne) || viewCustomer.leaseData.photographOne.startsWith('http') || viewCustomer.leaseData.photographOne.startsWith('data:'))) ? (
                        <UploadDisplay path={viewCustomer.leaseData.photographOne} label="Photograph 1" />
                      ) : <div className="col-md-6"><strong>Photograph 1:</strong> {viewCustomer.leaseData.photographOne ?? '-'}</div>}
                      {(viewCustomer.leaseData.photographTwo && (isUploadPath(viewCustomer.leaseData.photographTwo) || viewCustomer.leaseData.photographTwo.startsWith('http') || viewCustomer.leaseData.photographTwo.startsWith('data:'))) ? (
                        <UploadDisplay path={viewCustomer.leaseData.photographTwo} label="Photograph 2" />
                      ) : <div className="col-md-6"><strong>Photograph 2:</strong> {viewCustomer.leaseData.photographTwo ?? '-'}</div>}
                      {(viewCustomer.leaseData.paymentReceipt && (isUploadPath(viewCustomer.leaseData.paymentReceipt) || viewCustomer.leaseData.paymentReceipt.startsWith('http') || viewCustomer.leaseData.paymentReceipt.startsWith('data:'))) ? (
                        <UploadDisplay path={viewCustomer.leaseData.paymentReceipt} label="Payment Receipt" />
                      ) : <div className="col-md-6"><strong>Payment Receipt:</strong> {viewCustomer.leaseData.paymentReceipt ?? '-'}</div>}
                      {(viewCustomer.leaseData.mta2 && (isUploadPath(viewCustomer.leaseData.mta2) || viewCustomer.leaseData.mta2.startsWith('http') || viewCustomer.leaseData.mta2.startsWith('data:'))) ? (
                        <UploadDisplay path={viewCustomer.leaseData.mta2} label="MTA 2" />
                      ) : <div className="col-md-6"><strong>MTA 2:</strong> {viewCustomer.leaseData.mta2 ?? '-'}</div>}
                      {(viewCustomer.leaseData.mta3 && (isUploadPath(viewCustomer.leaseData.mta3) || viewCustomer.leaseData.mta3.startsWith('http') || viewCustomer.leaseData.mta3.startsWith('data:'))) ? (
                        <UploadDisplay path={viewCustomer.leaseData.mta3} label="MTA 3" />
                      ) : <div className="col-md-6"><strong>MTA 3:</strong> {viewCustomer.leaseData.mta3 ?? '-'}</div>}
                      <div className="col-md-6"><strong>Cheque Number:</strong> {viewCustomer.leaseData.chequeNumber ?? '-'}</div>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <Button variant="outline" onClick={() => setViewCustomer(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
