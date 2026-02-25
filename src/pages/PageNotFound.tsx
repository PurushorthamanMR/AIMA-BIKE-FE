import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function PageNotFound() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [seconds, setSeconds] = useState(2)

  useEffect(() => {
    const timer = setTimeout(() => {
      logout()
      navigate('/login', { replace: true })
    }, 2000)
    return () => clearTimeout(timer)
  }, [navigate, logout])

  useEffect(() => {
    if (seconds <= 0) return
    const interval = setInterval(() => setSeconds((s) => s - 1), 1000)
    return () => clearInterval(interval)
  }, [seconds])

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm text-center" style={{ maxWidth: 420 }}>
        <div className="card-body p-5">
          <h1 className="display-4 fw-bold text-muted mb-2">404</h1>
          <h5 className="mb-3" style={{ color: 'var(--aima-secondary)' }}>Page not found</h5>
          <p className="text-muted mb-0">
            The page you are looking for does not exist.
          </p>
          <p className="small text-muted mt-3 mb-0">
            Redirecting to login in {seconds} second{seconds !== 1 ? 's' : ''}...
          </p>
        </div>
      </div>
    </div>
  )
}
