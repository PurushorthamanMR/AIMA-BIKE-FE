import { Settings as SettingsIcon, Users, Database, Shield } from 'lucide-react'

export default function Settings() {
  return (
    <div className="container-fluid">
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="rounded-3 p-2" style={{ background: 'rgba(170, 51, 106, 0.1)' }}>
          <SettingsIcon size={32} style={{ color: 'var(--aima-primary)' }} />
        </div>
        <div>
          <h2 className="mb-0" style={{ color: 'var(--aima-secondary)' }}>Settings</h2>
          <p className="mb-0 small" style={{ color: 'var(--aima-muted)' }}>System configuration</p>
        </div>
      </div>
      <div className="card border-0 shadow-sm page-card">
        <div className="card-body">
          <div className="d-flex align-items-center gap-3 mb-3">
            <Shield size={24} style={{ color: 'var(--aima-primary)' }} />
            <h5 className="mb-0" style={{ color: 'var(--aima-secondary)' }}>System Settings</h5>
          </div>
          <p className="text-muted mb-4">Admin-only settings - User management, Database backup, etc.</p>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="d-flex align-items-center gap-2 p-3 rounded-3" style={{ background: 'var(--aima-surface)', border: '1px solid var(--aima-border)' }}>
                <Users size={20} style={{ color: 'var(--aima-primary)' }} />
                <span style={{ color: 'var(--aima-secondary)' }}>User Management</span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center gap-2 p-3 rounded-3" style={{ background: 'var(--aima-surface)', border: '1px solid var(--aima-border)' }}>
                <Database size={20} style={{ color: 'var(--aima-primary)' }} />
                <span style={{ color: 'var(--aima-secondary)' }}>Database Backup</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
