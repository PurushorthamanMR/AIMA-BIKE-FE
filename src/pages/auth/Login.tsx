import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [error, setError] = useState('')
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

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm login-form-card" style={{ width: '420px' }}>
        <div className="card-body p-5">
          {/* Logo - Top center */}
          <div className="d-flex justify-content-center mb-3">
            {!logoError ? (
              <img
                src="/images_logos/Logo.png"
                alt="AIMA Logo"
                style={{ maxHeight: '70px', objectFit: 'contain' }}
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="text-center">
                <h3 className="mb-0 fw-bold">AIMA</h3>
                <small className="text-muted">Showroom</small>
              </div>
            )}
          </div>

          <h4 className="text-center fw-bold mb-1">Login</h4>
          <p className="text-center text-muted mb-4">Showroom - Bike Sales POS</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-medium">Email</label>
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
              <label className="form-label fw-medium">Password</label>
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
                  className="position-absolute top-50 end-0 translate-middle-y bg-transparent border-0 p-2"
                  style={{ right: '4px' }}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <img
                    src={showPassword ? '/images_logos/eye-password-hide.svg' : '/images_logos/password-eye.svg'}
                    alt={showPassword ? 'Hide' : 'Show'}
                    width={24}
                    height={24}
                  />
                </button>
              </div>
              <div className="text-end mb-3">
                <a
                  href="#"
                  className="text-decoration-none"
                  style={{ color: '#AA336A', fontSize: '14px' }}
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot Password?
                </a>
              </div>
            </div>
            {error && (
              <div className="alert alert-danger py-2 mb-3" role="alert">
                {error}
              </div>
            )}
            <Button type="submit" className="w-100 login-btn py-2">
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
