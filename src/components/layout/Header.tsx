import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { LogOut, Maximize2, Minimize2 } from 'lucide-react'

export default function Header() {
  const { user, logout } = useAuth()
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement)

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

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
      <div className="d-flex align-items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit full screen' : 'Full screen (hide URL bar & taskbar)'}
          style={{ borderColor: 'var(--aima-border)', color: 'var(--aima-secondary)' }}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          style={{ borderColor: 'var(--aima-border)', color: 'var(--aima-secondary)' }}
        >
          <LogOut size={16} className="me-1" />
          Logout
        </Button>
      </div>
    </header>
  )
}
