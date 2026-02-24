import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MOCK_PRODUCTS } from '@/data/mockData'
import { formatCurrency } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bike, Wrench, Package, Banknote, FileText, Truck } from 'lucide-react'
import { saveCustomerWithPaymentOption } from '@/lib/customerApi'
import { getModelsPage, getModelsByCategory, type ModelDto } from '@/lib/modelApi'
import { getPaymentByName, getAllPayments, type PaymentDto } from '@/lib/paymentApi'
import { getCategoriesPage, type CategoryDto } from '@/lib/categoryApi'
import { getStocksByModel, type StockDto } from '@/lib/stockApi'
import Swal from 'sweetalert2'
import { FileUploadField } from '@/components/FileUploadField'
import { getDateOfBirthFromNIC } from '@/lib/nicUtils'
import { saveCourier } from '@/lib/courierApi'
import { getCustomersPage, type CustomerDto } from '@/lib/customerApi'

type POSStep = 'categories' | 'bike-models' | 'bike-colors' | 'customer-form' | 'payment-option' | 'parts' | 'service-courier-card' | 'service'

// Customer Data Sheet - Only fields from form image (Customer Registration + Sales Dealer Details)
interface CustomerFormData {
  nameInFull: string
  address: string
  province: string
  district: string
  occupation: string
  dateOfBirth: string
  religion: string
  contactNumber: string
  whatsAppNumber: string
  nicOrBusinessRegNo: string
  model: string
  chassisNumber: string
  motorNumber: string
  colourOfVehicle: string
  dateOfPurchase: string
  aimaCareLoyaltyCardNo: string
  dateOfDeliveryToCustomer: string
  sellingPrice: string
  registrationFee: string
  registrationFeePaymentDate: string
  advancePaymentAmount: string
  advancePaymentDate: string
  balancePaymentAmount: string
  balancePaymentDate: string
  paymentType: string
}

// Cash form - matches backend models/Cash.js: copyOfNic, photographOne, photographTwo, paymentReceipt, mta2, slip, chequeNumber
interface CashFormData {
  copyOfNic: string
  photographOne: string
  photographTwo: string
  paymentReceipt: string
  mta2: string
  slip: string
  chequeNumber: string
}

// Lease form - matches backend models/Lease.js: companyName, purchaseOrderNumber, copyOfNic, photographOne, photographTwo, paymentReceipt, mta2, mta3, chequeNumber
interface LeaseFormData {
  companyName: string
  purchaseOrderNumber: string
  copyOfNic: string
  photographOne: string
  photographTwo: string
  paymentReceipt: string
  mta2: string
  mta3: string
  chequeNumber: string
}

const emptyCashForm: CashFormData = {
  copyOfNic: '',
  photographOne: '',
  photographTwo: '',
  paymentReceipt: '',
  mta2: '',
  slip: '',
  chequeNumber: '',
}

const emptyLeaseForm: LeaseFormData = {
  companyName: '',
  purchaseOrderNumber: '',
  copyOfNic: '',
  photographOne: '',
  photographTwo: '',
  paymentReceipt: '',
  mta2: '',
  mta3: '',
  chequeNumber: '',
}

const emptyForm: CustomerFormData = {
  nameInFull: '',
  address: '',
  province: '',
  district: '',
  occupation: '',
  dateOfBirth: '',
  religion: '',
  contactNumber: '',
  whatsAppNumber: '',
  nicOrBusinessRegNo: '',
  model: '',
  chassisNumber: '',
  motorNumber: '',
  colourOfVehicle: '',
  dateOfPurchase: new Date().toISOString().split('T')[0],
  aimaCareLoyaltyCardNo: '',
  dateOfDeliveryToCustomer: '',
  sellingPrice: '',
  registrationFee: '',
  registrationFeePaymentDate: '',
  advancePaymentAmount: '',
  advancePaymentDate: '',
  balancePaymentAmount: '',
  balancePaymentDate: '',
  paymentType: '',
}

const defaultCategories: CategoryDto[] = [
  { id: 1, name: 'Bike', isActive: true },
  { id: 2, name: 'Parts', isActive: true },
  { id: 3, name: 'Service', isActive: true },
]

