import { apiGet, apiPost, ApiResponse, getToken } from './api'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081'

export interface BackupDto {
  id: number
  filename: string
  createdAt: string
}

/** Create a new backup (Admin only) */
export async function createBackup(): Promise<{ success: boolean; data?: BackupDto; error?: string }> {
  const res: ApiResponse<BackupDto> = await apiPost<BackupDto>('/database/backup', {})
  if (res.status && res.responseDto) {
    return { success: true, data: res.responseDto }
  }
  return { success: false, error: res.errorDescription || 'Failed to create backup' }
}

/** List all backups */
export async function getBackups(): Promise<BackupDto[]> {
  const res: ApiResponse<BackupDto[]> = await apiGet<BackupDto[]>('/database/backups')
  if (res.status && res.responseDto && Array.isArray(res.responseDto)) {
    return res.responseDto
  }
  return []
}

/** Download backup as SQL file (structure or data). Triggers browser download. */
export async function downloadBackup(
  id: number,
  filenameBase: string,
  part: 'structure' | 'data'
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = getToken()
    const res = await fetch(`${API_BASE}/database/backups/${id}/download?part=${part}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { success: false, error: (err as { errorDescription?: string }).errorDescription || 'Download failed' }
    }
    const content = await res.text()
    const disposition = res.headers.get('Content-Disposition')
    const match = disposition && /filename="?([^";\n]+)"?/.exec(disposition)
    const name = match ? match[1].trim() : `${filenameBase}_${part}.sql`
    const blob = new Blob([content], { type: 'application/sql' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message || 'Download failed' }
  }
}
