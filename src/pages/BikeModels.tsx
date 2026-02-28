import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getModelsPage,
  getModelsByName,
  saveModel,
  updateModel,
  updateModelStatus,
  type ModelDto,
} from '@/lib/modelApi'
import { getCategoriesPage, type CategoryDto } from '@/lib/categoryApi'
import { Plus, Bike, Search } from 'lucide-react'
import EditIcon from '@/components/icons/EditIcon'
import { FileUploadField } from '@/components/FileUploadField'
import Swal from 'sweetalert2'

const PAGE_SIZE = 10

export default function BikeModels() {
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [models, setModels] = useState<ModelDto[]>([])
  const [loading, setLoading] = useState(true)
  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [bikeCategoryId, setBikeCategoryId] = useState<number | null>(null)

  // Model form - default categoryId 1, not shown
  const [modelForm, setModelForm] = useState({ name: '', categoryId: 1, imageUrl: '' })
  const [editingModel, setEditingModel] = useState<ModelDto | null>(null)
  const [modelError, setModelError] = useState('')
  const [nameError, setNameError] = useState('')
  const [modelSuccess, setModelSuccess] = useState(false)
  const [showModelForm, setShowModelForm] = useState(false)
  const [searchName, setSearchName] = useState('')

  const loadModels = (page = pageNumber) => {
    setLoading(true)
    getModelsPage(page, PAGE_SIZE, undefined, bikeCategoryId ?? undefined, searchName.trim() || undefined)
      .then((res) => {
        setModels(res.content ?? [])
        setTotalPages(res.totalPages ?? 0)
        setTotalElements(res.totalElements ?? 0)
        setPageNumber(res.pageNumber ?? page)
        setLoading(false)
      })
      .catch(() => {
        setModels([])
        setTotalPages(0)
        setTotalElements(0)
        setLoading(false)
      })
  }

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
    loadModels(1)
  }, [bikeCategoryId])

  const runSearch = () => {
    setPageNumber(1)
    loadModels(1)
  }

  const clearSearch = () => {
    setSearchName('')
    setPageNumber(1)
    loadModels(1)
  }

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return
    setPageNumber(page)
    loadModels(page)
  }

  useEffect(() => {
    if (editingModel) {
      setModelForm({
        name: editingModel.name ?? '',
        categoryId: editingModel.categoryId ?? 1,
        imageUrl: editingModel.imageUrl ?? '',
      })
    } else {
      setModelForm({
        name: '',
        categoryId: 1,
        imageUrl: '',
      })
    }
  }, [editingModel])

  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault()
    setModelError('')
    setNameError('')
    if (!modelForm.name.trim()) {
      setNameError('Model name is required')
      return
    }
    if (/\d/.test(modelForm.name)) {
      setNameError('Number not allowed')
      return
    }
    const nameTrimmed = modelForm.name.trim()
    const nameLower = nameTrimmed.toLowerCase()
    const existing = await getModelsByName(nameTrimmed)
    const isDuplicate = existing.some(
      (m) => (m.name || '').trim().toLowerCase() === nameLower && (editingModel ? m.id !== editingModel.id : true)
    )
    if (isDuplicate) {
      setNameError('This model name already exists')
      await Swal.fire({
        icon: 'error',
        title: 'Duplicate',
        text: 'This model name already exists.',
      })
      return
    }
    const catId = modelForm.categoryId || 1
    if (editingModel) {
      const res = await updateModel({ id: editingModel.id, name: nameTrimmed, categoryId: catId, imageUrl: modelForm.imageUrl || undefined })
      if (res.success) {
        setModelSuccess(true)
        setEditingModel(null)
        setShowModelForm(false)
        loadModels()
        setTimeout(() => setModelSuccess(false), 2000)
        await Swal.fire({
          icon: 'success',
          title: 'Model Updated',
          text: 'Model has been updated successfully.',
        })
      } else {
        setModelError(res.error ?? 'Failed')
        await Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: res.error ?? 'Failed to update model.',
        })
      }
    } else {
      const res = await saveModel({ categoryId: catId, name: nameTrimmed, imageUrl: modelForm.imageUrl || undefined })
      if (res.success) {
        setModelSuccess(true)
        setModelForm({ ...modelForm, name: '', imageUrl: '' })
        setShowModelForm(false)
        loadModels()
        setTimeout(() => setModelSuccess(false), 2000)
        await Swal.fire({
          icon: 'success',
          title: 'Model Added',
          text: 'Model has been added successfully.',
        })
      } else {
        setModelError(res.error ?? 'Failed')
        await Swal.fire({
          icon: 'error',
          title: 'Save Failed',
          text: res.error ?? 'Failed to add model.',
        })
      }
    }
  }

  const openAddForm = () => {
    setEditingModel(null)
    setModelForm({ name: '', categoryId: 1, imageUrl: '' })
    setModelError('')
    setNameError('')
    setShowModelForm(true)
  }

  const openEditForm = (m: ModelDto) => {
    setEditingModel(m)
    setModelForm({
      name: m.name ?? '',
      categoryId: m.categoryId ?? 1,
      imageUrl: m.imageUrl ?? '',
    })
    setModelError('')
    setNameError('')
    setShowModelForm(true)
  }

  const closeForm = () => {
    setShowModelForm(false)
    setEditingModel(null)
    setModelError('')
    setNameError('')
  }

  const handleToggleStatus = async (m: ModelDto) => {
    const next = !(m.isActive ?? true)
    const action = next ? 'activate' : 'deactivate'
    const { isConfirmed } = await Swal.fire({
      title: 'Confirm',
      text: `Are you sure you want to ${action} "${m.name || 'this model'}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
    })
    if (!isConfirmed) return
    const res = await updateModelStatus(m.id, next)
    if (res.success) {
      loadModels()
    } else {
      await Swal.fire({ icon: 'error', title: 'Error', text: res.error ?? 'Failed to update status.' })
    }
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 p-2" style={{ background: 'rgba(170, 51, 106, 0.1)' }}>
            <Bike size={28} style={{ color: 'var(--aima-primary)' }} />
          </div>
          <h2 className="mb-0" style={{ color: 'var(--aima-secondary)' }}>Models</h2>
        </div>
        {!showModelForm && (
          <Button onClick={openAddForm} style={{ backgroundColor: 'var(--aima-primary)' }}>
            <Plus size={18} className="me-1" />
            Add Model
          </Button>
        )}
      </div>

      {showModelForm && (
        <div className="card mb-4">
          <form onSubmit={handleSaveModel}>
            <div className="card-body">
              <h5 className="card-title mb-3">{editingModel ? 'Edit Model' : 'Add Model'}</h5>
              {modelError && <div className="alert alert-danger py-2 mb-3">{modelError}</div>}
              <div className="row g-2">
                <div className="col-md-5">
                  <label className="form-label">Model Name *</label>
                  <Input
                    value={modelForm.name}
                    onChange={(e) => { setModelForm({ ...modelForm, name: e.target.value }); setNameError('') }}
                    onKeyDown={(e) => { if (/[0-9]/.test(e.key)) e.preventDefault() }}
                    placeholder="e.g. AIMA Maverick (no numbers)"
                    required
                    className="form-control"
                  />
                  {(nameError || (modelForm.name.trim() && /\d/.test(modelForm.name)) || (modelForm.name.trim() && models.some((m) => (m.name || '').trim().toLowerCase() === modelForm.name.trim().toLowerCase() && (editingModel ? m.id !== editingModel.id : true)))) && (
                    <p className="text-danger small mb-0 mt-1" role="alert">
                      {nameError || (/\d/.test(modelForm.name) ? 'Number not allowed' : 'This model name already exists')}
                    </p>
                  )}
                </div>
                <div className="col-12">
                  <FileUploadField
                    label="Image"
                    value={modelForm.imageUrl}
                    onChange={(v) => setModelForm({ ...modelForm, imageUrl: v })}
                    subfolder="bike-models"
                    fieldName="image"
                    accept="image/*"
                    className="col-12"
                  />
                </div>
              </div>
            </div>
            <div className="card-footer d-flex justify-content-end gap-2">
              <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
              <Button type="submit" style={{ backgroundColor: 'var(--aima-primary)' }}>
                {editingModel ? 'Update' : 'Add'} Model
              </Button>
            </div>
          </form>
        </div>
      )}

      {!showModelForm && (
        <div className="card">
          <div className="card-body">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
              <h6 className="mb-0 fw-semibold">Models</h6>
              <div className="d-flex align-items-center gap-2 flex-nowrap">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  style={{ width: 220, minWidth: 160 }}
                  placeholder="Search by name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), runSearch())}
                />
                <Button type="button" variant="outline" size="sm" onClick={runSearch} title="Search" className="d-inline-flex align-items-center justify-content-center">
                  <Search size={18} />
                </Button>
                {searchName.trim() && (
                  <Button type="button" variant="ghost" size="sm" onClick={clearSearch}>Clear</Button>
                )}
              </div>
            </div>
            {modelSuccess && <div className="alert alert-success py-2 mb-3">Saved successfully.</div>}
            {loading ? (
            <p className="text-muted mb-0">Loading...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((m) => (
                    <tr key={m.id}>
                      <td className="fw-medium align-middle">{m.name}</td>
                      <td className="align-middle">
                        <div className="form-check form-switch mb-0 category-status-switch">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`model-toggle-${m.id}`}
                            checked={m.isActive !== false}
                            onChange={() => handleToggleStatus(m)}
                            title={m.isActive !== false ? 'Turn off' : 'Turn on'}
                          />
                        </div>
                      </td>
                      <td className="text-end align-middle">
                        <Button variant="ghost" size="sm" className="p-1 d-inline-flex align-items-center" onClick={() => openEditForm(m)} title="Edit">
                          <EditIcon size={18} className="text-dark" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && totalPages > 0 && (
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-3 pt-2 border-top">
              <small className="text-muted">
                Page {pageNumber} of {totalPages} {totalElements > 0 && `(${totalElements} total)`}
              </small>
              <div className="d-flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(pageNumber - 1)}
                  disabled={pageNumber <= 1}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(pageNumber + 1)}
                  disabled={pageNumber >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
          {!loading && models.length === 0 && <p className="text-muted mb-0">No models. Click Add Model to create one.</p>}
          </div>
        </div>
      )}
    </div>
  )
}
