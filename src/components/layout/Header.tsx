import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header
      className="border-bottom px-4 py-3 d-flex align-items-center justify-content-between"
      style={{
        background: 'white',
        borderColor: 'var(--aima-border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div className="d-flex align-items-center gap-2">
        <span className="text-muted" style={{ color: 'var(--aima-muted)' }}>Welcome,</span>
        <span className="fw-semibold" style={{ color: 'var(--aima-secondary)' }}>{user?.name || user?.username}</span>
        <span
          className="badge text-capitalize"
          style={{ background: 'var(--aima-primary)', color: 'white', fontSize: '0.7rem' }}
        >
          {user?.role}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={logout}
        style={{ borderColor: 'var(--aima-border)', color: 'var(--aima-secondary)' }}
      >
        <LogOut size={16} className="me-1" />
        Logout
      </Button>
    </header>
  )
}
