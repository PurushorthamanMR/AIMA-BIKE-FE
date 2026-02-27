import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getAllShopDetails,
  saveShopDetail,
  updateShopDetail,
  type ShopDetailDto,
} from '@/lib/shopDetailsApi'
import { Store, Plus, Pencil, MapPin, Phone } from 'lucide-react'
import EditIcon from '@/components/icons/EditIcon'
import { useResolvedLogoUrl } from '@/hooks/useResolvedLogoUrl'
import { FileUploadField } from '@/components/FileUploadField'
import Swal from 'sweetalert2'
import { useShopDetail } from '@/context/ShopDetailContext'

const cardStyle = {
  borderRadius: 16,
  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  border: '1px solid rgba(0,0,0,0.06)',
  background: '#fff',
} as const

function ShopDetailProfileView({ shop, onEdit }: { shop: ShopDetailDto; onEdit: () => void }) {
  const [logoError, setLogoError] = useState(false)
  const resolvedLogo = useResolvedLogoUrl(shop.logo)
  const logoUrl = resolvedLogo || '/images_logos/logo.jpg'
  const rows = [
    { label: 'Name', value: shop.name },
    { label: 'Address', value: shop.address, icon: MapPin },
    { label: 'Phone', value: shop.phoneNumber, icon: Phone },
  ]
  return (
    <>
      <div className="mb-4 overflow-hidden" style={cardStyle}>
        <div className="p-4 p-md-5">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-4">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                style={{
                  width: 72,
                  height: 72,
                  background: 'linear-gradient(135deg, rgba(170, 51, 106, 0.12) 0%, rgba(170, 51, 106, 0.06) 100%)',
                  border: '2px solid rgba(170, 51, 106, 0.2)',
                }}
              >
                {logoError ? (
                  <Store size={36} style={{ color: 'var(--aima-primary)' }} />
                ) : (
                  <img src={logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={() => setLogoError(true)} />
                )}
              </div>
              <div>
                <h4 className="mb-1 fw-bold" style={{ color: 'var(--aima-secondary)', letterSpacing: '-0.02em' }}>
                  {shop.name || 'Shop'}
                </h4>
                <p className="mb-0 text-muted small">{shop.address || 'No address'}</p>
              </div>
            </div>
            <Button
              onClick={onEdit}
              style={{ backgroundColor: 'var(--aima-primary)', borderRadius: 12, padding: '0.5rem 1.25rem', fontWeight: 600 }}
            >
              <Pencil size={18} className="me-1" />
              Edit
            </Button>
          </div>
        </div>
      </div>
      <div className="mb-4 overflow-hidden" style={cardStyle}>
        <div className="p-4 p-md-5">
          <h5 className="mb-4 fw-semibold" style={{ color: 'var(--aima-secondary)', fontSize: '1.1rem', letterSpacing: '-0.01em' }}>
            Shop details
          </h5>
          <div className="row g-0">
            {rows.map(({ label, value, icon: Icon }, i) => (
              <div
                key={label}
                className="d-flex align-items-center py-3 px-0"
                style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}
              >
                <span className="text-muted small text-uppercase fw-medium me-3 d-flex align-items-center gap-1" style={{ minWidth: 100, letterSpacing: '0.04em' }}>
                  {Icon && <Icon size={14} />}
                  {label}
                </span>
                <span className="fw-medium text-body">{value ?? '–'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default function ShopDetails() {
  const { refreshShopDetail } = useShopDetail()
  const [list, setList] = useState<ShopDetailDto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ShopDetailDto | null>(null)
  const [form, setForm] = useState({
    name: '',
    logo: '',
    address: '',
    phoneNumber: '',
    isActive: true,
  })
  const [loadError, setLoadError] = useState('')

  const load = () => {
    setLoading(true)
    setLoadError('')
    getAllShopDetails()
      .then((data) => {
        setList(data ?? [])
        setLoading(false)
      })
      .catch(() => {
        setList([])
        setLoading(false)
        setLoadError('Failed to load shop details.')
      })
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name ?? '',
        logo: editing.logo ?? '',
        address: editing.address ?? '',
        phoneNumber: editing.phoneNumber ?? '',
        isActive: editing.isActive ?? true,
      })
    } else {
      setForm({ name: '', logo: '', address: '', phoneNumber: '', isActive: true })
    }
  }, [editing])

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', logo: '', address: '', phoneNumber: '', isActive: true })
    setShowForm(true)
  }

  const openEdit = (s: ShopDetailDto) => {
    setEditing(s)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      await Swal.fire({ icon: 'error', title: 'Validation', text: 'Name is required.' })
      return
    }
    const phone = form.phoneNumber.trim()
    if (phone && !/^\d{10}$/.test(phone)) {
      await Swal.fire({ icon: 'error', title: 'Validation', text: 'Phone number must be exactly 10 digits.' })
      return
    }
    if (editing) {
      const res = await updateShopDetail({
        id: editing.id,
        name: form.name.trim(),
        logo: form.logo.trim() || undefined,
        address: form.address.trim() || undefined,
        phoneNumber: form.phoneNumber.trim() || undefined,
        isActive: form.isActive,
      })
      if (res.success) {
        closeForm()
        load()
        refreshShopDetail()
        await Swal.fire({ icon: 'success', title: 'Saved', text: 'Shop detail updated.' })
      } else {
        await Swal.fire({ icon: 'error', title: 'Error', text: res.error ?? 'Update failed.' })
      }
    } else {
      const res = await saveShopDetail({
        name: form.name.trim(),
        logo: form.logo.trim() || undefined,
        address: form.address.trim() || undefined,
        phoneNumber: form.phoneNumber.trim() || undefined,
        isActive: form.isActive,
      })
      if (res.success) {
        closeForm()
        load()
        refreshShopDetail()
        await Swal.fire({ icon: 'success', title: 'Saved', text: 'Shop detail added.' })
      } else {
        await Swal.fire({ icon: 'error', title: 'Error', text: res.error ?? 'Save failed.' })
      }
    }
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 p-2" style={{ background: 'rgba(170, 51, 106, 0.1)' }}>
            <Store size={28} style={{ color: 'var(--aima-primary)' }} />
          </div>
          <h2 className="mb-0" style={{ color: 'var(--aima-secondary)' }}>Shop Detail</h2>
        </div>
        {!showForm && list.length === 0 && (
          <Button onClick={openAdd} style={{ backgroundColor: 'var(--aima-primary)' }}>
            <Plus size={18} className="me-1" />
            Add Shop
          </Button>
        )}
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">{editing ? 'Edit Shop' : 'Add Shop'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Name <span className="text-danger">*</span></label>
                  <Input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Shop name" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone Number</label>
                  <Input
                    className="form-control"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="10 digits only"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Address</label>
                  <Input className="form-control" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" />
                </div>
                <div className="col-12">
                  <FileUploadField
                    label="Logo"
                    subfolder="shop"
                    fieldName="logo"
                    value={form.logo}
                    onChange={(v) => setForm({ ...form, logo: v })}
                    accept="image/*"
                    className="col-12"
                  />
                </div>
                <div className="col-12 d-flex align-items-end gap-2 pt-1">
                  <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
                  <Button type="submit" style={{ backgroundColor: 'var(--aima-primary)' }}>
                    {editing ? 'Update' : 'Save'} Shop
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {!showForm && (
        <>
          {loadError && <div className="alert alert-warning py-2 mb-3">{loadError}</div>}
          {loading ? (
            <p className="text-muted mb-0">Loading...</p>
          ) : list.length === 1 ? (
            <ShopDetailProfileView shop={list[0]} onEdit={() => openEdit(list[0])} />
          ) : (
            <div
              className="overflow-hidden"
              style={{
                borderRadius: 16,
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.06)',
                background: '#fff',
              }}
            >
              <div className="p-4 p-md-5">
                <h6 className="mb-3 fw-semibold">Shop</h6>
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
<thead>
                    <tr>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Phone</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((s) => (
                        <tr key={s.id}>
                          <td className="fw-medium align-middle">{s.name}</td>
                          <td className="align-middle text-muted small">{s.address || '—'}</td>
                          <td className="align-middle">{s.phoneNumber || '—'}</td>
                          <td className="text-end align-middle">
                            <Button variant="ghost" size="sm" className="p-1 d-inline-flex align-items-center" onClick={() => openEdit(s)} title="Edit">
                              <EditIcon size={18} className="text-dark" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {list.length === 0 && (
                  <p className="text-muted mb-0">No shop detail. Click Add Shop to create one.</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
