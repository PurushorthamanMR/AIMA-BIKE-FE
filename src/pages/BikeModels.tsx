import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getModelsPage,
  saveModel,
  updateModel,
  type ModelDto,
} from '@/lib/modelApi'
import {
  getStocksByModel,
  saveStock,
  updateStock,
  type StockDto,
} from '@/lib/stockApi'
import { getCategoriesPage, type CategoryDto } from '@/lib/categoryApi'
import { formatCurrency } from '@/lib/utils'
import { Pencil } from 'lucide-react'

export default function BikeModels() {
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [models, setModels] = useState<ModelDto[]>([])
  const [stocks, setStocks] = useState<StockDto[]>([])
  const [selectedModel, setSelectedModel] = useState<ModelDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [bikeCategoryId, setBikeCategoryId] = useState<number | null>(null)

  // Model form
  const [modelForm, setModelForm] = useState({ name: '', categoryId: 0, imageUrl: '' })
  const [editingModel, setEditingModel] = useState<ModelDto | null>(null)
  const [modelError, setModelError] = useState('')
  const [modelSuccess, setModelSuccess] = useState(false)

  // Stock (Color) form
  const [stockForm, setStockForm] = useState({ name: '', color: '', sellingAmount: '', quantity: '0', modelId: 0 })
  const [editingStock, setEditingStock] = useState<StockDto | null>(null)
  const [stockError, setStockError] = useState('')
  const [stockSuccess, setStockSuccess] = useState(false)

  useEffect(() => {
    let cancelled = false
    getCategoriesPage(1, 100, true).then((list) => {
      if (!cancelled) {
        setCategories(list ?? [])
        const bike = (list ?? []).find((c) => (c.name ?? '').toLowerCase() === 'bike')
        if (bike) setBikeCategoryId(bike.id)
      }
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const catId = bikeCategoryId ?? undefined
    getModelsPage(1, 200, true, catId).then((list) => {
      if (!cancelled) {
        setModels(list ?? [])
        if (catId && list?.length) setModelForm((f) => ({ ...f, categoryId: catId }))
      }
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [bikeCategoryId])

  useEffect(() => {
    if (!selectedModel) {
      setStocks([])
      return
    }
    let cancelled = false
    getStocksByModel(selectedModel.id).then((list) => {
      if (!cancelled) setStocks(list ?? [])
    })
    return () => { cancelled = true }
  }, [selectedModel])

  useEffect(() => {
    if (editingModel) {
      setModelForm({
        name: editingModel.name,
        categoryId: editingModel.categoryId,
        imageUrl: editingModel.imageUrl ?? '',
      })
    } else {
      setModelForm({
        name: '',
        categoryId: bikeCategoryId ?? 0,
        imageUrl: '',
      })
    }
  }, [editingModel, bikeCategoryId])

  useEffect(() => {
    if (editingStock) {
      setStockForm({
        name: editingStock.name,
        color: editingStock.color,
        sellingAmount: String(editingStock.sellingAmount ?? ''),
        quantity: String(editingStock.quantity ?? 0),
        modelId: editingStock.modelId,
      })
    } else {
      setStockForm({
        name: selectedModel ? `${selectedModel.name} - ` : '',
        color: '',
        sellingAmount: '',
        quantity: '0',
        modelId: selectedModel?.id ?? 0,
      })
    }
  }, [editingStock, selectedModel])

  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault()
    setModelError('')
    if (!modelForm.name.trim()) {
      setModelError('Model name required')
      return
    }
    const catId = modelForm.categoryId || bikeCategoryId
    if (!catId) {
      setModelError('Select category')
      return
    }
    if (editingModel) {
      const res = await updateModel({ id: editingModel.id, name: modelForm.name.trim(), categoryId: catId, imageUrl: modelForm.imageUrl || undefined })
      if (res.success) {
        setModelSuccess(true)
        setEditingModel(null)
        getModelsPage(1, 200, true, bikeCategoryId ?? undefined).then(setModels)
        setTimeout(() => setModelSuccess(false), 2000)
      } else setModelError(res.error ?? 'Failed')
    } else {
      const res = await saveModel({ categoryId: catId, name: modelForm.name.trim(), imageUrl: modelForm.imageUrl || undefined })
      if (res.success) {
        setModelSuccess(true)
        setModelForm({ ...modelForm, name: '', imageUrl: '' })
        getModelsPage(1, 200, true, bikeCategoryId ?? undefined).then(setModels)
        setTimeout(() => setModelSuccess(false), 2000)
      } else setModelError(res.error ?? 'Failed')
    }
  }

  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault()
    setStockError('')
    const modelId = stockForm.modelId || selectedModel?.id
    if (!modelId) {
      setStockError('Select a model first')
      return
    }
    if (!stockForm.color.trim()) {
      setStockError('Color required')
      return
    }
    const name = stockForm.name.trim() || `${selectedModel?.name ?? 'Stock'} - ${stockForm.color}`
    const sellingAmount = parseFloat(stockForm.sellingAmount) || undefined
    const quantity = parseInt(stockForm.quantity, 10) || 0
    if (editingStock) {
      const res = await updateStock({
        id: editingStock.id,
        name,
        color: stockForm.color.trim(),
        sellingAmount,
        quantity,
      })
      if (res.success) {
        setStockSuccess(true)
        setEditingStock(null)
        if (selectedModel) getStocksByModel(selectedModel.id).then(setStocks)
        setTimeout(() => setStockSuccess(false), 2000)
      } else setStockError(res.error ?? 'Failed')
    } else {
      const res = await saveStock({
        modelId,
        name,
        color: stockForm.color.trim(),
        sellingAmount,
        quantity,
      })
      if (res.success) {
        setStockSuccess(true)
        setStockForm({ ...stockForm, color: '', sellingAmount: '', quantity: '0' })
        if (selectedModel) getStocksByModel(selectedModel.id).then(setStocks)
        setTimeout(() => setStockSuccess(false), 2000)
      } else setStockError(res.error ?? 'Failed')
    }
  }

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Bike Models & Colors</h2>

      <div className="row">
        {/* Models Section */}
        <div className="col-lg-6">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Models</h5>
              <small>Add / Edit bike models</small>
            </div>
            <div className="card-body">
              <form onSubmit={handleSaveModel}>
                {modelError && <div className="alert alert-danger py-2">{modelError}</div>}
                {modelSuccess && <div className="alert alert-success py-2">Saved successfully.</div>}
                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={(modelForm.categoryId || bikeCategoryId) ?? ''}
                      onChange={(e) => setModelForm({ ...modelForm, categoryId: parseInt(e.target.value, 10) || 0 })}
                    >
                      <option value="">Select</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Model Name *</label>
                    <Input
                      value={modelForm.name}
                      onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                      placeholder="e.g. AIMA Maverick"
                      required
                      className="form-control"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Image URL</label>
                    <Input
                      value={modelForm.imageUrl}
                      onChange={(e) => setModelForm({ ...modelForm, imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Button type="submit" style={{ backgroundColor: '#AA336A' }}>
                    {editingModel ? 'Update' : 'Add'} Model
                  </Button>
                  {editingModel && (
                    <Button type="button" variant="outline" onClick={() => setEditingModel(null)}>Cancel</Button>
                  )}
                </div>
              </form>
            </div>
            <div className="card-body border-top pt-3">
              <h6 className="mb-2">Models List</h6>
              {loading ? (
                <p className="text-muted small">Loading...</p>
              ) : (
                <div className="list-group list-group-flush">
                  {models.map((m) => (
                    <div
                      key={m.id}
                      className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${selectedModel?.id === m.id ? 'active' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedModel(m)}
                    >
                      <span>{m.name}</span>
                      <div className="d-flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="p-1" onClick={() => setEditingModel(m)} title="Edit">
                          <Pencil size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {models.length === 0 && <p className="text-muted small mb-0">No models. Add a model above.</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colors (Stock) Section */}
        <div className="col-lg-6">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-info text-dark">
              <h5 className="mb-0">Colors (Stock)</h5>
              <small>{selectedModel ? `Add / Edit colors for ${selectedModel.name}` : 'Select a model first'}</small>
            </div>
            <div className="card-body">
              <form onSubmit={handleSaveStock}>
                {stockError && <div className="alert alert-danger py-2">{stockError}</div>}
                {stockSuccess && <div className="alert alert-success py-2">Saved successfully.</div>}
                <div className="row g-2 mb-3">
                  <div className="col-12">
                    <label className="form-label">Model</label>
                    <select
                      className="form-select"
                      value={selectedModel?.id ?? ''}
                      onChange={(e) => {
                        const id = parseInt(e.target.value, 10)
                        setSelectedModel(models.find((m) => m.id === id) ?? null)
                      }}
                    >
                      <option value="">Select model</option>
                      {models.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Color *</label>
                    <Input
                      value={stockForm.color}
                      onChange={(e) => setStockForm({ ...stockForm, color: e.target.value })}
                      placeholder="e.g. Black, Red"
                      required
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Selling Amount</label>
                    <Input
                      type="number"
                      value={stockForm.sellingAmount}
                      onChange={(e) => setStockForm({ ...stockForm, sellingAmount: e.target.value })}
                      placeholder="Price"
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Quantity</label>
                    <Input
                      type="number"
                      min={0}
                      value={stockForm.quantity}
                      onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Button type="submit" style={{ backgroundColor: '#AA336A' }} disabled={!selectedModel}>
                    {editingStock ? 'Update' : 'Add'} Color
                  </Button>
                  {editingStock && (
                    <Button type="button" variant="outline" onClick={() => setEditingStock(null)}>Cancel</Button>
                  )}
                </div>
              </form>
            </div>
            <div className="card-body border-top pt-3">
              <h6 className="mb-2">Colors for {selectedModel?.name ?? 'Model'}</h6>
              {!selectedModel ? (
                <p className="text-muted small">Select a model to see colors</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>Color</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {stocks.map((s) => (
                        <tr key={s.id}>
                          <td>{s.color}</td>
                          <td>{s.sellingAmount != null ? formatCurrency(s.sellingAmount) : '-'}</td>
                          <td>{s.quantity ?? 0}</td>
                          <td>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1"
                              onClick={() => setEditingStock(s)}
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {stocks.length === 0 && <p className="text-muted small mb-0">No colors. Add above.</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
