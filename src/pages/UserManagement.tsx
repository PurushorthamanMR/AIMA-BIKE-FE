import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getUsersPage,
  getUserById,
  registerUser,
  updateUser,
  updateUserStatus,
  getUserRoles,
  type UserDto,
  type UserRoleDto,
} from '@/lib/userApi'
import { sendEmailOtp, verifyEmailOtp } from '@/lib/authApi'
import { useAuth } from '@/hooks/useAuth'
import { Plus, UserCog, Search, Mail } from 'lucide-react'
import ViewIcon from '@/components/icons/ViewIcon'
import EditIcon from '@/components/icons/EditIcon'
import Swal from 'sweetalert2'

export default function UserManagement() {
  const { user } = useAuth()
  const currentRole = (user?.role ?? '').toLowerCase()
  const [list, setList] = useState<UserDto[]>([])
  const [roles, setRoles] = useState<UserRoleDto[]>([])
  const selectableRoles = useMemo(() => {
    if (currentRole === 'manager') {
      return roles.filter((r) => (r.userRole ?? '').toUpperCase() === 'STAFF')
    }
    return roles
  }, [currentRole, roles])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [viewUser, setViewUser] = useState<UserDto | null>(null)
  const [editing, setEditing] = useState<UserDto | null>(null)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    emailAddress: '',
    password: '',
    address: '',
    mobileNumber: '',
    userRoleId: 0,
    isActive: true,
  })
  const [success, setSuccess] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [emailVerificationToken, setEmailVerificationToken] = useState<string | null>(null)
  const [otpSent, setOtpSent] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const setFieldError = (field: string, message: string | null) => {
    setFieldErrors((prev) => {
      const next = { ...prev }
      if (message) next[field] = message
      else delete next[field]
      return next
    })
  }

  const load = () => {
    setLoading(true)
    setLoadError('')
    getUsersPage(1, 200, {
      firstName: searchQuery.trim() || undefined,
      lastName: searchQuery.trim() || undefined,
      emailAddress: searchQuery.trim() || undefined,
    })
      .then((res) => {
        setList(res.content ?? [])
        setLoading(false)
      })
      .catch(() => {
        setList([])
        setLoading(false)
        setLoadError('Failed to load users.')
      })
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    getUserRoles().then((r) => setRoles(r ?? []))
  }, [])

  useEffect(() => {
    if (editing) {
      const roleId = editing.userRoleDto?.id ?? editing.userRoleId ?? 0
      setForm({
        firstName: editing.firstName ?? '',
        lastName: editing.lastName ?? '',
        emailAddress: editing.emailAddress ?? '',
        password: '',
        address: editing.address ?? '',
        mobileNumber: editing.mobileNumber ?? '',
        userRoleId: roleId,
        isActive: editing.isActive !== false,
      })
    } else {
      setForm({
        firstName: '',
        lastName: '',
        emailAddress: '',
        password: '',
        address: '',
        mobileNumber: '',
        userRoleId: selectableRoles[0]?.id ?? 0,
        isActive: true,
      })
    }
  }, [editing, selectableRoles])

  const openAdd = () => {
    setEditing(null)
    setViewUser(null)
    setEmailVerificationToken(null)
    setOtpSent(false)
    setOtpValue('')
    setFieldErrors({})
    setForm({
      firstName: '',
      lastName: '',
      emailAddress: '',
      password: '',
      address: '',
      mobileNumber: '',
      userRoleId: selectableRoles[0]?.id ?? 0,
      isActive: true,
    })
    setShowForm(true)
  }

  const openView = async (u: UserDto) => {
    setViewUser(null)
    const full = await getUserById(u.id)
    setViewUser(full ?? u)
  }

  const openEdit = (u: UserDto) => {
    setEditing(u)
    setViewUser(null)
    setEmailVerificationToken(null)
    setOtpSent(false)
    setOtpSending(false)
    setOtpValue('')
    setFieldErrors({})
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
    setEmailVerificationToken(null)
    setOtpSent(false)
    setOtpSending(false)
    setFieldErrors({})
  }

  const handleSendOtp = async () => {
    const email = form.emailAddress.trim()
    if (!email) {
      await Swal.fire({ icon: 'warning', title: 'Email required', text: 'Enter email first.' })
      return
    }
    setOtpSending(true)
    const res = await sendEmailOtp(email)
    setOtpSending(false)
    if (res.success) {
      setOtpSent(true)
      setOtpValue('')
      setEmailVerificationToken(null)
      await Swal.fire({ icon: 'success', title: 'OTP sent', text: 'Check the email for the verification code.' })
    } else {
      await Swal.fire({ icon: 'error', title: 'Error', text: res.error ?? 'Failed to send OTP' })
    }
  }

  const handleVerifyOtp = async () => {
    const email = form.emailAddress.trim()
    if (!otpValue.trim()) {
      await Swal.fire({ icon: 'warning', title: 'OTP required', text: 'Enter the code from email.' })
      return
    }
    setOtpVerifying(true)
    const res = await verifyEmailOtp(email, otpValue.trim())
    setOtpVerifying(false)
    if (res.success && res.emailVerificationToken) {
      setEmailVerificationToken(res.emailVerificationToken)
      await Swal.fire({ icon: 'success', title: 'Verified', text: 'Email verified. You can now save the user.' })
    } else {
      await Swal.fire({ icon: 'error', title: 'Invalid OTP', text: res.error ?? 'Verification failed.' })
    }
  }

  const closeView = () => setViewUser(null)

  const originalEmail = (editing?.emailAddress ?? '').trim().toLowerCase()
  const newEmail = form.emailAddress.trim().toLowerCase()
  const emailChangedInEdit = !!editing && newEmail && newEmail !== originalEmail
  const needsEmailVerification = !editing ? !emailVerificationToken : (emailChangedInEdit && !emailVerificationToken)

  function mapApiErrorToFieldErrors(message: string): Record<string, string> {
    const err = (message || '').trim()
    if (err.includes('Email address already exists')) return { emailAddress: err }
    if (err.includes('Mobile number already exists')) return { mobileNumber: err }
    if (err.includes('Mobile number must be exactly 10 digits')) return { mobileNumber: err }
    if (err.includes('First name and last name combination already exists')) return { firstName: err, lastName: err }
    return {}
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})
    if (!form.firstName.trim() || !form.lastName.trim() || !form.emailAddress.trim()) {
      await Swal.fire({ icon: 'error', title: 'Validation', text: 'First name, last name and email are required.' })
      return
    }
    if (!editing && !form.password.trim()) {
      await Swal.fire({ icon: 'error', title: 'Validation', text: 'Password is required for new user.' })
      return
    }
    const mobile = form.mobileNumber.trim()
    if (mobile && !/^\d{10}$/.test(mobile)) {
      setFieldErrors({ mobileNumber: 'Mobile number must be exactly 10 digits.' })
      return
    }
    if (emailChangedInEdit && !emailVerificationToken) {
      await Swal.fire({ icon: 'warning', title: 'Verify email', text: 'Verify the new email with OTP before saving.' })
      return
    }
    const roleId = form.userRoleId || selectableRoles[0]?.id
    if (editing) {
      const res = await updateUser({
        id: editing.id,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        emailAddress: form.emailAddress.trim(),
        address: form.address.trim() || undefined,
        mobileNumber: mobile || undefined,
        userRoleId: roleId,
        userRoleDto: roleId ? { id: roleId } : undefined,
        ...(emailChangedInEdit && emailVerificationToken ? { emailVerificationToken } : {}),
      })
      if (res.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
        closeForm()
        load()
        await Swal.fire({ icon: 'success', title: 'Saved', text: 'User updated successfully.' })
      } else {
        const fieldErrs = mapApiErrorToFieldErrors(res.error ?? '')
        if (Object.keys(fieldErrs).length) setFieldErrors(fieldErrs)
        else await Swal.fire({ icon: 'error', title: 'Error', text: res.error ?? 'Update failed.' })
      }
    } else {
      if (!emailVerificationToken) {
        await Swal.fire({ icon: 'warning', title: 'Verify email', text: 'Verify the user email with OTP before adding.' })
        return
      }
      const res = await registerUser({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        emailAddress: form.emailAddress.trim(),
        password: form.password,
        address: form.address.trim() || undefined,
        mobileNumber: mobile || undefined,
        isActive: form.isActive,
        userRoleId: roleId,
        userRoleDto: roleId ? { id: roleId } : undefined,
        emailVerificationToken,
      })
      if (res.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
        closeForm()
        load()
        await Swal.fire({ icon: 'success', title: 'Saved', text: 'User added successfully.' })
      } else {
        const fieldErrs = mapApiErrorToFieldErrors(res.error ?? '')
        if (Object.keys(fieldErrs).length) setFieldErrors(fieldErrs)
        else await Swal.fire({ icon: 'error', title: 'Error', text: res.error ?? 'Registration failed.' })
      }
    }
  }

  const handleToggleStatus = async (u: UserDto) => {
    const next = !(u.isActive ?? true)
    const action = next ? 'activate' : 'deactivate'
    const { isConfirmed } = await Swal.fire({
      title: 'Confirm',
      text: `Are you sure you want to ${action} "${u.firstName} ${u.lastName}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
    })
    if (!isConfirmed) return
    const res = await updateUserStatus(u.id, next)
    if (res.success) load()
    else await Swal.fire({ icon: 'error', title: 'Error', text: res.error })
  }

  const filteredList = searchQuery.trim()
    ? list.filter(
        (u) =>
          (u.firstName ?? '').toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
          (u.lastName ?? '').toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
          (u.emailAddress ?? '').toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : list

  const liveDuplicateErrors = useMemo(() => {
    const errors: Record<string, string> = {}
    if (!showForm) return errors
    const currentId = editing?.id
    const first = form.firstName.trim().toLowerCase()
    const last = form.lastName.trim().toLowerCase()
    const email = form.emailAddress.trim().toLowerCase()
    const mobile = form.mobileNumber.trim()

    if (first && last) {
      const duplicateName = list.some(
        (u) =>
          u.id !== currentId &&
          (u.firstName ?? '').trim().toLowerCase() === first &&
          (u.lastName ?? '').trim().toLowerCase() === last
      )
      if (duplicateName) {
        errors.firstName = 'First name and last name combination already exists.'
        errors.lastName = 'First name and last name combination already exists.'
      }
    }
    if (email) {
      const duplicateEmail = list.some(
        (u) => u.id !== currentId && (u.emailAddress ?? '').trim().toLowerCase() === email
      )
      if (duplicateEmail) errors.emailAddress = 'Email address already exists.'
    }
    if (mobile.length === 10) {
      const duplicateMobile = list.some(
        (u) => u.id !== currentId && (u.mobileNumber ?? '').trim() === mobile
      )
      if (duplicateMobile) errors.mobileNumber = 'Mobile number already exists.'
    }
    return errors
  }, [showForm, editing?.id, form.firstName, form.lastName, form.emailAddress, form.mobileNumber, list])

  const displayError = (field: string) => fieldErrors[field] || liveDuplicateErrors[field]
  const hasValidationError = (['firstName', 'lastName', 'emailAddress', 'mobileNumber'] as const).some((f) => displayError(f))

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 p-2" style={{ background: 'rgba(170, 51, 106, 0.1)' }}>
            <UserCog size={28} style={{ color: 'var(--aima-primary)' }} />
          </div>
          <h2 className="mb-0" style={{ color: 'var(--aima-secondary)' }}>User</h2>
        </div>
        {!showForm && (
          <Button onClick={openAdd} style={{ backgroundColor: 'var(--aima-primary)' }}>
            <Plus size={18} className="me-1" />
            Add User
          </Button>
        )}
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">{editing ? 'Edit User' : 'Add User'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">First name *</label>
                  <Input
                    value={form.firstName}
                    onChange={(e) => { setForm({ ...form, firstName: e.target.value }); setFieldError('firstName', null); setFieldError('lastName', null) }}
                    placeholder="First name"
                    required
                    className="form-control"
                  />
                  {displayError('firstName') && <p className="text-danger small mb-0 mt-1">{displayError('firstName')}</p>}
                </div>
                <div className="col-md-3">
                  <label className="form-label">Last name *</label>
                  <Input
                    value={form.lastName}
                    onChange={(e) => { setForm({ ...form, lastName: e.target.value }); setFieldError('firstName', null); setFieldError('lastName', null) }}
                    placeholder="Last name"
                    required
                    className="form-control"
                  />
                  {displayError('lastName') && <p className="text-danger small mb-0 mt-1">{displayError('lastName')}</p>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Email *</label>
                  <div className="d-flex align-items-center gap-2">
                    <Input
                      type="email"
                      value={form.emailAddress}
                      onChange={(e) => { setForm({ ...form, emailAddress: e.target.value }); setOtpSent(false); setEmailVerificationToken(null); setFieldError('emailAddress', null) }}
                      placeholder="Email"
                      required
                      className="form-control"
                      readOnly={!!emailVerificationToken}
                      disabled={!!emailVerificationToken}
                    />
                    {!emailVerificationToken && (editing ? emailChangedInEdit : true) && (
                      <Button type="button" variant="outline" size="sm" onClick={handleSendOtp} disabled={otpSending} title="Send OTP to verify email">
                        <Mail size={16} />
                        {otpSending ? 'Sending...' : 'Verify'}
                      </Button>
                    )}
                    {emailVerificationToken && (
                      <span className="text-success small fw-medium">Verified</span>
                    )}
                  </div>
                  {!emailVerificationToken && otpSent && (editing ? emailChangedInEdit : true) && (
                    <div className="d-flex align-items-center gap-2 mt-2">
                      <Input
                        type="text"
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit OTP"
                        className="form-control"
                        style={{ maxWidth: 140 }}
                        maxLength={6}
                      />
                      <Button type="button" size="sm" onClick={handleVerifyOtp} disabled={otpVerifying} style={{ backgroundColor: 'var(--aima-primary)' }}>
                        {otpVerifying ? 'Verifying...' : 'Verify OTP'}
                      </Button>
                    </div>
                  )}
                  {!editing && !emailVerificationToken && (
                    <p className="text-warning small mb-0 mt-1">Verify email with OTP before adding user.</p>
                  )}
                  {displayError('emailAddress') && <p className="text-danger small mb-0 mt-1">{displayError('emailAddress')}</p>}
                  {editing && emailChangedInEdit && !emailVerificationToken && (
                    <p className="text-warning small mb-0 mt-1">Email changed. Verify the new email with OTP before saving.</p>
                  )}
                </div>
                {!editing && (
                  <div className="col-md-3">
                    <label className="form-label">Password *</label>
                    <Input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Password"
                      required={!editing}
                      className="form-control"
                    />
                  </div>
                )}
                <div className="col-md-4">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={form.userRoleId || ''}
                    onChange={(e) => setForm({ ...form, userRoleId: parseInt(e.target.value, 10) || 0 })}
                  >
                    <option value={0}>Select role</option>
                    {selectableRoles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.userRole}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Mobile</label>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    value={form.mobileNumber}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 10)
                      setForm({ ...form, mobileNumber: v })
                      setFieldError('mobileNumber', null)
                    }}
                    placeholder="10 digits only"
                    className="form-control"
                    maxLength={10}
                  />
                  {displayError('mobileNumber') && <p className="text-danger small mb-0 mt-1">{displayError('mobileNumber')}</p>}
                </div>
                <div className="col-12">
                  <label className="form-label">Address</label>
                  <Input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Address"
                    className="form-control"
                  />
                </div>
                <div className="col-12 d-flex gap-2 pt-1">
                  <Button type="button" variant="outline" onClick={closeForm}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    style={{ backgroundColor: 'var(--aima-primary)' }}
                    disabled={needsEmailVerification || hasValidationError}
                  >
                    {editing ? 'Update' : 'Add'} User
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewUser && (
        <div className="card mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0">User details</h5>
              <Button type="button" variant="outline" size="sm" onClick={closeView}>
                Close
              </Button>
            </div>
            <dl className="row mb-0">
              <dt className="col-sm-3">First name</dt>
              <dd className="col-sm-9">{viewUser.firstName ?? '-'}</dd>
              <dt className="col-sm-3">Last name</dt>
              <dd className="col-sm-9">{viewUser.lastName ?? '-'}</dd>
              <dt className="col-sm-3">Email</dt>
              <dd className="col-sm-9">{viewUser.emailAddress ?? '-'}</dd>
              <dt className="col-sm-3">Role</dt>
              <dd className="col-sm-9">{viewUser.userRoleDto?.userRole ?? '-'}</dd>
              <dt className="col-sm-3">Mobile</dt>
              <dd className="col-sm-9">{viewUser.mobileNumber ?? '-'}</dd>
              <dt className="col-sm-3">Address</dt>
              <dd className="col-sm-9">{viewUser.address ?? '-'}</dd>
              <dt className="col-sm-3">Status</dt>
              <dd className="col-sm-9">{viewUser.isActive !== false ? 'Active' : 'Inactive'}</dd>
            </dl>
          </div>
        </div>
      )}

      {!showForm && !viewUser && (
        <div className="card">
          <div className="card-body">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
              <h6 className="mb-0 fw-semibold">Users</h6>
              <div className="d-flex align-items-center gap-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  style={{ maxWidth: 220 }}
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                />
                <Button type="button" variant="outline" size="sm" title="Search by name or email">
                  <Search size={18} />
                </Button>
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
                      <th>First name</th>
                      <th>Last name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map((u) => {
                      const roleName = (u.userRoleDto?.userRole ?? '').toUpperCase()
                      const roleId = u.userRoleDto?.id ?? u.userRoleId
                      const staffRoleId = currentRole === 'manager' ? selectableRoles[0]?.id : undefined
                      const isStaff = roleName === 'STAFF' || (currentRole === 'manager' && staffRoleId != null && roleId === staffRoleId)
                      const canEditRow = currentRole !== 'manager' || isStaff
                      return (
                        <tr key={u.id}>
                          <td className="fw-medium align-middle">{u.firstName ?? '-'}</td>
                          <td className="align-middle">{u.lastName ?? '-'}</td>
                          <td className="align-middle">{u.emailAddress ?? '-'}</td>
                          <td className="align-middle">{u.userRoleDto?.userRole ?? '-'}</td>
                          <td className="align-middle">
                            <div className="form-check form-switch mb-0">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`user-status-${u.id}`}
                                checked={u.isActive !== false}
                                disabled={!canEditRow}
                                onChange={() => handleToggleStatus(u)}
                                title={canEditRow ? (u.isActive !== false ? 'Turn off' : 'Turn on') : 'Manager can only change Staff status'}
                              />
                            </div>
                          </td>
                          <td className="text-end align-middle">
                            <div className="d-flex align-items-center justify-content-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 d-inline-flex align-items-center justify-content-center"
                                style={{ minHeight: 36 }}
                                onClick={() => openView(u)}
                                title="View"
                              >
                                <ViewIcon size={20} className="text-primary" />
                              </Button>
                              {canEditRow ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 d-inline-flex align-items-center justify-content-center"
                                  style={{ minHeight: 36 }}
                                  onClick={() => openEdit(u)}
                                  title="Edit"
                                >
                                  <EditIcon size={18} className="text-dark" />
                                </Button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && filteredList.length === 0 && (
              <p className="text-muted mb-0">
                {searchQuery.trim() ? 'No users match your search.' : 'No users. Click Add User to create one.'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
