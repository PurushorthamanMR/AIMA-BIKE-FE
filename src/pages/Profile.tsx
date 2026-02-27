import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getUserById, getUserByEmail, updateUser, type UserDto } from '@/lib/userApi'
import { sendEmailOtp, verifyEmailOtp } from '@/lib/authApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Mail, Pencil } from 'lucide-react'
import Swal from 'sweetalert2'

export default function Profile() {
  const { user: authUser } = useAuth()
  const [profile, setProfile] = useState<UserDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    emailAddress: '',
    address: '',
    mobileNumber: '',
  })
  const [emailVerificationToken, setEmailVerificationToken] = useState<string | null>(null)
  const [otpSent, setOtpSent] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadProfile = () => {
    if (!authUser?.id && !authUser?.username) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    const id = parseInt(String(authUser.id), 10)
    const load = (p: UserDto | null) => {
      setProfile(p ?? null)
      if (p) {
        setForm({
          firstName: p.firstName ?? '',
          lastName: p.lastName ?? '',
          emailAddress: p.emailAddress ?? '',
          address: p.address ?? '',
          mobileNumber: p.mobileNumber ?? '',
        })
      }
      setLoading(false)
    }
    if (!Number.isNaN(id)) {
      getUserById(id)
        .then(load)
        .catch(() =>
          getUserByEmail(authUser.username ?? '')
            .then((d) => load(d))
            .catch(() => {
              setProfile(null)
              setLoading(false)
              setError('Could not load profile.')
            })
        )
    } else {
      getUserByEmail(authUser.username ?? '')
        .then(load)
        .catch(() => {
          setProfile(null)
          setLoading(false)
          setError('Could not load profile.')
        })
    }
  }

  useEffect(() => {
    loadProfile()
  }, [authUser?.id, authUser?.username])

  const handleSendOtp = async () => {
    const email = form.emailAddress.trim()
    if (!email) {
      await Swal.fire({ icon: 'warning', title: 'Email required', text: 'Enter your email address first.' })
      return
    }
    setError('')
    const res = await sendEmailOtp(email)
    if (res.success) {
      setOtpSent(true)
      setOtpValue('')
      setEmailVerificationToken(null)
      await Swal.fire({ icon: 'success', title: 'OTP sent', text: 'Check your email for the verification code.' })
    } else {
      await Swal.fire({ icon: 'error', title: 'Error', text: res.error ?? 'Failed to send OTP' })
    }
  }

  const handleVerifyOtp = async () => {
    const email = form.emailAddress.trim()
    if (!otpValue.trim()) {
      await Swal.fire({ icon: 'warning', title: 'OTP required', text: 'Enter the code from your email.' })
      return
    }
    setOtpVerifying(true)
    const res = await verifyEmailOtp(email, otpValue.trim())
    setOtpVerifying(false)
    if (res.success && res.emailVerificationToken) {
      setEmailVerificationToken(res.emailVerificationToken)
      await Swal.fire({ icon: 'success', title: 'Verified', text: 'Your email is verified. You can now save.' })
    } else {
      await Swal.fire({ icon: 'error', title: 'Invalid OTP', text: res.error ?? 'Verification failed.' })
    }
  }

  const emailChanged = profile && (form.emailAddress || '').trim() !== (profile.emailAddress || '').trim()
  const needEmailVerify = editMode && emailChanged
  const mobileError = useMemo(() => {
    const v = form.mobileNumber.trim()
    if (!v) return null
    if (!/^\d{10}$/.test(v)) return 'Mobile must be exactly 10 digits.'
    return null
  }, [form.mobileNumber])
  const canSave = (!needEmailVerify || !!emailVerificationToken) && !mobileError

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    if (mobileError) {
      await Swal.fire({ icon: 'warning', title: 'Invalid mobile', text: mobileError })
      return
    }
    if (needEmailVerify && !emailVerificationToken) {
      await Swal.fire({ icon: 'warning', title: 'Verify email', text: 'Verify your email with OTP before saving.' })
      return
    }
    setSaving(true)
    const res = await updateUser({
      id: profile.id,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      emailAddress: form.emailAddress.trim(),
      address: form.address.trim() || undefined,
      mobileNumber: form.mobileNumber.trim() || undefined,
      emailVerificationToken: needEmailVerify ? emailVerificationToken ?? undefined : undefined,
    })
    setSaving(false)
    if (res.success) {
      setEditMode(false)
      setOtpSent(false)
      setEmailVerificationToken(null)
      loadProfile()
      await Swal.fire({ icon: 'success', title: 'Saved', text: 'Profile updated successfully.' })
    } else {
      await Swal.fire({ icon: 'error', title: 'Error', text: res.error ?? 'Update failed.' })
    }
  }

  const displayName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || profile?.emailAddress || 'User'

  if (loading) {
    return (
      <div className="container-fluid">
        <p className="text-muted">Loading profile...</p>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="container-fluid">
        <div className="alert alert-warning">{error}</div>
      </div>
    )
  }

  return (
    <div className="container-fluid">
      {/* Header: avatar, name, email, Edit */}
      <div
        className="mb-4 overflow-hidden"
        style={{
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.06)',
          background: '#fff',
        }}
      >
        <div className="p-4 p-md-5">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-4">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: 72,
                  height: 72,
                  background: 'linear-gradient(135deg, rgba(170, 51, 106, 0.12) 0%, rgba(170, 51, 106, 0.06) 100%)',
                  border: '2px solid rgba(170, 51, 106, 0.2)',
                }}
              >
                <User size={36} style={{ color: 'var(--aima-primary)' }} />
              </div>
              <div>
                <h4 className="mb-1 fw-bold" style={{ color: 'var(--aima-secondary)', letterSpacing: '-0.02em' }}>
                  {displayName}
                </h4>
                <p className="mb-0 text-muted small d-flex align-items-center gap-1">
                  <Mail size={14} />
                  {profile?.emailAddress ?? authUser?.username ?? '-'}
                </p>
              </div>
            </div>
            {!editMode ? (
              <Button
                onClick={() => setEditMode(true)}
                style={{ backgroundColor: 'var(--aima-primary)', borderRadius: 12, padding: '0.5rem 1.25rem', fontWeight: 600 }}
              >
                <Pencil size={18} className="me-1" />
                Edit
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => { setEditMode(false); setOtpSent(false); setEmailVerificationToken(null); loadProfile() }}
                style={{ borderRadius: 12, padding: '0.5rem 1.25rem' }}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Personal details – modern card */}
      {profile && (
        <div
          className="mb-4 overflow-hidden"
          style={{
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.06)',
            background: '#fff',
          }}
        >
          <div className="p-4 p-md-5">
            <h5
              className="mb-4 fw-semibold"
              style={{ color: 'var(--aima-secondary)', fontSize: '1.1rem', letterSpacing: '-0.01em' }}
            >
              Personal details
            </h5>
            {editMode ? (
              <form onSubmit={handleSave}>
                <div
                  className="rounded-3 p-4 mb-4"
                  style={{ background: 'rgba(170, 51, 106, 0.03)', border: '1px solid rgba(170, 51, 106, 0.08)' }}
                >
                  <div className="row g-3 g-md-4">
                    <div className="col-md-6">
                      <label className="form-label text-muted small text-uppercase fw-medium" style={{ letterSpacing: '0.05em' }}>
                        First name
                      </label>
                      <Input
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        placeholder="Enter first name"
                        className="form-control form-control-lg border-0 bg-white shadow-sm"
                        style={{ borderRadius: 12, padding: '0.65rem 1rem' }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small text-uppercase fw-medium" style={{ letterSpacing: '0.05em' }}>
                        Last name
                      </label>
                      <Input
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        placeholder="Enter last name"
                        className="form-control form-control-lg border-0 bg-white shadow-sm"
                        style={{ borderRadius: 12, padding: '0.65rem 1rem' }}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-muted small text-uppercase fw-medium" style={{ letterSpacing: '0.05em' }}>
                        Mobile
                      </label>
                      <Input
                        type="tel"
                        inputMode="numeric"
                        value={form.mobileNumber}
                        onChange={(e) => setForm({ ...form, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        placeholder="10 digits only"
                        className="form-control form-control-lg border-0 bg-white shadow-sm"
                        style={{ borderRadius: 12, padding: '0.65rem 1rem' }}
                        maxLength={10}
                      />
                      {mobileError && <p className="text-danger small mb-0 mt-1">{mobileError}</p>}
                    </div>
                    <div className="col-12">
                      <label className="form-label text-muted small text-uppercase fw-medium" style={{ letterSpacing: '0.05em' }}>
                        Address
                      </label>
                      <Input
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        placeholder="Address"
                        className="form-control form-control-lg border-0 bg-white shadow-sm"
                        style={{ borderRadius: 12, padding: '0.65rem 1rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* My email address – modern block */}
                <div
                  className="rounded-3 p-4 mb-4"
                  style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)' }}
                >
                  <h6 className="mb-3 fw-semibold text-body" style={{ fontSize: '0.95rem' }}>
                    My email address
                  </h6>
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                    <Mail size={18} className="text-muted" />
                    <Input
                      type="email"
                      value={form.emailAddress}
                      onChange={(e) => { setForm({ ...form, emailAddress: e.target.value }); setOtpSent(false); setEmailVerificationToken(null) }}
                      placeholder="Email address"
                      className="form-control form-control-lg border-0 bg-white shadow-sm"
                      style={{ maxWidth: 280, borderRadius: 12, padding: '0.65rem 1rem' }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSendOtp}
                      style={{ borderRadius: 10, padding: '0.5rem 1rem' }}
                    >
                      {otpSent ? 'Resend OTP' : 'Verify'}
                    </Button>
                  </div>
                  {otpSent && (
                    <div className="d-flex flex-wrap align-items-center gap-2 mt-3">
                      <Input
                        type="text"
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="6-digit OTP"
                        className="form-control border-0 bg-white shadow-sm"
                        style={{ maxWidth: 160, borderRadius: 10, padding: '0.5rem 1rem' }}
                        maxLength={6}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleVerifyOtp}
                        disabled={otpVerifying}
                        style={{ backgroundColor: 'var(--aima-primary)', borderRadius: 10, padding: '0.5rem 1rem' }}
                      >
                        {otpVerifying ? 'Verifying...' : 'Verify OTP'}
                      </Button>
                      {emailVerificationToken && (
                        <span className="text-success small fw-medium d-flex align-items-center gap-1">
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                          Email verified
                        </span>
                      )}
                    </div>
                  )}
                  {needEmailVerify && !emailVerificationToken && (
                    <p className="text-warning small mb-0 mt-2">Verify your email with OTP before saving.</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={!canSave || saving}
                  className="px-4"
                  style={{
                    backgroundColor: 'var(--aima-primary)',
                    borderRadius: 12,
                    padding: '0.65rem 1.5rem',
                    fontWeight: 600,
                  }}
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </Button>
              </form>
            ) : (
              <div className="row g-0">
                {[
                  { label: 'First name', value: profile.firstName },
                  { label: 'Last name', value: profile.lastName },
                  { label: 'Email', value: profile.emailAddress },
                  { label: 'Role', value: profile.userRoleDto?.userRole },
                  { label: 'Mobile', value: profile.mobileNumber },
                  { label: 'Address', value: profile.address },
                ].map(({ label, value }, i) => (
                  <div
                    key={label}
                    className="d-flex align-items-center py-3 px-0"
                    style={{
                      borderBottom: i < 5 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    <span className="text-muted small text-uppercase fw-medium me-3" style={{ minWidth: 100, letterSpacing: '0.04em' }}>
                      {label}
                    </span>
                    <span className="fw-medium text-body">{value ?? '-'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
