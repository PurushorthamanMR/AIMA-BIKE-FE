import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useProducts } from '@/context/ProductContext'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/data/mockData'
import { Plus, Pencil, Trash2 } from 'lucide-react'

const CATEGORIES = ['bike', 'parts', 'service', 'accessory'] as const

export default function Stock() {
  const { products, addProduct, updateProduct, deleteProduct, addStock } = useProducts()
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState({
    name: '',
    category: 'bike' as Product['category'],
    price: 0,
    stock: 0,
    sku: '',
    description: '',
  })

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openAdd = () => {
    setEditingProduct(null)
    setForm({ name: '', category: 'bike', price: 0, stock: 0, sku: '', description: '' })
    setShowModal(true)
  }

  const openEdit = (p: Product) => {
    setEditingProduct(p)
    setForm({
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock >= 0 ? p.stock : 0,
      sku: p.sku ?? '',
      description: p.description ?? '',
    })
    setShowModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const stockVal = form.stock < 0 ? -1 : Math.max(0, form.stock)
    if (editingProduct) {
      updateProduct(editingProduct.id, { ...form, stock: stockVal })
    } else {
      addProduct({ ...form, stock: stockVal })
    }
    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this product?')) deleteProduct(id)
  }

  const handleStockAdd = (id: string) => {
    const qty = prompt('Add stock quantity:', '1')
    if (qty && parseInt(qty) > 0) addStock(id, parseInt(qty))
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Stock & Products</h2>
        <Button onClick={openAdd} style={{ backgroundColor: '#AA336A' }}>
          <Plus size={18} className="me-1" />
          Add Product
        </Button>
      </div>

      <div className="mb-3">
        <Input
          placeholder="Search by name, SKU..."
          style={{ maxWidth: '300px' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th style={{ width: '120px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td className="fw-medium">{p.name}</td>
                    <td>{p.sku ?? '-'}</td>
                    <td><span className="badge bg-secondary text-capitalize">{p.category}</span></td>
                    <td>{formatCurrency(p.price)}</td>
                    <td>
                      {p.stock < 0 ? (
                        <span className="text-muted">Unlimited</span>
                      ) : (
                        <>
                          <span className={p.stock < 5 ? 'text-danger fw-bold' : ''}>{p.stock}</span>
                          {p.stock >= 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ms-1 p-0"
                              onClick={() => handleStockAdd(p.id)}
                            >
                              + Add
                            </Button>
                          )}
                        </>
                      )}
                    </td>
                    <td>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                        <Pencil size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-danger" onClick={() => handleDelete(p.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal d-block bg-dark bg-opacity-50" style={{ zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingProduct ? 'Edit Product' : 'Add Product'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label">Name</label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="form-control"
                    />
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value as Product['category'] })}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label">SKU</label>
                      <Input
                        value={form.sku}
                        onChange={(e) => setForm({ ...form, sku: e.target.value })}
                        className="form-control"
                      />
                    </div>
                  </div>
                  <div className="row g-2 mt-1">
                    <div className="col-6">
                      <label className="form-label">Price (LKR)</label>
                      <Input
                        type="number"
                        min="0"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Stock (-1 = unlimited)</label>
                      <Input
                        type="number"
                        value={form.stock}
                        onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                        className="form-control"
                        placeholder="-1 for services"
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="form-label">Description</label>
                    <Input
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <Button type="submit" style={{ backgroundColor: '#AA336A' }}>
                    {editingProduct ? 'Update' : 'Add'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
