import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getStockById, updateStock, type StockDto } from '@/lib/stockApi'
import { getModelsPage, type ModelDto } from '@/lib/modelApi'
import { ArrowLeft } from 'lucide-react'
import Swal from 'sweetalert2'

export default function StockDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [stock, setStock] = useState<StockDto | null>(null)
  const [models, setModels] = useState<ModelDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    modelId: 0,
    itemCode: '',
    chassisNumber: '',
    motorNumber: '',
    color: '',
  })

  useEffect(() => {
    const stockId = id ? parseInt(id, 10) : NaN
    if (isNaN(stockId)) {
      setError('Invalid ID')
      setLoading(false)
      return
    }
    let cancelled = false
    getStockById(stockId).then((data) => {
      if (!cancelled) {
        setStock(data ?? null)
        if (data) {
          setForm({
            modelId: data.modelId ?? 0,
            itemCode: data.itemCode ?? '',
            chassisNumber: data.chassisNumber ?? '',
            motorNumber: data.motorNumber ?? '',
            color: data.color ?? '',
          })
        } else setError('Stock not found')
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    getModelsPage(1, 200, true).then((list) => setModels(list ?? []))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stock) return
    setError('')
    if (form.modelId <= 0) {
      setError('Select model')
      return
    }
    const res = await updateStock({
      id: stock.id,
      modelId: form.modelId,
      itemCode: form.itemCode.trim() || undefined,
      chassisNumber: form.chassisNumber.trim() || undefined,
      motorNumber: form.motorNumber.trim() || undefined,
      color: form.color.trim() || undefined,
    })
    if (res.success) {
      setStock({ ...stock, ...form })
      await Swal.fire({
        icon: 'success',
        title: 'Updated',
        text: 'Stock updated successfully.',
      })
    } else {
      setError(res.error ?? 'Update failed')
    }
  }

  if (loading) {
    return (
      <div className="container-fluid">
        <p className="text-muted">Loading...</p>
      </div>
    )
  }

  if (error || !stock) {
    return (
      <div className="container-fluid">
        <div className="alert alert-warning">{error || 'Not found'}</div>
        <Button variant="outline" onClick={() => navigate('/stock')}>
          <ArrowLeft size={18} className="me-1" />
          Back to Stock
        </Button>
      </div>
    )
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Edit Stock - {stock.modelDto?.name ?? stock.id}</h2>
        <Button variant="outline" onClick={() => navigate('/stock')}>
          <ArrowLeft size={18} className="me-1" />
          Back
        </Button>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Model <span className="text-danger">*</span></label>
                <select
                  className="form-select"
                  value={form.modelId}
                  onChange={(e) => setForm({ ...form, modelId: parseInt(e.target.value, 10) || 0 })}
                  required
                >
                  <option value={0}>Select model</option>
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Item Code</label>
                <Input value={form.itemCode} onChange={(e) => setForm({ ...form, itemCode: e.target.value })} className="form-control" placeholder="Item code" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Chassis Number</label>
                <Input value={form.chassisNumber} onChange={(e) => setForm({ ...form, chassisNumber: e.target.value })} className="form-control" placeholder="Chassis" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Motor Number</label>
                <Input value={form.motorNumber} onChange={(e) => setForm({ ...form, motorNumber: e.target.value })} className="form-control" placeholder="Motor" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Color</label>
                <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="form-control" placeholder="Color" />
              </div>
            </div>
            <div className="mt-4">
              <Button type="submit" style={{ backgroundColor: '#AA336A' }}>Update</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
