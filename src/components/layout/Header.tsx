import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="border-bottom bg-white px-4 py-3 d-flex align-items-center justify-content-between">
      <div>
        <span className="text-muted">Welcome, </span>
        <span className="fw-semibold">{user?.name || user?.username}</span>
        <span className="badge bg-secondary ms-2 text-capitalize">{user?.role}</span>
      </div>
      <Button variant="outline" size="sm" onClick={logout}>
        <LogOut size={16} />
        Logout
      </Button>
    </header>
  )
}
