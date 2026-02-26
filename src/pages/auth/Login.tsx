import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { forgotPassword } from '@/lib/authApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Lock, ArrowLeft } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [error, setError] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotError, setForgotError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [forgotSubmitting, setForgotSubmitting] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const success = await login(email, password)
    if (success) navigate('/')
    else setError('Invalid email or password')
  }

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotError('')
    setForgotSuccess(false)
    const emailAddress = forgotEmail.trim()
    if (!emailAddress) {
      setForgotError('Please enter your email address.')
      return
    }
    setForgotSubmitting(true)
    const result = await forgotPassword(emailAddress)
    setForgotSubmitting(false)
    if (result.success) {
      setForgotSuccess(true)
      navigate('/reset-password')
    } else {
      setForgotError(result.error || 'Failed to send reset code.')
    }
  }

  const openForgotPassword = () => {
    setShowForgotPassword(true)
    setForgotEmail(email)
    setForgotError('')
    setForgotSuccess(false)
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm login-form-card" style={{ width: '420px' }}>
        <div className="card-body p-5">
          {/* Logo - Top center */}
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

          {showForgotPassword ? (
            <>
              <div className="text-center mb-4">
                <div className="rounded-circle d-inline-flex align-items-center justify-content-center p-2 mb-2" style={{ background: 'rgba(170, 51, 106, 0.1)' }}>
                  <Mail size={24} style={{ color: 'var(--aima-primary)' }} />
                </div>
                <h4 className="fw-bold mb-1" style={{ color: 'var(--aima-secondary)' }}>Forgot Password</h4>
                <p className="text-muted mb-0 small">Enter your email to receive a reset code</p>
              </div>

              <form onSubmit={handleForgotSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-medium d-flex align-items-center gap-2">
                    <Mail size={16} style={{ color: 'var(--aima-primary)' }} />
                    Email address
                  </label>
                  <Input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                    className="form-control login-input"
                    autoFocus
                  />
                </div>
                {forgotSuccess && (
                  <div className="alert alert-success py-2 mb-3" role="alert">
                    If an account exists with this email, a password reset code has been sent.
                  </div>
                )}
                {forgotError && (
                  <div className="alert alert-danger py-2 mb-3" role="alert">
                    {forgotError}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-100 login-btn py-2 d-flex align-items-center justify-content-center gap-2 mb-3"
                  style={{ backgroundColor: 'var(--aima-primary)' }}
                  disabled={forgotSubmitting}
                >
                  <Mail size={18} />
                  {forgotSubmitting ? 'Sending...' : 'Send reset code'}
                </Button>
                <button
                  type="button"
                  className="btn btn-link w-100 text-decoration-none d-flex align-items-center justify-content-center gap-2"
                  style={{ color: '#212529', fontSize: '14px' }}
                  onClick={() => { setShowForgotPassword(false); setForgotError(''); setForgotSuccess(false) }}
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-4">
                <div className="rounded-circle d-inline-flex align-items-center justify-content-center p-2 mb-2" style={{ background: 'rgba(170, 51, 106, 0.1)' }}>
                  <Lock size={24} style={{ color: 'var(--aima-primary)' }} />
                </div>
                <h4 className="fw-bold mb-1" style={{ color: 'var(--aima-secondary)' }}>Login</h4>
                <p className="text-muted mb-0 small">Showroom - Bike Sales POS</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-medium d-flex align-items-center gap-2">
                    <Mail size={16} style={{ color: 'var(--aima-primary)' }} />
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    required
                    className="form-control login-input"
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-medium d-flex align-items-center gap-2">
                    <Lock size={16} style={{ color: 'var(--aima-primary)' }} />
                    Password
                  </label>
                  <div className="position-relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
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
                  <div className="text-end mb-3">
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none border-0"
                      style={{ color: '#212529', fontSize: '14px' }}
                      onClick={openForgotPassword}
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="alert alert-danger py-2 mb-3" role="alert">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-100 login-btn py-2 d-flex align-items-center justify-content-center gap-2">
                  <Lock size={18} />
                  Login
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
