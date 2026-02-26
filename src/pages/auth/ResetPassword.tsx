import { useState } from 'react'
import { Link } from 'react-router-dom'
import { resetPassword } from '@/lib/authApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock, ArrowLeft, KeyRound } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

export default function ResetPassword() {
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const tokenTrimmed = token.trim()
    if (!tokenTrimmed) {
      setError('Enter the reset code from your email.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    const result = await resetPassword(tokenTrimmed, newPassword)
    setSubmitting(false)
    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || 'Failed to reset password.')
    }
  }

  if (success) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="card shadow-sm login-form-card" style={{ width: '420px' }}>
          <div className="card-body p-5 text-center">
            <div className="rounded-circle d-inline-flex align-items-center justify-content-center p-2 mb-3" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
              <Lock size={24} style={{ color: 'var(--bs-success)' }} />
            </div>
            <h4 className="fw-bold mb-2" style={{ color: 'var(--aima-secondary)' }}>Password reset</h4>
            <p className="text-muted mb-4">Your password has been reset. You can now log in with your new password.</p>
            <Link to="/login" className="btn w-100 py-2 d-flex align-items-center justify-content-center gap-2" style={{ backgroundColor: 'var(--aima-primary)', color: 'white' }}>
              <ArrowLeft size={18} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm login-form-card" style={{ width: '420px' }}>
        <div className="card-body p-5">
          <div className="d-flex justify-content-center mb-3">
            {!logoError ? (
              <img
                src="/images_logos/logo.jpg"
                alt="AIMA Logo"
                style={{ maxHeight: '45px', objectFit: 'contain' }}
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="text-center">
                <h3 className="mb-0 fw-bold">AIMA</h3>
                <small className="text-muted">Showroom</small>
              </div>
            )}
          </div>

          <div className="text-center mb-4">
            <div className="rounded-circle d-inline-flex align-items-center justify-content-center p-2 mb-2" style={{ background: 'rgba(170, 51, 106, 0.1)' }}>
              <Lock size={24} style={{ color: 'var(--aima-primary)' }} />
            </div>
            <h4 className="fw-bold mb-1" style={{ color: 'var(--aima-secondary)' }}>Reset Password</h4>
            <p className="text-muted mb-0 small">Enter the reset code from your email and your new password</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-medium d-flex align-items-center gap-2">
                <KeyRound size={16} style={{ color: 'var(--aima-primary)' }} />
                Reset code
              </label>
              <Input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste reset code from email"
                required
                className="form-control login-input"
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-medium d-flex align-items-center gap-2">
                <Lock size={16} style={{ color: 'var(--aima-primary)' }} />
                New password
              </label>
              <div className="position-relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="form-control login-input pe-5"
                />
                <button
                  type="button"
                  className="position-absolute top-50 translate-middle-y bg-transparent border-0 p-2"
                  style={{ right: '4px' }}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-muted" style={{ fontSize: '1.1rem' }} />
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label fw-medium d-flex align-items-center gap-2">
                <Lock size={16} style={{ color: 'var(--aima-primary)' }} />
                Confirm new password
              </label>
              <div className="position-relative">
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="form-control login-input pe-5"
                />
                <button
                  type="button"
                  className="position-absolute top-50 translate-middle-y bg-transparent border-0 p-2"
                  style={{ right: '4px' }}
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} className="text-muted" style={{ fontSize: '1.1rem' }} />
                </button>
              </div>
            </div>
            {error && (
              <div className="alert alert-danger py-2 mb-3" role="alert">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-100 login-btn py-2 d-flex align-items-center justify-content-center gap-2 mb-3"
              style={{ backgroundColor: 'var(--aima-primary)' }}
              disabled={submitting}
            >
              <Lock size={18} />
              {submitting ? 'Resetting...' : 'Reset password'}
            </Button>
            <Link
              to="/login"
              className="btn btn-link w-100 text-decoration-none d-flex align-items-center justify-content-center gap-2"
              style={{ color: '#212529', fontSize: '14px' }}
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </form>
        </div>
      </div>
    </div>
  )
}
