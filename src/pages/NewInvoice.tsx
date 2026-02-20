import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MOCK_CUSTOMERS } from '@/data/mockData'
import { useInvoices } from '@/context/InvoiceContext'
import { useProducts } from '@/context/ProductContext'
import { formatCurrency } from '@/lib/utils'
import type { InvoiceItem, BikeImage } from '@/types'
import type { Product } from '@/data/mockData'
import { Camera, X } from 'lucide-react'
import BillPrint from '@/components/BillPrint'

const BIKE_NAMES = ['AIMA Maverick', 'AIMA Mana', 'AIMA Liberty', 'AIMA Breezy', 'AIMA Aria', 'AIMA JoyBean']

export default function NewInvoice() {
  const [customerSearch, setCustomerSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<typeof MOCK_CUSTOMERS[0] | null>(null)
  const [cart, setCart] = useState<InvoiceItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [paymentType, setPaymentType] = useState<'cash' | 'card' | 'bank' | 'credit'>('cash')
  const [paidAmount, setPaidAmount] = useState(0)
  const [dueDate, setDueDate] = useState('')
  const [bikeImages, setBikeImages] = useState<BikeImage[]>([])
  const [createdInvoice, setCreatedInvoice] = useState<import('@/types').Invoice | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addInvoice } = useInvoices()
  const { products, deductStock } = useProducts()
  const navigate = useNavigate()

  const hasBikeInCart = cart.some((c) => BIKE_NAMES.includes(c.productOrService))

  const canAddToCart = (product: Product, qty: number) => {
    if (product.stock < 0) return true
    const inCart = cart.find((c) => (c as InvoiceItem & { productId?: string }).productId === product.id)
    const cartQty = inCart?.quantity ?? 0
    return product.stock >= cartQty + qty
  }

  const addToCart = (product: Product, qty = 1) => {
    if (!canAddToCart(product, qty)) return
    const existing = cart.find((c) => (c as InvoiceItem & { productId?: string }).productId === product.id || c.productOrService === product.name)
    if (existing) {
      setCart(
        cart.map((c) =>
          (c as InvoiceItem & { productId?: string }).productId === product.id || c.productOrService === product.name
            ? { ...c, quantity: c.quantity + qty, total: (c.quantity + qty) * c.price }
            : c
        )
      )
    } else {
      setCart([
        ...cart,
        {
          id: `item-${Date.now()}`,
          productOrService: product.name,
          quantity: qty,
          price: product.price,
          total: product.price * qty,
          productId: product.id,
        } as InvoiceItem & { productId: string },
      ])
    }
  }

  const updateQty = (itemId: string, qty: number) => {
    if (qty < 1) {
      setCart(cart.filter((c) => c.id !== itemId))
      return
    }
    const cartItem = cart.find((c) => c.id === itemId) as (InvoiceItem & { productId?: string }) | undefined
    if (cartItem?.productId) {
      const product = products.find((p) => p.id === cartItem.productId)
      if (product && product.stock >= 0 && product.stock < qty) return
    }
    setCart(
      cart.map((c) =>
        c.id === itemId ? { ...c, quantity: qty, total: qty * c.price } : c
      )
    )
  }

  const removeItem = (itemId: string) => {
    setCart(cart.filter((c) => c.id !== itemId))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0)
  const tax = (subtotal - discount) * 0.1
  const grandTotal = Math.round(subtotal - discount + tax)
  const balance = paymentType === 'credit' ? Math.max(0, grandTotal - paidAmount) : 0

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        setBikeImages((prev) => [
          ...prev,
          { id: `img-${Date.now()}`, url: reader.result as string, label: file.name },
        ])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeBikeImage = (id: string) => {
    setBikeImages((prev) => prev.filter((img) => img.id !== id))
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku?.toLowerCase().includes(productSearch.toLowerCase())
  )

  const filteredCustomers = MOCK_CUSTOMERS.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch) ||
      c.bikeNumber?.toLowerCase().includes(customerSearch.toLowerCase())
  )

  const handleCreateInvoice = () => {
    if (cart.length === 0) return
    const customerId = selectedCustomer?.id ?? MOCK_CUSTOMERS[0].id
    const today = new Date().toISOString().split('T')[0]

    const invoiceItems = cart.map(({ id, productOrService, quantity, price, total }) => ({
      id, productOrService, quantity, price, total,
    }))

    const invoice = addInvoice({
      customerId,
      customer: selectedCustomer ?? MOCK_CUSTOMERS[0],
      items: invoiceItems,
      subtotal,
      discount,
      tax,
      grandTotal,
      paymentType,
      paidAmount: paymentType === 'credit' ? paidAmount : grandTotal,
      balance: paymentType === 'credit' ? balance : undefined,
      dueDate: paymentType === 'credit' ? dueDate : undefined,
      createdAt: today,
      bikeImages: hasBikeInCart && bikeImages.length > 0 ? bikeImages : undefined,
    })

    cart.forEach((item) => {
      const productId = (item as InvoiceItem & { productId?: string }).productId
      if (productId) deductStock(productId, item.quantity)
    })

    setCreatedInvoice(invoice)
    setCart([])
    setDiscount(0)
    setPaidAmount(0)
    setDueDate('')
    setBikeImages([])
  }

  return (
    <div className="pos-page">
      <div className="pos-header mb-3">
        <h2 className="mb-0 fw-bold">POS</h2>
        <small className="text-muted">Point of Sale - Bike Sales</small>
      </div>

      <div className="row g-3">
        {/* Left - Products & Cart */}
        <div className="col-lg-8">
          {/* Customer Bar */}
          <div className="card pos-card">
            <div className="card-body py-2">
              <div className="row align-items-center g-2">
                <div className="col-md-7">
                  <Input
                    placeholder="Phone / Bike No / Name..."
                    className="form-control form-control-sm"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                  {customerSearch && filteredCustomers.length > 0 && (
                    <div className="list-group list-group-flush mt-1" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                      {filteredCustomers.slice(0, 4).map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className="list-group-item list-group-item-action list-group-item-sm py-1"
                          onClick={() => {
                            setSelectedCustomer(c)
                            setCustomerSearch(c.name)
                          }}
                        >
                          {c.name} | {c.phone}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="col-md-5 text-end">
                  {selectedCustomer ? (
                    <span className="badge bg-success py-2 px-3">{selectedCustomer.name}</span>
                  ) : (
                    <Button size="sm" variant="outline">+ Add Customer</Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="card pos-card">
            <div className="card-body">
              <Input
                placeholder="Search bikes, parts..."
                className="form-control form-control-sm mb-2"
                style={{ maxWidth: '250px' }}
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
              <div className="row g-2">
                {(productSearch ? filteredProducts : products)
                  .sort((a, b) => (a.category === 'bike' ? -1 : a.category.localeCompare(b.category)))
                  .map((product) => (
                    <div key={product.id} className="col-4 col-md-3 col-lg-2">
                      <button
                        type="button"
                        className="btn btn-outline-dark w-100 py-2 pos-product-btn"
                        onClick={() => addToCart(product)}
                        disabled={product.stock >= 0 && product.stock === 0}
                        title={product.stock >= 0 && product.stock === 0 ? 'Out of stock' : product.stock >= 0 ? `Stock: ${product.stock}` : ''}
                      >
                        <div className="fw-medium small text-truncate">{product.name}</div>
                        <small className="text-success">{formatCurrency(product.price)}</small>
                        {product.stock >= 0 && (
                          <div className="small text-muted">Stock: {product.stock}</div>
                        )}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Cart */}
          {cart.length > 0 && (
            <div className="card pos-card">
              <div className="card-header bg-light py-2 d-flex justify-content-between">
                <span className="fw-semibold">Cart</span>
                <span className="badge bg-primary">{cart.length} items</span>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-sm mb-0">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th style={{ width: '70px' }}>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                        <th style={{ width: '40px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr key={item.id}>
                          <td className="fw-medium">{item.productOrService}</td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              className="form-control form-control-sm"
                              value={item.quantity}
                              onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)}
                            />
                          </td>
                          <td>{formatCurrency(item.price)}</td>
                          <td>{formatCurrency(item.total)}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger p-0"
                              style={{ width: '28px', height: '28px' }}
                              onClick={() => removeItem(item.id)}
                            >
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Bike Images - Only when bike in cart (Not printed on bill) */}
          {hasBikeInCart && (
            <div className="card pos-card border-primary">
              <div className="card-header bg-primary bg-opacity-10 py-2 d-flex justify-content-between align-items-center">
                <span className="fw-semibold">
                  <Camera size={18} className="me-1" />
                  Bike Images (Insurance Proof - Not on Bill)
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="d-none"
                  onChange={handleImageUpload}
                />
                <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  Upload
                </Button>
              </div>
              <div className="card-body py-2">
                {bikeImages.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2">
                    {bikeImages.map((img) => (
                      <div key={img.id} className="position-relative">
                        <img
                          src={img.url}
                          alt={img.label}
                          style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0"
                          style={{ width: '20px', height: '20px', fontSize: '10px' }}
                          onClick={() => removeBikeImage(img.id)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted small mb-0">Upload bike images (Front/Side/Engine) for insurance proof</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right - Bill Summary */}
        <div className="col-lg-4">
          <div className="card pos-card pos-bill-card sticky-top">
            <div className="card-header bg-dark text-white py-2">
              <h6 className="mb-0">Bill Summary</h6>
            </div>
            <div className="card-body">
              <div className="mb-2">
                <span className="text-muted">Subtotal</span>
                <span className="float-end fw-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="mb-2">
                <label className="text-muted small">Discount</label>
                <Input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
                  className="form-control form-control-sm"
                />
              </div>
              <div className="mb-2">
                <span className="text-muted">Tax (10%)</span>
                <span className="float-end fw-medium">{formatCurrency(tax)}</span>
              </div>
              <hr />
              <div className="mb-3">
                <span className="fw-bold">Grand Total</span>
                <span className="float-end fs-4 text-primary">{formatCurrency(grandTotal)}</span>
              </div>

              <div className="mb-2">
                <label className="form-label small">Payment</label>
                <select
                  className="form-select form-select-sm"
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as typeof paymentType)}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank">Bank</option>
                  <option value="credit">Credit</option>
                </select>
              </div>

              {/* Credit Bill Fields */}
              {paymentType === 'credit' && (
                <div className="credit-fields p-2 rounded bg-warning bg-opacity-10 mb-2">
                  <div className="mb-2">
                    <label className="form-label small">Paid Amount</label>
                    <Input
                      type="number"
                      min="0"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(parseInt(e.target.value) || 0)}
                      className="form-control form-control-sm"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Due Date</label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="form-control form-control-sm"
                    />
                  </div>
                  <div>
                    <span className="text-muted small">Balance</span>
                    <span className="float-end fw-bold text-danger">{formatCurrency(balance)}</span>
                  </div>
                </div>
              )}

              <Button
                className="w-100"
                style={{ backgroundColor: '#AA336A' }}
                onClick={handleCreateInvoice}
                disabled={cart.length === 0}
              >
                Create Invoice
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Print Modal */}
      {createdInvoice && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50" style={{ zIndex: 1050 }}>
          <div className="card shadow-lg" style={{ maxWidth: '400px' }}>
            <div className="card-body text-center">
              <h5 className="text-success mb-2">Invoice Created!</h5>
              <p className="mb-3">{createdInvoice.invoiceNumber}</p>
              <p className="mb-3">{formatCurrency(createdInvoice.grandTotal)}</p>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <Button
                  onClick={() => window.print()}
                  style={{ backgroundColor: '#AA336A' }}
                >
                  Print Bill
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreatedInvoice(null)
                    navigate(`/invoice/${createdInvoice.id}`)
                  }}
                >
                  View Bill
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreatedInvoice(null)
                    navigate('/pos')
                  }}
                >
                  New Sale
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bill content for printing - hidden until print */}
      {createdInvoice && <BillPrint invoice={createdInvoice} />}
    </div>
  )
}
