import { useState, useEffect } from 'react'
import { Database as DatabaseIcon, Download, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createBackup, getBackups, downloadBackup, type BackupDto } from '@/lib/databaseApi'
import { useAuth } from '@/hooks/useAuth'
import Swal from 'sweetalert2'

function formatDate(d: string) {
  if (!d) return '–'
  const date = new Date(d)
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export default function Database() {
  const { user } = useAuth()
  const isAdmin = user?.role?.toLowerCase() === 'admin'
  const [list, setList] = useState<BackupDto[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [creating, setCreating] = useState(false)
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setLoadError('')
    getBackups()
      .then((data) => {
        setList(data ?? [])
        setLoading(false)
      })
      .catch(() => {
        setList([])
        setLoading(false)
        setLoadError('Failed to load backups.')
      })
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreateBackup = async () => {
    setCreating(true)
    const result = await createBackup()
    setCreating(false)
    if (result.success && result.data) {
      setList((prev) => [result.data!, ...prev])
      await Swal.fire({ icon: 'success', title: 'Backup created', text: result.data.filename })
    } else {
      await Swal.fire({ icon: 'error', title: 'Error', text: result.error ?? 'Failed to create backup.' })
    }
  }

  const handleDownload = async (b: BackupDto, part: 'structure' | 'data') => {
    const key = `${b.id}-${part}`
    setDownloadingKey(key)
    const result = await downloadBackup(b.id, b.filename.replace(/\.sql$/i, ''), part)
    setDownloadingKey(null)
    if (!result.success) {
      await Swal.fire({ icon: 'error', title: 'Download failed', text: result.error })
    }
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 p-2" style={{ background: 'rgba(170, 51, 106, 0.1)' }}>
            <DatabaseIcon size={28} style={{ color: 'var(--aima-primary)' }} />
          </div>
          <h2 className="mb-0" style={{ color: 'var(--aima-secondary)' }}>Database</h2>
        </div>
        {isAdmin && (
          <Button
            onClick={handleCreateBackup}
            disabled={creating}
            style={{ backgroundColor: 'var(--aima-primary)' }}
          >
            {creating ? <Loader2 size={18} className="me-1 animate-spin" /> : <Plus size={18} className="me-1" />}
            Take backup
          </Button>
        )}
      </div>

      <div className="card">
        <div className="card-body">
          <p className="text-muted mb-3">Backups are stored in the database. Each backup has structure (DDL) and data (INSERTs) in separate SQL files. Use the buttons to download either.</p>
          {loadError && <div className="alert alert-warning py-2 mb-3">{loadError}</div>}
          {loading ? (
            <p className="text-muted mb-0">Loading backups...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>File</th>
                    <th className="text-end">Structure</th>
                    <th className="text-end">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((b) => (
                    <tr key={b.id}>
                      <td className="align-middle">{formatDate(b.createdAt)}</td>
                      <td className="align-middle fw-medium">{b.filename}</td>
                      <td className="text-end align-middle">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={downloadingKey === `${b.id}-structure`}
                          onClick={() => handleDownload(b, 'structure')}
                          title="Download structure (DDL) SQL"
                        >
                          {downloadingKey === `${b.id}-structure` ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Download size={16} className="me-1" />
                          )}
                          Structure
                        </Button>
                      </td>
                      <td className="text-end align-middle">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={downloadingKey === `${b.id}-data`}
                          onClick={() => handleDownload(b, 'data')}
                          title="Download data (INSERTs) SQL"
                        >
                          {downloadingKey === `${b.id}-data` ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Download size={16} className="me-1" />
                          )}
                          Data
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && list.length === 0 && (
            <p className="text-muted mb-0 mt-3">No backups yet.{isAdmin ? ' Click "Take backup" to create one.' : ''}</p>
          )}
        </div>
      </div>
    </div>
  )
}
