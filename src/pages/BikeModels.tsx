import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getModelsPage,
  saveModel,
  updateModel,
  type ModelDto,
} from '@/lib/modelApi'
import { getCategoriesPage, type CategoryDto } from '@/lib/categoryApi'
import { Pencil, Plus } from 'lucide-react'

export default function BikeModels() {
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [models, setModels] = useState<ModelDto[]>([])
  const [loading, setLoading] = useState(true)
  const [bikeCategoryId, setBikeCategoryId] = useState<number | null>(null)

  // Model form
  const [modelForm, setModelForm] = useState({ name: '', categoryId: 0, imageUrl: '' })
  const [editingModel, setEditingModel] = useState<ModelDto | null>(null)
  const [modelError, setModelError] = useState('')
  const [modelSuccess, setModelSuccess] = useState(false)
  const [showModelModal, setShowModelModal] = useState(false)

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
        setShowModelModal(false)
        getModelsPage(1, 200, true, bikeCategoryId ?? undefined).then(setModels)
        setTimeout(() => setModelSuccess(false), 2000)
      } else setModelError(res.error ?? 'Failed')
    } else {
      const res = await saveModel({ categoryId: catId, name: modelForm.name.trim(), imageUrl: modelForm.imageUrl || undefined })
      if (res.success) {
        setModelSuccess(true)
        setModelForm({ ...modelForm, name: '', imageUrl: '' })
        setShowModelModal(false)
        getModelsPage(1, 200, true, bikeCategoryId ?? undefined).then(setModels)
        setTimeout(() => setModelSuccess(false), 2000)
      } else setModelError(res.error ?? 'Failed')
    }
  }

  const openAddModal = () => {
    setEditingModel(null)
    setModelForm({ name: '', categoryId: bikeCategoryId ?? 0, imageUrl: '' })
    setModelError('')
    setShowModelModal(true)
  }

  const openEditModal = (m: ModelDto) => {
    setEditingModel(m)
    setModelForm({
      name: m.name ?? '',
      categoryId: m.categoryId ?? bikeCategoryId ?? 0,
      imageUrl: m.imageUrl ?? '',
    })
    setModelError('')
    setShowModelModal(true)
  }

  const closeModal = () => {
    setShowModelModal(false)
    setEditingModel(null)
    setModelError('')
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Bike Models</h2>
        <Button onClick={openAddModal} style={{ backgroundColor: '#AA336A' }}>
          <Plus size={18} className="me-1" />
          Add Model
        </Button>
      </div>

      <div className="card">
        <div className="card-body">
          {modelSuccess && <div className="alert alert-success py-2 mb-3">Saved successfully.</div>}
          {loading ? (
            <p className="text-muted mb-0">Loading...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Model Name</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((m) => (
                    <tr key={m.id}>
                      <td className="fw-medium">{m.name}</td>
                      <td className="text-end">
                        <Button variant="ghost" size="sm" className="p-1" onClick={() => openEditModal(m)} title="Edit">
                          <Pencil size={18} className="text-primary" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && models.length === 0 && <p className="text-muted mb-0">No models. Click Add Model to create one.</p>}
        </div>
      </div>

      {/* Add / Edit Model Modal - with direct heading like Customers page */}
      {showModelModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeModal}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h2 className="modal-title mb-0">{editingModel ? 'Edit Model' : 'Add Model'}</h2>
                <button type="button" className="btn-close" onClick={closeModal} aria-label="Close" />
              </div>
              <div className="modal-body pt-2">
                <form onSubmit={handleSaveModel}>
                  {modelError && <div className="alert alert-danger py-2">{modelError}</div>}
                  <div className="row g-2 mb-3">
                    <div className="col-12">
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
                    <div className="col-12">
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
                  <div className="d-flex gap-2 justify-content-end">
                    <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                    <Button type="submit" style={{ backgroundColor: '#AA336A' }}>
                      {editingModel ? 'Update' : 'Add'} Model
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