export default function POS() {
  const navigate = useNavigate()
  const [step, setStep] = useState<POSStep>('categories')
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [models, setModels] = useState<ModelDto[]>([])
  const [stocks, setStocks] = useState<StockDto[]>([])
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(null)
  const [selectedModel, setSelectedModel] = useState<ModelDto | null>(null)
  const [selectedStock, setSelectedStock] = useState<StockDto | null>(null)
  const [formData, setFormData] = useState<CustomerFormData>(emptyForm)
  const [cashFormData, setCashFormData] = useState<CashFormData>(emptyCashForm)
  const [leaseFormData, setLeaseFormData] = useState<LeaseFormData>(emptyLeaseForm)
  const [paymentOption, setPaymentOption] = useState<'cash' | 'lease' | null>(null)
  const [success, setSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingModels, setLoadingModels] = useState(false)
  const [loadingStocks, setLoadingStocks] = useState(false)
  const [payments, setPayments] = useState<PaymentDto[]>([])
  const [customers, setCustomers] = useState<CustomerDto[]>([])
  const [courierForm, setCourierForm] = useState({ name: '', contactNumber: '', address: '', sentDate: new Date().toISOString().split('T')[0], customerId: 0 })
  const [courierSaveSuccess, setCourierSaveSuccess] = useState(false)
  const [courierSaveError, setCourierSaveError] = useState('')

  const partsProducts = MOCK_PRODUCTS.filter((p) => p.category === 'parts' || p.category === 'accessory')

  // Fetch categories from backend
  useEffect(() => {
    let cancelled = false
    setLoadingCategories(true)
    getCategoriesPage(1, 100, true).then((list) => {
      if (!cancelled) {
        setCategories(list.length > 0 ? list : defaultCategories)
      }
      setLoadingCategories(false)
    })
    return () => { cancelled = true }
  }, [])

  // Auto-calculate Balance Payment = Selling Price - (Advance Payment + Registration Fee)
  useEffect(() => {
    if (step !== 'customer-form') return
    const selling = parseFloat(formData.sellingPrice) || 0
    const advance = parseFloat(formData.advancePaymentAmount) || 0
    const regFee = parseFloat(formData.registrationFee) || 0
    const balance = Math.max(0, selling - (advance + regFee))
    setFormData((f) => ({ ...f, balancePaymentAmount: String(balance) }))
  }, [step, formData.sellingPrice, formData.advancePaymentAmount, formData.registrationFee])

  const handleCategoryClick = async (cat: CategoryDto) => {
    const name = (cat.name || '').toLowerCase()
    if (name === 'parts') {
      setStep('parts')
      return
    }
    if (name.includes('service')) {
      setSelectedCategory(cat)
      setStep('service-courier-card')
      return
    }
    setSelectedCategory(cat)
    setLoadingModels(true)
    setModels([])
    const list = await getModelsByCategory(cat.id)
    setModels(list)
    setLoadingModels(false)
    setStep('bike-models')
  }

  const handleModelClick = (model: ModelDto) => {
    setSelectedModel(model)
    setSelectedStock(null)
    setFormData((f) => ({ ...f, model: model.name }))
    setLoadingStocks(true)
    setStocks([])
    getStocksByModel(model.id).then((list) => {
      setStocks(list)
      setLoadingStocks(false)
      setStep('bike-colors')
    })
  }

  const handleStockClick = (stock: StockDto) => {
    if ((stock.quantity ?? 0) === 0) return
    setSelectedStock(stock)
    setFormData((f) => ({
      ...f,
      colourOfVehicle: stock.color || '-',
      sellingPrice: String(stock.sellingAmount ?? 0),
      chassisNumber: stock.chassisNumber ?? f.chassisNumber ?? '',
      motorNumber: stock.motorNumber ?? f.motorNumber ?? '',
    }))
    setStep('customer-form')
  }

  // Fetch payments when customer form is shown
  useEffect(() => {
    if (step === 'customer-form' && payments.length === 0) {
      getAllPayments().then((list) => {
        setPayments(list)
        if (list.length > 0) {
          setFormData((f) => ({ ...f, paymentType: f.paymentType || list[0].name }))
        }
      })
    }
  }, [step])

  // Fetch customers when Service (courier form) is shown
  useEffect(() => {
    if (step === 'service' && customers.length === 0) {
      getCustomersPage(1, 500, true).then((res) => {
        if (res?.content) setCustomers(res.content)
      })
    }
  }, [step])

  const handleCustomerFormNext = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('payment-option')
    setPaymentOption(null)
    setCashFormData(emptyCashForm)
    setLeaseFormData(emptyLeaseForm)
  }

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError('')
    const sellingAmount = parseFloat(formData.sellingPrice) || 0
    const registrationFees = parseFloat(formData.registrationFee) || 0

    try {
      const models = await getModelsPage()
      const modelMatch = models.find((m) => m.name === formData.model || m.name?.toLowerCase().includes(formData.model.toLowerCase()))
      if (!modelMatch) {
        setSaveError(`Model "${formData.model}" not found in backend. Please add the model first.`)
        return
      }

      const payment = await getPaymentByName(formData.paymentType)
      if (!payment) {
        setSaveError(`Payment type "${formData.paymentType}" not found in backend. Please add payment types first.`)
        return
      }

      const parseNum = (s: string) => { const n = parseInt(String(s || ''), 10); return !isNaN(n) ? n : undefined }
      const contactNum = parseNum(formData.contactNumber)
      const whatsappNum = parseNum(formData.whatsAppNumber)
      const loyalityCardNo = parseNum(formData.aimaCareLoyaltyCardNo)

      const req = {
        paymentOption: (paymentOption ?? 'cash') as 'cash' | 'lease',
        name: formData.nameInFull,
        address: formData.address || '-',
        province: formData.province || '-',
        district: formData.district || '-',
        occupation: formData.occupation || '-',
        religion: formData.religion || '-',
        nic: formData.nicOrBusinessRegNo || '-',
        modelId: modelMatch.id,
        chassisNumber: formData.chassisNumber || '-',
        motorNumber: formData.motorNumber || '-',
        colorOfVehicle: formData.colourOfVehicle || '-',
        dateOfBirth: formData.dateOfBirth || undefined,
        contactNumber: contactNum ?? undefined,
        whatsappNumber: whatsappNum ?? undefined,
        dateOfPurchase: formData.dateOfPurchase || undefined,
        loyalityCardNo: loyalityCardNo ?? undefined,
        dateOfDelivery: formData.dateOfDeliveryToCustomer || undefined,
        sellingAmount: sellingAmount || undefined,
        registrationFees: registrationFees || undefined,
        advancePaymentAmount: parseFloat(formData.advancePaymentAmount) || undefined,
        advancePaymentDate: formData.advancePaymentDate || undefined,
        balancePaymentAmount: parseFloat(formData.balancePaymentAmount) || undefined,
        balancePaymentDate: formData.balancePaymentDate || undefined,
        paymentId: payment.id,
        ...(paymentOption === 'cash'
          ? {
              cashData: {
                copyOfNic: cashFormData.copyOfNic || undefined,
                photographOne: cashFormData.photographOne || undefined,
                photographTwo: cashFormData.photographTwo || undefined,
                paymentReceipt: cashFormData.paymentReceipt || undefined,
                mta2: cashFormData.mta2 || undefined,
                slip: cashFormData.slip || undefined,
                chequeNumber: parseNum(cashFormData.chequeNumber),
              },
            }
          : {
              leaseData: {
                companyName: leaseFormData.companyName || undefined,
                purchaseOrderNumber: parseNum(leaseFormData.purchaseOrderNumber),
                copyOfNic: leaseFormData.copyOfNic || undefined,
                photographOne: leaseFormData.photographOne || undefined,
                photographTwo: leaseFormData.photographTwo || undefined,
                paymentReceipt: leaseFormData.paymentReceipt || undefined,
                mta2: leaseFormData.mta2 || undefined,
                mta3: leaseFormData.mta3 || undefined,
                chequeNumber: parseNum(leaseFormData.chequeNumber),
              },
            }),
      }

      const result = await saveCustomerWithPaymentOption(req)
      if (result.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Successfully Saved',
          text: 'Customer saved to Customers page successfully.',
        })
        setSuccess(false)
        setStep('categories')
        setSelectedCategory(null)
        setSelectedModel(null)
        setSelectedStock(null)
        setFormData(emptyForm)
        setCashFormData(emptyCashForm)
        setLeaseFormData(emptyLeaseForm)
        setPaymentOption(null)
        setSuccess(false)
      } else {
        setSaveError(result.error || 'Failed to save customer')
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save customer')
    }
  }

  const handleBackToCategories = () => {
    setStep('categories')
    setSelectedCategory(null)
    setCourierForm({ name: '', contactNumber: '', address: '', sentDate: new Date().toISOString().split('T')[0], customerId: 0 })
    setCourierSaveSuccess(false)
    setCourierSaveError('')
  }

  const handleBackFromCourierForm = () => {
    setStep('service-courier-card')
    setCourierSaveError('')
  }

  const handleSaveCourier = async (e: React.FormEvent) => {
    e.preventDefault()
    setCourierSaveError('')
    const cat = categories.find((c) => (c.name || '').toLowerCase().includes('service')) || selectedCategory
    if (!cat) {
      setCourierSaveError('Service category not found.')
      return
    }
    if (!courierForm.customerId) {
      setCourierSaveError('Please select a customer.')
      return
    }
    if (!courierForm.name?.trim()) {
      setCourierSaveError('Name is required.')
      return
    }
    if (!courierForm.address?.trim()) {
      setCourierSaveError('Address is required.')
      return
    }
    const parseNum = (s: string) => { const n = parseInt(String(s || ''), 10); return !isNaN(n) ? n : undefined }
    const result = await saveCourier({
      categoryId: cat.id,
      customerId: courierForm.customerId,
      name: courierForm.name.trim(),
      contactNumber: parseNum(courierForm.contactNumber),
      address: courierForm.address.trim(),
      sentDate: courierForm.sentDate || undefined,
    })
    if (result.success) {
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Courier saved successfully.',
      })
      setCourierSaveSuccess(true)
      setCourierForm({ name: '', contactNumber: '', address: '', sentDate: new Date().toISOString().split('T')[0], customerId: 0 })
      setTimeout(() => setCourierSaveSuccess(false), 3000)
    } else {
      setCourierSaveError(result.error || 'Failed to save courier')
    }
  }

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">Customer Data Sheet</h2>

      {/* Step 1: Categories from backend */}
      {step === 'categories' && (
        <div className="row g-4">
          {loadingCategories ? (
            <p className="text-muted">Loading categories...</p>
          ) : (
            categories.map((cat) => {
              const name = (cat.name || '').toLowerCase()
              const icon = name === 'parts' ? <Package size={64} className="mb-3 text-success" /> : name.includes('service') ? <Wrench size={64} className="mb-3 text-warning" /> : <Bike size={64} className="mb-3 text-primary" />
              const desc = name === 'parts' ? 'Spare Parts & Accessories' : name.includes('service') ? 'Repairs & Maintenance' : 'AIMA Electric Scooters'
              return (
                <div key={cat.id} className="col-md-4">
                  <div className="card pos-category-card h-100 cursor-pointer" onClick={() => handleCategoryClick(cat)}>
                    <div className="card-body text-center py-5">
                      {icon}
                      <h4>{cat.name}</h4>
                      <p className="text-muted mb-0">{desc}</p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Step 2a: Models from backend */}
      {step === 'bike-models' && (
        <div className="d-flex flex-column" style={{ minHeight: 'calc(100vh - 180px)' }}>
          <h4 className="mb-3">Select Model</h4>
          {loadingModels ? (
            <p className="text-muted">Loading models...</p>
          ) : models.length === 0 ? (
            <p className="text-muted">No models found. Add models in backend for this category.</p>
          ) : (
            <div className="row g-3">
              {models.map((model) => (
                <div key={model.id} className="col-sm-6 col-md-4">
                  <div
                    className="card pos-model-card h-100 cursor-pointer mx-auto border shadow-sm"
                    onClick={() => handleModelClick(model)}
                    style={{ maxWidth: '240px', transition: 'transform 0.2s, box-shadow 0.2s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(0,0,0,0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = ''
                      e.currentTarget.style.boxShadow = ''
                    }}
                  >
                    <div style={{ height: '140px', overflow: 'hidden', backgroundColor: '#f0f0f0' }}>
                      {model.imageUrl ? (
                        <img src={model.imageUrl} alt={model.name} className="card-img-top w-100 h-100" style={{ objectFit: 'cover' }} />
                      ) : (
                        <div className="d-flex align-items-center justify-content-center h-100">
                          <Bike size={48} className="text-muted" />
                        </div>
                      )}
                    </div>
                    <div className="card-body py-2 px-2 text-center">
                      <h6 className="mb-0 small fw-semibold">{model.name}</h6>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="d-flex justify-content-end mt-3 pt-2">
            <Button variant="outline" onClick={() => { setStep('categories'); setSelectedCategory(null) }}>
              <ArrowLeft size={18} className="me-1" />
              Back
            </Button>
          </div>
        </div>
      )}

      {/* Step 2b: Colors (Stocks) from backend */}
      {step === 'bike-colors' && selectedModel && (
        <>
          <h4 className="mb-2">{selectedModel.name} - Select Color</h4>
          {loadingStocks ? (
            <p className="text-muted">Loading...</p>
          ) : stocks.length === 0 ? (
            <p className="text-muted">No stock/colors found. Add stock in backend for this model.</p>
          ) : (
            <div className="row g-3">
              {stocks.map((stock) => {
                const qty = stock.quantity ?? 0
                const colorName = stock.color || stock.name || '-'
                const colorHex = colorName.toLowerCase().includes('black') ? '#333' : colorName.toLowerCase().includes('red') ? '#c00' : colorName.toLowerCase().includes('blue') ? '#06c' : colorName.toLowerCase().includes('white') ? '#eee' : '#999'
                return (
                  <div key={stock.id} className="col-md-3 col-lg-2">
                    <div
                      className={`card pos-color-card cursor-pointer ${qty === 0 ? 'opacity-50' : ''}`}
                      onClick={() => handleStockClick(stock)}
                      style={{ borderColor: selectedStock?.id === stock.id ? '#AA336A' : undefined, borderWidth: selectedStock?.id === stock.id ? 3 : 1 }}
                    >
                      <div className="card-body text-center py-3">
                        <div className="rounded-circle mx-auto mb-2" style={{ width: 40, height: 40, backgroundColor: colorHex }} />
                        <h6 className="mb-0">{colorName}</h6>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <div className="d-flex justify-content-end mt-4">
            <Button variant="outline" onClick={() => { setStep('bike-models'); setStocks([]) }}>
              <ArrowLeft size={18} className="me-1" />
              Back
            </Button>
          </div>
        </>
      )}

      {/* Step 3: Customer Data Sheet */}
      {step === 'customer-form' && (
        <>
          {success ? (
            <div className="alert alert-success text-center py-5">
              <h4>Customer Saved!</h4>
              <p className="mb-0">Customer saved to Customers page successfully.</p>
            </div>
          ) : (
            <div className="card">
              <form onSubmit={handleCustomerFormNext}>
                <div className="card-body">
                  <h6 className="border-bottom pb-2 mb-3">I. Customer Registration Details</h6>
                  <div className="row g-2">
                    <div className="col-md-6"><label className="form-label">Name in Full</label><Input value={formData.nameInFull} onChange={(e) => setFormData({ ...formData, nameInFull: e.target.value })} required className="form-control" /></div>
                    <div className="col-md-6"><label className="form-label">Address</label><Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="form-control" /></div>
                    <div className="col-md-4"><label className="form-label">Province</label><Input value={formData.province} onChange={(e) => setFormData({ ...formData, province: e.target.value })} className="form-control" /></div>
                    <div className="col-md-4"><label className="form-label">District</label><Input value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} className="form-control" /></div>
                    <div className="col-md-4"><label className="form-label">Occupation</label><Input value={formData.occupation} onChange={(e) => setFormData({ ...formData, occupation: e.target.value })} className="form-control" /></div>
                    <div className="col-md-4"><label className="form-label">Religion</label><Input value={formData.religion} onChange={(e) => setFormData({ ...formData, religion: e.target.value })} className="form-control" /></div>
                    <div className="col-md-4"><label className="form-label">Contact Number</label><Input value={formData.contactNumber} onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })} required className="form-control" /></div>
                    <div className="col-md-4"><label className="form-label">WhatsApp Number</label><Input value={formData.whatsAppNumber} onChange={(e) => setFormData({ ...formData, whatsAppNumber: e.target.value })} className="form-control" /></div>
                    <div className="col-md-6"><label className="form-label">NIC/Business Registration Number</label><Input value={formData.nicOrBusinessRegNo} onChange={(e) => { const v = e.target.value; const dob = getDateOfBirthFromNIC(v); setFormData({ ...formData, nicOrBusinessRegNo: v, dateOfBirth: dob ?? formData.dateOfBirth }); }} className="form-control" /></div>
                    <div className="col-md-6"><label className="form-label">Date of Birth (DD/MM/YYYY)</label><Input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className="form-control" /></div>
                  </div>

                  <p className="text-muted small mb-3 mt-4">The following details should be filled in by the sales dealer</p>
                  <h6 className="border-bottom pb-2 mb-3">II. Sales Dealer Details</h6>
                  <div className="row g-2">
                    <div className="col-md-4"><label className="form-label">Model</label><Input value={formData.model} readOnly className="form-control bg-light" /></div>
                    <div className="col-md-4"><label className="form-label">Chassis Number</label><Input value={formData.chassisNumber} onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value })} className="form-control" /></div>
                    <div className="col-md-4"><label className="form-label">Motor Number</label><Input value={formData.motorNumber} onChange={(e) => setFormData({ ...formData, motorNumber: e.target.value })} className="form-control" /></div>
                    <div className="col-md-4"><label className="form-label">Colour of Vehicle</label><Input value={formData.colourOfVehicle} readOnly className="form-control bg-light" /></div>
                    <div className="col-md-4"><label className="form-label">Date of Purchase</label><Input type="date" value={formData.dateOfPurchase} onChange={(e) => setFormData({ ...formData, dateOfPurchase: e.target.value })} className="form-control" /></div>
                    <div className="col-md-4"><label className="form-label">AIMA CARE Loyalty Card No</label><Input value={formData.aimaCareLoyaltyCardNo} onChange={(e) => setFormData({ ...formData, aimaCareLoyaltyCardNo: e.target.value })} className="form-control" /></div>
                    <div className="col-md-4"><label className="form-label">Date of Delivery to Customer</label><Input type="date" value={formData.dateOfDeliveryToCustomer} onChange={(e) => setFormData({ ...formData, dateOfDeliveryToCustomer: e.target.value })} className="form-control" /></div>
                    <div className="col-md-4"><label className="form-label">Selling Price</label><Input type="number" value={formData.sellingPrice} onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })} required className="form-control" /></div>
                    <div className="col-md-4"><label className="form-label">Registration Fee</label><Input type="number" value={formData.registrationFee} onChange={(e) => setFormData({ ...formData, registrationFee: e.target.value })} className="form-control" /></div>
                    <div className="col-md-4"><label className="form-label">Advance Payment Amount</label><Input type="number" value={formData.advancePaymentAmount} onChange={(e) => setFormData({ ...formData, advancePaymentAmount: e.target.value })} className="form-control" /></div>
                    <div className="col-md-4"><label className="form-label">Advance Payment Date</label><Input type="date" value={formData.advancePaymentDate} onChange={(e) => setFormData({ ...formData, advancePaymentDate: e.target.value })} className="form-control" /></div>
                    <div className="col-md-4"><label className="form-label">Amount of Balance Payment</label><Input type="number" value={formData.balancePaymentAmount} readOnly className="form-control bg-light" /></div>
                    <div className="col-md-4"><label className="form-label">Balance Payment Date</label><Input type="date" value={formData.balancePaymentDate} onChange={(e) => setFormData({ ...formData, balancePaymentDate: e.target.value })} className="form-control" /></div>
                    <div className="col-md-4"><label className="form-label">Type of Payment (Customer)</label><select className="form-select" value={formData.paymentType} onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}>{payments.length === 0 ? <option value="">Loading...</option> : payments.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
                  </div>
                </div>
                <div className="card-footer d-flex justify-content-between align-items-center">
                  <Button variant="outline" type="button" onClick={() => setStep('bike-colors')}>
                    <ArrowLeft size={18} className="me-1" />
                    Back
                  </Button>
                  <Button type="submit" style={{ backgroundColor: '#AA336A' }}>
                    Next
                  </Button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* Step 4: Payment Option - Cash or Lease */}
      {step === 'payment-option' && (
        <div className="card">
          <div className="card-body">
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <div
                  className={`card cursor-pointer h-100 border-2 ${paymentOption === 'cash' ? 'border-primary' : ''}`}
                  onClick={() => setPaymentOption('cash')}
                  style={{ borderWidth: paymentOption === 'cash' ? 3 : 1 }}
                >
                  <div className="card-body text-center py-5">
                    <Banknote size={64} className="mb-3 text-success" />
                    <h5>Cash</h5>
                    <p className="text-muted small mb-0">Copy of NIC, Photographs, Payment Receipt, MTA 2, Slip, Cheque No</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div
                  className={`card cursor-pointer h-100 border-2 ${paymentOption === 'lease' ? 'border-primary' : ''}`}
                  onClick={() => setPaymentOption('lease')}
                  style={{ borderWidth: paymentOption === 'lease' ? 3 : 1 }}
                >
                  <div className="card-body text-center py-5">
                    <FileText size={64} className="mb-3 text-info" />
                    <h5>Lease</h5>
                    <p className="text-muted small mb-0">Company Name, PO Number, NIC, Photographs, MTA 2, MTA 3, Cheque No</p>
                  </div>
                </div>
              </div>
            </div>

            {saveError && (
              <div className="alert alert-danger py-2 mb-3">{saveError}</div>
            )}
            {paymentOption === 'cash' && (
              <form onSubmit={handleSaveCustomer}>
                <h6 className="border-bottom pb-2 mb-3">IF Cash - Requirement for registration</h6>
                <p className="text-muted small mb-3">Upload images/PDF for documents. Only Cheque Number is typed.</p>
                <div className="row g-2">
                  <FileUploadField label="Copy of NIC/Driving License/Valid Passport" value={cashFormData.copyOfNic} onChange={(v) => setCashFormData({ ...cashFormData, copyOfNic: v })} subfolder="cash" fieldName="copyOfNic" />
                  <FileUploadField label="Two Photographs - Photo 1" value={cashFormData.photographOne} onChange={(v) => setCashFormData({ ...cashFormData, photographOne: v })} subfolder="cash" fieldName="photographOne" />
                  <FileUploadField label="Photograph 2" value={cashFormData.photographTwo} onChange={(v) => setCashFormData({ ...cashFormData, photographTwo: v })} subfolder="cash" fieldName="photographTwo" />
                  <FileUploadField label="Copy of Payment Receipt" value={cashFormData.paymentReceipt} onChange={(v) => setCashFormData({ ...cashFormData, paymentReceipt: v })} subfolder="cash" fieldName="paymentReceipt" />
                  <FileUploadField label="Duty filled MTA 2 Form" value={cashFormData.mta2} onChange={(v) => setCashFormData({ ...cashFormData, mta2: v })} subfolder="cash" fieldName="mta2" />
                  <FileUploadField label="Cheque / Cash Deposit Slip" value={cashFormData.slip} onChange={(v) => setCashFormData({ ...cashFormData, slip: v })} subfolder="cash" fieldName="slip" />
                  <div className="col-md-6"><label className="form-label">Cheque Number (if Cheque)</label><Input type="number" value={cashFormData.chequeNumber} onChange={(e) => setCashFormData({ ...cashFormData, chequeNumber: e.target.value })} className="form-control" placeholder="Type cheque number" /></div>
                </div>
                <div className="d-flex justify-content-between mt-4 pt-3">
                  <Button variant="outline" type="button" onClick={() => setStep('customer-form')}>
                    <ArrowLeft size={18} className="me-1" />
                    Back
                  </Button>
                  <Button type="submit" style={{ backgroundColor: '#AA336A' }}>
                    Save
                  </Button>
                </div>
              </form>
            )}

            {paymentOption === 'lease' && (
              <form onSubmit={handleSaveCustomer}>
                <h6 className="border-bottom pb-2 mb-3">IF Lease - Requirement for registration</h6>
                <p className="text-muted small mb-3">Upload images/PDF for documents. Only Purchase Order Number and Cheque No are typed.</p>
                <div className="row g-2">
                  <FileUploadField label="Leasing Company Name (document)" value={leaseFormData.companyName} onChange={(v) => setLeaseFormData({ ...leaseFormData, companyName: v })} subfolder="lease" fieldName="companyName" />
                  <div className="col-md-6"><label className="form-label">Purchase Order Number</label><Input type="number" value={leaseFormData.purchaseOrderNumber} onChange={(e) => setLeaseFormData({ ...leaseFormData, purchaseOrderNumber: e.target.value })} className="form-control" placeholder="Type PO number" /></div>
                  <FileUploadField label="Copy of NIC/Driving License/Valid Passport" value={leaseFormData.copyOfNic} onChange={(v) => setLeaseFormData({ ...leaseFormData, copyOfNic: v })} subfolder="lease" fieldName="copyOfNic" />
                  <FileUploadField label="Two Photographs - Photo 1" value={leaseFormData.photographOne} onChange={(v) => setLeaseFormData({ ...leaseFormData, photographOne: v })} subfolder="lease" fieldName="photographOne" />
                  <FileUploadField label="Photograph 2" value={leaseFormData.photographTwo} onChange={(v) => setLeaseFormData({ ...leaseFormData, photographTwo: v })} subfolder="lease" fieldName="photographTwo" />
                  <FileUploadField label="Copy of Payment Receipt" value={leaseFormData.paymentReceipt} onChange={(v) => setLeaseFormData({ ...leaseFormData, paymentReceipt: v })} subfolder="lease" fieldName="paymentReceipt" />
                  <FileUploadField label="Duty filled MTA 2 Form" value={leaseFormData.mta2} onChange={(v) => setLeaseFormData({ ...leaseFormData, mta2: v })} subfolder="lease" fieldName="mta2" />
                  <FileUploadField label="MTA 3 / Mortgage Bond" value={leaseFormData.mta3} onChange={(v) => setLeaseFormData({ ...leaseFormData, mta3: v })} subfolder="lease" fieldName="mta3" />
                  <div className="col-md-6"><label className="form-label">Cheque No / Cash Deposit</label><Input type="number" value={leaseFormData.chequeNumber} onChange={(e) => setLeaseFormData({ ...leaseFormData, chequeNumber: e.target.value })} className="form-control" placeholder="Type cheque number" /></div>
                </div>
                <div className="d-flex justify-content-between mt-4 pt-3">
                  <Button variant="outline" type="button" onClick={() => setStep('customer-form')}>
                    <ArrowLeft size={18} className="me-1" />
                    Back
                  </Button>
                  <Button type="submit" style={{ backgroundColor: '#AA336A' }}>
                    Save
                  </Button>
                </div>
              </form>
            )}

            {!paymentOption && (
              <div className="d-flex justify-content-end">
                <Button variant="outline" onClick={() => setStep('customer-form')}>
                  <ArrowLeft size={18} className="me-1" />
                  Back
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Parts - Product grid */}
      {step === 'parts' && (
        <>
          <h4 className="mb-4">Parts & Accessories</h4>
          <p className="text-muted mb-3">Select items - Use Bike section for bike sales</p>
          <div className="row g-3">
            {partsProducts.map((p) => (
              <div key={p.id} className="col-md-3 col-lg-2">
                <div className="card h-100">
                  <div className="card-body text-center py-3">
                    <h6 className="mb-1">{p.name}</h6>
                    <small className="text-success">{formatCurrency(p.price)}</small>
                    <div className="mt-2">
                      <small className="text-muted">Use Bike section for sales</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="d-flex justify-content-end mt-4">
            <Button variant="outline" onClick={handleBackToCategories}>
              <ArrowLeft size={18} className="me-1" />
              Back
            </Button>
          </div>
        </>
      )}

      {/* Service - Courier card (click to open courier form) */}
      {step === 'service-courier-card' && (
        <div className="d-flex flex-column" style={{ minHeight: '400px' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">Service</h4>
            <Button variant="outline" onClick={handleBackToCategories}>
              <ArrowLeft size={18} className="me-1" />
              Back
            </Button>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div
                className="card pos-category-card h-100 cursor-pointer"
                onClick={() => setStep('service')}
                style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = ''
                  e.currentTarget.style.boxShadow = ''
                }}
              >
                <div className="card-body text-center py-5">
                  <Truck size={64} className="mb-3 text-info" />
                  <h4>Courier</h4>
                  <p className="text-muted mb-0">Add courier details for service items</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service - Courier form */}
      {step === 'service' && (
        <div className="d-flex flex-column" style={{ minHeight: '400px' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="mb-1">Service - Courier Form</h4>
              <p className="text-muted mb-0 small">Add courier details for service items. Saved couriers appear in the Courier page.</p>
            </div>
            <Button variant="outline" onClick={handleBackFromCourierForm}>
              <ArrowLeft size={18} className="me-1" />
              Back
            </Button>
          </div>
          {courierSaveSuccess ? (
            <div className="card">
              <div className="card-body text-center py-5">
                <h5 className="text-success">Courier Saved!</h5>
                <p className="text-muted mb-3">Courier saved successfully. Table la Courier page la show aagum.</p>
                <div className="d-flex gap-2 justify-content-center flex-wrap">
                  <Button variant="outline" onClick={handleBackToCategories}>
                    <ArrowLeft size={18} className="me-1" />
                    Back
                  </Button>
                  <Button style={{ backgroundColor: '#AA336A' }} onClick={() => navigate('/courier')}>
                    <Truck size={18} className="me-1" />
                    View Courier Page
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <form onSubmit={handleSaveCourier}>
                <div className="card-body">
                  {courierSaveError && <div className="alert alert-danger py-2 mb-3">{courierSaveError}</div>}
                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label">Customer <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={courierForm.customerId}
                        onChange={(e) => setCourierForm({ ...courierForm, customerId: parseInt(e.target.value, 10) || 0 })}
                        required
                      >
                        <option value={0}>Select customer</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>{c.name} {c.contactNumber ? `- ${c.contactNumber}` : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Name <span className="text-danger">*</span></label>
                      <Input value={courierForm.name} onChange={(e) => setCourierForm({ ...courierForm, name: e.target.value })} placeholder="Courier/item name" required className="form-control" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Contact Number</label>
                      <Input type="tel" value={courierForm.contactNumber} onChange={(e) => setCourierForm({ ...courierForm, contactNumber: e.target.value })} placeholder="Contact number" className="form-control" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Sent Date</label>
                      <Input type="date" value={courierForm.sentDate} onChange={(e) => setCourierForm({ ...courierForm, sentDate: e.target.value })} className="form-control" />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Address <span className="text-danger">*</span></label>
                      <Input value={courierForm.address} onChange={(e) => setCourierForm({ ...courierForm, address: e.target.value })} placeholder="Delivery address" required className="form-control" />
                    </div>
                  </div>
                </div>
                <div className="card-footer d-flex justify-content-between align-items-center">
                  <Button variant="outline" type="button" onClick={handleBackFromCourierForm}>
                    <ArrowLeft size={18} className="me-1" />
                    Back
                  </Button>
                  <Button type="submit" style={{ backgroundColor: '#AA336A' }}>
                    Save Courier
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
