import { useState, useEffect, useMemo } from 'react'
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
import { ModelImage } from '@/components/ModelImage'
import { getDateOfBirthFromNIC } from '@/lib/nicUtils'
import { saveCourier } from '@/lib/courierApi'
import { getCustomersByStatus, type CustomerDto } from '@/lib/customerApi'
import { SearchableSelect } from '@/components/SearchableSelect'

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
  advancePaymentDate: new Date().toISOString().split('T')[0],
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
  const [hoveredColorKey, setHoveredColorKey] = useState<string | null>(null)

  // Customer Data Sheet validation: Contact & WhatsApp 10 digits only
  const customerFormErrors = useMemo(() => {
    const contact = formData.contactNumber.trim()
    const whatsapp = formData.whatsAppNumber.trim()
    const err: { contactNumber?: string; whatsAppNumber?: string } = {}
    if (contact && !/^\d{10}$/.test(contact)) err.contactNumber = 'Contact number must be exactly 10 digits.'
    if (whatsapp && !/^\d{10}$/.test(whatsapp)) err.whatsAppNumber = 'WhatsApp number must be exactly 10 digits.'
    return err
  }, [formData.contactNumber, formData.whatsAppNumber])
  const hasCustomerFormErrors = Object.keys(customerFormErrors).length > 0

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
      await Swal.fire({ title: 'Coming soon', text: 'Parts & Accessories will be available soon.', icon: 'info' })
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
    const withStock = await Promise.all(
      list.map(async (m) => ({ model: m, stocks: await getStocksByModel(m.id) }))
    )
    const modelsWithStock = withStock
      .filter((x) => x.stocks.some((s) => (s.quantity ?? 0) > 0))
      .map((x) => x.model)
    setModels(modelsWithStock)
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

  // Fetch customers when Service (courier form) is shown - only pending (not received/complete) so dropdown doesn't show received customers
  useEffect(() => {
    if (step === 'service') {
      getCustomersByStatus('pending', 1, 500, true).then((res) => {
        if (res?.content) setCustomers(res.content)
      })
    }
  }, [step])

  const handleCustomerFormNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (hasCustomerFormErrors) {
      const msg = customerFormErrors.contactNumber || customerFormErrors.whatsAppNumber || 'Please fix the errors below.'
      Swal.fire({ icon: 'warning', title: 'Validation', text: msg })
      return
    }
    const contact = formData.contactNumber.trim()
    if (!contact || !/^\d{10}$/.test(contact)) {
      Swal.fire({ icon: 'warning', title: 'Contact required', text: 'Contact number must be exactly 10 digits.' })
      return
    }
    setStep('payment-option')
    setPaymentOption(null)
    setCashFormData(emptyCashForm)
    setLeaseFormData(emptyLeaseForm)
  }

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError('')
    if (hasCustomerFormErrors) {
      setSaveError(customerFormErrors.contactNumber || customerFormErrors.whatsAppNumber || 'Fix validation errors in Customer Data.')
      return
    }
    const contact = formData.contactNumber.trim()
    if (!contact || !/^\d{10}$/.test(contact)) {
      setSaveError('Contact number must be exactly 10 digits.')
      return
    }
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
              const icon = name === 'parts' ? <Package size={64} className="mb-3" style={{ color: 'var(--aima-success)' }} /> : name.includes('service') ? <Wrench size={64} className="mb-3" style={{ color: 'var(--aima-accent)' }} /> : <Bike size={64} className="mb-3" style={{ color: 'var(--aima-info)' }} />
              const desc = name === 'parts' ? 'Spare Parts & Accessories' : name.includes('service') ? 'Repairs & Maintenance' : 'AIMA Electric Scooters'
              const cardClass = name === 'parts' ? 'pos-category-card-parts' : name.includes('service') ? 'pos-category-card-service' : 'pos-category-card-bike'
              return (
                <div key={cat.id} className="col-md-4">
                  <div className={`card pos-category-card ${cardClass} h-100 cursor-pointer`} onClick={() => handleCategoryClick(cat)}>
                    <div className="card-body text-center py-5">
                      {icon}
                      <h4 className="fw-bold" style={{ color: 'var(--aima-secondary)' }}>{cat.name}</h4>
                      <p className="mb-0" style={{ color: 'var(--aima-muted)' }}>{desc}</p>
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
                      <ModelImage
                        imageUrl={model.imageUrl}
                        alt={model.name}
                        className="card-img-top w-100 h-100"
                        style={{ objectFit: 'cover' }}
                      />
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

      {/* Step 2b: Colors (Stocks) from backend - grouped by color, hover shows individual stocks */}
      {step === 'bike-colors' && selectedModel && (
        <>
          <h4 className="mb-2">{selectedModel.name} - Select Color</h4>
          {loadingStocks ? (
            <p className="text-muted">Loading...</p>
          ) : stocks.length === 0 ? (
            <p className="text-muted">No stock/colors found. Add stock in backend for this model.</p>
          ) : (() => {
            const withQty = stocks.filter((s) => (s.quantity ?? 0) > 0)
            if (withQty.length === 0) {
              return <p className="text-muted">No stock available. All items have quantity 0.</p>
            }
            const colorKey = (s: StockDto) => (s.color || '-').trim().toLowerCase()
            const grouped = withQty.reduce<Record<string, StockDto[]>>((acc, s) => {
              const key = colorKey(s)
              if (!acc[key]) acc[key] = []
              acc[key].push(s)
              return acc
            }, {})
            const getColorHex = (name: string): string => {
              const n = (name || '').toLowerCase().trim()
              if (n.includes('black')) return '#333333'
              if (n.includes('red')) return '#c00'
              if (n.includes('green')) return '#22a722'
              if (n.includes('blue') || n.includes('seablue') || n.includes('sea blue')) return '#0d6efd'
              if (n.includes('white')) return '#f0f0f0'
              if (n.includes('grey') || n.includes('gray')) return '#6c757d'
              if (n.includes('yellow')) return '#ffc107'
              if (n.includes('orange')) return '#fd7e14'
              if (n.includes('gold')) return '#d4a853'
              if (n.includes('silver')) return '#c0c0c0'
              if (n.includes('brown')) return '#8b4513'
              if (n.includes('pink')) return '#e83e8c'
              return '#999'
            }
            const hoveredStocks = hoveredColorKey ? (grouped[hoveredColorKey] ?? []).filter((s) => (s.quantity ?? 0) > 0) : []
            return (
              <div onMouseLeave={() => setHoveredColorKey(null)}>
                <div className="row g-3">
                  {Object.entries(grouped).map(([key, colorStocks]) => {
                    const totalQty = colorStocks.reduce((sum, s) => sum + (s.quantity ?? 0), 0)
                    const colorName = colorStocks[0]?.color || '-'
                    const colorHex = getColorHex(colorName)
                    const lightHexes = ['#f0f0f0', '#eee', '#fff', '#ffc107', '#c0c0c0', '#d4a853']
                    const isLightBg = lightHexes.includes(colorHex.toLowerCase())
                    const hasSingle = colorStocks.length === 1 && totalQty > 0
                    const availableStocks = colorStocks.filter((s) => (s.quantity ?? 0) > 0)
                    return (
                      <div
                        key={key}
                        className="col-md-3 col-lg-2"
                        onMouseEnter={() => availableStocks.length > 0 && setHoveredColorKey(key)}
                      >
                        <div
                          className={`card pos-color-card cursor-pointer ${totalQty === 0 ? 'opacity-50' : ''}`}
                          onClick={() => hasSingle && availableStocks[0] && handleStockClick(availableStocks[0])}
                          style={{ borderColor: selectedStock && colorStocks.some((s) => s.id === selectedStock.id) ? 'var(--aima-primary)' : undefined, borderWidth: selectedStock && colorStocks.some((s) => s.id === selectedStock.id) ? 3 : 1 }}
                        >
                          <div className="card-body text-center py-3">
                            <div
                              className="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center fw-bold small"
                              style={{ width: 40, height: 40, backgroundColor: colorHex, color: isLightBg ? '#333' : '#fff' }}
                            >
                              {totalQty}
                            </div>
                            <h6 className="mb-0">{colorName}</h6>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {hoveredColorKey && hoveredStocks.length > 0 && (
                  <div className="w-100 mt-3 p-3 rounded border bg-white shadow-sm" style={{ width: '100%' }}>
                    <div
                      className="d-grid gap-3"
                      style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
                    >
                      {hoveredStocks.map((stock) => (
                        <div
                          key={stock.id}
                          className="card cursor-pointer border"
                          onClick={() => handleStockClick(stock)}
                        >
                          <div className="card-body p-2 text-center">
                            <div className="mb-2 rounded overflow-hidden bg-light d-flex align-items-center justify-content-center" style={{ height: 140 }}>
                              <ModelImage
                                imageUrl={stock.modelDto?.imageUrl}
                                alt={stock.modelDto?.name ?? ''}
                                className="w-100 h-100 object-fit-cover"
                                style={{ objectFit: 'cover' }}
                              />
                            </div>
                            <div className="small text-start">
                              <div className="d-flex justify-content-between gap-1"><span className="text-muted">ItemCode</span><span className="text-truncate" title={stock.itemCode ?? ''}>{stock.itemCode || '-'}</span></div>
                              <div className="d-flex justify-content-between gap-1"><span className="text-muted">ChassisNo</span><span className="text-truncate" title={stock.chassisNumber ?? ''}>{stock.chassisNumber || '-'}</span></div>
                              <div className="d-flex justify-content-between gap-1"><span className="text-muted">MotorNo</span><span className="text-truncate" title={stock.motorNumber ?? ''}>{stock.motorNumber || '-'}</span></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })()}
          <div className="d-flex justify-content-end mt-4">
            <Button variant="outline" onClick={() => { setStep('bike-models'); setStocks([]); setHoveredColorKey(null) }}>
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
                    <div className="col-md-4">
                      <label className="form-label">Contact Number</label>
                      <Input
                        type="tel"
                        inputMode="numeric"
                        value={formData.contactNumber}
                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        placeholder="10 digits only"
                        required
                        className="form-control"
                        maxLength={10}
                      />
                      {customerFormErrors.contactNumber && <p className="text-danger small mb-0 mt-1">{customerFormErrors.contactNumber}</p>}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">WhatsApp Number</label>
                      <Input
                        type="tel"
                        inputMode="numeric"
                        value={formData.whatsAppNumber}
                        onChange={(e) => setFormData({ ...formData, whatsAppNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        placeholder="10 digits only"
                        className="form-control"
                        maxLength={10}
                      />
                      {customerFormErrors.whatsAppNumber && <p className="text-danger small mb-0 mt-1">{customerFormErrors.whatsAppNumber}</p>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">NIC/Business Registration Number</label>
                      <Input
                        value={formData.nicOrBusinessRegNo}
                        onChange={(e) => {
                          const v = e.target.value
                          const dob = getDateOfBirthFromNIC(v)
                          setFormData({ ...formData, nicOrBusinessRegNo: v, dateOfBirth: dob ?? formData.dateOfBirth })
                        }}
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-6"><label className="form-label">Date of Birth (DD/MM/YYYY)</label><Input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className="form-control" /></div>
                  </div>

                  <p className="text-muted small mb-3 mt-4">The following details should be filled in by the sales dealer</p>
                  <h6 className="border-bottom pb-2 mb-3">II. Sales Dealer Details</h6>
                  <div className="row g-2">
                    <div className="col-md-4"><label className="form-label">Model</label><Input value={formData.model} readOnly className="form-control bg-light" /></div>
                    <div className="col-md-4"><label className="form-label">Chassis Number</label><Input value={formData.chassisNumber} readOnly className="form-control bg-light" /></div>
                    <div className="col-md-4"><label className="form-label">Motor Number</label><Input value={formData.motorNumber} readOnly className="form-control bg-light" /></div>
                    <div className="col-md-4"><label className="form-label">Colour of Vehicle</label><Input value={formData.colourOfVehicle} readOnly className="form-control bg-light" /></div>
                    <div className="col-md-4"><label className="form-label">Date of Purchase</label><Input type="date" value={formData.dateOfPurchase} onChange={(e) => setFormData({ ...formData, dateOfPurchase: e.target.value })} className="form-control" /></div>
                    <div className="col-md-4"><label className="form-label">AIMA CARE Loyalty Card No</label><Input value={formData.aimaCareLoyaltyCardNo} onChange={(e) => setFormData({ ...formData, aimaCareLoyaltyCardNo: e.target.value })} className="form-control" /></div>
                    <div className="col-md-4"><label className="form-label">Selling Price</label><Input type="number" value={formData.sellingPrice} onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })} required className="form-control" /></div>
                    <div className="col-md-4"><label className="form-label">Registration Fee</label><Input type="number" value={formData.registrationFee} onChange={(e) => setFormData({ ...formData, registrationFee: e.target.value })} className="form-control" /></div>
                    <div className="col-md-4"><label className="form-label">Advance Payment Amount</label><Input type="number" value={formData.advancePaymentAmount} onChange={(e) => setFormData({ ...formData, advancePaymentAmount: e.target.value })} className="form-control" /></div>
                    <div className="col-md-4"><label className="form-label">Advance Payment Date</label><Input type="date" value={formData.advancePaymentDate} onChange={(e) => setFormData({ ...formData, advancePaymentDate: e.target.value })} className="form-control" /></div>
                    <div className="col-md-4"><label className="form-label">Amount of Balance Payment</label><Input type="number" value={formData.balancePaymentAmount} readOnly className="form-control bg-light" /></div>
                    <div className="col-md-4"><label className="form-label">Type of Payment (Customer)</label><select className="form-select" value={formData.paymentType} onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}>{payments.length === 0 ? <option value="">Loading...</option> : payments.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
                  </div>
                </div>
                <div className="card-footer d-flex justify-content-between align-items-center">
                  <Button variant="outline" type="button" onClick={() => setStep('bike-colors')}>
                    <ArrowLeft size={18} className="me-1" />
                    Back
                  </Button>
                  <Button type="submit" style={{ backgroundColor: 'var(--aima-primary)' }} disabled={hasCustomerFormErrors}>
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
                  <Button type="submit" style={{ backgroundColor: 'var(--aima-primary)' }}>
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
                  <Button type="submit" style={{ backgroundColor: 'var(--aima-primary)' }}>
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
              <div className="card pos-category-card pos-category-card-courier h-100 cursor-pointer" onClick={() => setStep('service')}>
                <div className="card-body text-center py-5">
                  <Truck size={64} className="mb-3" style={{ color: 'var(--aima-primary)' }} />
                  <h4 className="fw-bold" style={{ color: 'var(--aima-secondary)' }}>Courier</h4>
                  <p className="mb-0" style={{ color: 'var(--aima-muted)' }}>Add courier details for service items</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service - Courier form */}
      {step === 'service' && (
        <div className="d-flex flex-column" style={{ minHeight: '400px' }}>
          <div className="mb-4">
            <h4 className="mb-1">Service - Courier Form</h4>
            <p className="text-muted mb-0 small">Add courier details for service items. Saved couriers appear in the Courier page.</p>
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
                  <Button style={{ backgroundColor: 'var(--aima-primary)' }} onClick={() => navigate('/courier')}>
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
                      <SearchableSelect
                        options={customers.map((c) => ({
                          value: c.id,
                          label: [c.name, c.contactNumber ? String(c.contactNumber) : '', c.chassisNumber ?? ''].filter(Boolean).join(' - '),
                        }))}
                        value={courierForm.customerId}
                        onChange={(v) => setCourierForm({ ...courierForm, customerId: v })}
                        placeholder="Select customer"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Name <span className="text-danger">*</span></label>
                      <Input value={courierForm.name} onChange={(e) => setCourierForm({ ...courierForm, name: e.target.value })} placeholder="Courier/item name" required className="form-control" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Contact Number</label>
                      <Input
                        type="tel"
                        className="form-control"
                        value={courierForm.contactNumber}
                        onChange={(e) => setCourierForm({ ...courierForm, contactNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        onKeyDown={(e) => { if (!/^\d$/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) e.preventDefault() }}
                        placeholder="10 numbers only"
                        maxLength={10}
                      />
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
                  <Button type="submit" style={{ backgroundColor: 'var(--aima-primary)' }}>
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
