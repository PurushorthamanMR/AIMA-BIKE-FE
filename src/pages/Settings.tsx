import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getSettingsAllPagination,
  saveSetting,
  updateSetting,
  updateAdminStatus,
  updateManagerStatus,
  type SettingDto,
} from '@/lib/settingsApi'
import { useAuth } from '@/hooks/useAuth'
import { Plus, Settings as SettingsIcon, Search } from 'lucide-react'
import EditIcon from '@/components/icons/EditIcon'
import Swal from 'sweetalert2'

export default function Settings() {
  const { user } = useAuth()
  const isAdmin = user?.role?.toLowerCase() === 'admin'
  const showAdminColumn = isAdmin
  const showActionColumn = isAdmin

  const PAGE_SIZE = 10
  const [list, setList] = useState<SettingDto[]>([])
  const [loading, setLoading] = useState(true)
  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<SettingDto | null>(null)
  const [form, setForm] = useState({ name: '' })
  const [success, setSuccess] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [searchName, setSearchName] = useState('')

  const load = (page = pageNumber) => {
    setLoading(true)
    setLoadError('')
    getSettingsAllPagination(page, PAGE_SIZE, { name: searchName.trim() || undefined })
      .then((res) => {
        setList(res.content ?? [])
        setTotalPages(res.totalPages ?? 0)
        setTotalElements(res.totalElements ?? 0)
        setPageNumber(res.pageNumber ?? page)
        setLoading(false)
      })
      .catch(() => {
        setList([])
        setTotalPages(0)
        setTotalElements(0)
        setLoading(false)
        setLoadError('Failed to load settings. Check backend is running.')
      })
  }

  useEffect(() => {
    load(1)
  }, [])

  const handleSearch = () => {
    setPageNumber(1)
    load(1)
  }

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return
    setPageNumber(page)
    load(page)
  }

  useEffect(() => {
    if (editing) {
      setForm({ name: editing.name ?? '' })
    } else {
      setForm({ name: '' })
    }
  }, [editing])

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '' })
    setShowForm(true)
  }

  const openEdit = (s: SettingDto) => {
    setEditing(s)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
  }

  const handleToggleAdmin = async (s: SettingDto) => {
    const next = !(s.isActiveAdmin ?? true)
    const action = next ? 'enable' : 'disable'
    const { isConfirmed } = await Swal.fire({
      title: 'Confirm',
      text: `Are you sure you want to ${action} admin for "${s.name || 'this setting'}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
    })
    if (!isConfirmed) return
    const res = await updateAdminStatus(s.id, next)
    if (res.success) load()
    else await Swal.fire({ icon: 'error', title: 'Error', text: res.error })
  }

  const handleToggleManager = async (s: SettingDto) => {
    const next = !(s.isActiveManager ?? true)
    const action = next ? 'enable' : 'disable'
    const { isConfirmed } = await Swal.fire({
      title: 'Confirm',
      text: `Are you sure you want to ${action} manager for "${s.name || 'this setting'}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
    })
    if (!isConfirmed) return
    const res = await updateManagerStatus(s.id, next)
    if (res.success) load()
    else await Swal.fire({ icon: 'error', title: 'Error', text: res.error })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      await Swal.fire({ icon: 'error', title: 'Validation', text: 'Name is required.' })
      return
    }
    const nameTrimmed = form.name.trim()
    const nameLower = nameTrimmed.toLowerCase()
    const isDuplicate = list.some(
      (s) => (s.name || '').trim().toLowerCase() === nameLower && (editing ? s.id !== editing.id : true)
    )
    if (isDuplicate) {
      await Swal.fire({ icon: 'error', title: 'Duplicate', text: 'A setting with this name already exists.' })
      return
    }
    if (editing) {
      const res = await updateSetting({
        id: editing.id,
        name: nameTrimmed,
        isActiveAdmin: true,
        isActiveManager: true,
      })
      if (res.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
        closeForm()
        load()
        await Swal.fire({ icon: 'success', title: 'Saved', text: 'Setting updated successfully.' })
      } else {
        await Swal.fire({ icon: 'error', title: 'Error', text: res.error ?? 'Update failed.' })
      }
    } else {
      const res = await saveSetting({
        name: nameTrimmed,
        isActiveAdmin: true,
        isActiveManager: true,
      })
      if (res.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
        closeForm()
        load()
        await Swal.fire({ icon: 'success', title: 'Saved', text: 'Setting added successfully.' })
      } else {
        await Swal.fire({ icon: 'error', title: 'Error', text: res.error ?? 'Save failed.' })
      }
    }
  }

  // Manager and Staff see only settings where Admin has turned the feature on
  const filteredList = isAdmin ? list : list.filter((s) => s.isActiveAdmin !== false)

  return (
    <div className="container-fluid">
      <style>{`
        .settings-toggle-switch .form-check-input:checked { background-color: #198754; border-color: #198754; }
        .settings-toggle-switch .form-check-input:not(:checked) { background-color: #dc3545; border-color: #dc3545; }
      `}</style>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 p-2" style={{ background: 'rgba(170, 51, 106, 0.1)' }}>
            <SettingsIcon size={28} style={{ color: 'var(--aima-primary)' }} />
          </div>
          <h2 className="mb-0" style={{ color: 'var(--aima-secondary)' }}>Settings</h2>
        </div>
        {isAdmin && !showForm && (
          <Button onClick={openAdd} style={{ backgroundColor: 'var(--aima-primary)' }}>
            <Plus size={18} className="me-1" />
            Add Settings
          </Button>
        )}
      </div>

      {isAdmin && showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">{editing ? 'Edit Setting' : 'Add Setting'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-5">
                  <label className="form-label">Name *</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Setting name"
                    required
                    className="form-control"
                  />
                  {form.name.trim() &&
                    list.some(
                      (s) =>
                        (s.name || '').trim().toLowerCase() === form.name.trim().toLowerCase() &&
                        (editing ? s.id !== editing.id : true)
                    ) && (
                      <p className="text-danger small mb-0 mt-1" role="alert">
                        Already have this setting name
                      </p>
                    )}
                </div>
                <div className="col-12 d-flex align-items-end gap-2 pt-1">
                  <Button type="button" variant="outline" onClick={closeForm}>
                    Cancel
                  </Button>
                  <Button type="submit" style={{ backgroundColor: 'var(--aima-primary)' }}>
                    {editing ? 'Update' : 'Add'} Setting
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {!showForm && (
        <div className="card">
          <div className="card-body">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
              <h6 className="mb-0 fw-semibold">Settings</h6>
              <div className="d-flex align-items-center gap-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  style={{ maxWidth: 220 }}
                  placeholder="Search by name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                />
                <Button type="button" variant="outline" size="sm" title="Search by name" onClick={handleSearch}>
                  <Search size={18} />
                </Button>
                {searchName.trim() && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchName('')
                      setPageNumber(1)
                      setTimeout(() => load(1), 0)
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
            {loadError && <div className="alert alert-warning py-2 mb-3">{loadError}</div>}
            {success && <div className="alert alert-success py-2 mb-3">Saved successfully.</div>}
            {loading ? (
              <p className="text-muted mb-0">Loading...</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      {showAdminColumn && <th>Admin active</th>}
                      <th>Manager active</th>
                      {showActionColumn && <th className="text-end">Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map((s) => (
                      <tr key={s.id}>
                        <td className="fw-medium align-middle">{s.name}</td>
                        {showAdminColumn && (
                          <td className="align-middle">
                            <div className="form-check form-switch mb-0 settings-toggle-switch">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`setting-admin-${s.id}`}
                                checked={s.isActiveAdmin !== false}
                                onChange={() => handleToggleAdmin(s)}
                                title={s.isActiveAdmin !== false ? 'Turn off' : 'Turn on'}
                              />
                            </div>
                          </td>
                        )}
                        <td className="align-middle">
                          <div className="form-check form-switch mb-0 settings-toggle-switch">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`setting-manager-${s.id}`}
                              checked={s.isActiveManager !== false}
                              onChange={() => handleToggleManager(s)}
                              title={s.isActiveManager !== false ? 'Turn off' : 'Turn on'}
                            />
                          </div>
                        </td>
                        {showActionColumn && (
                          <td className="text-end align-middle">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 d-inline-flex align-items-center justify-content-center"
                              style={{ minHeight: 36 }}
                              onClick={() => openEdit(s)}
                              title="Edit"
                            >
                              <EditIcon size={18} className="text-dark" style={{ marginTop: 3 }} />
                            </Button>
                          </td>
                        )}
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
            {!loading && filteredList.length === 0 && (
              <p className="text-muted mb-0">
                {searchName.trim() ? 'No settings match your search.' : 'No settings. Click Add Settings to create one.'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
