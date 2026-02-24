/**
 * Upload store - saves files to IndexedDB (simulates upload/ folder).
 * Path format: upload/cash/xxx or upload/lease/xxx
 * Used for POS uploads and Customer detail view.
 */

const DB_NAME = 'aima_upload_db'
const STORE_NAME = 'uploads'
const DB_VERSION = 1

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'path' })
      }
    }
  })
}

/** Save file to upload store. Returns path like upload/cash/1234567890_copyOfNic */
export async function saveToUpload(
  file: File,
  subfolder: 'cash' | 'lease' | 'bike-models',
  fieldName: string
): Promise<{ success: boolean; path?: string; error?: string }> {
  const MAX_MB = 4
  if (file.size > MAX_MB * 1024 * 1024) {
    return { success: false, error: `File too large (max ${MAX_MB}MB)` }
  }
  const allowed = /\.(jpg|jpeg|png|gif|webp|pdf)$/i
  if (!allowed.test(file.name)) {
    return { success: false, error: 'Only images (jpg, png, gif, webp) and PDF allowed' }
  }

  const path = `upload/${subfolder}/${Date.now()}_${fieldName}`
  try {
    const db = await openDb()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.put({ path, blob: file, name: file.name })
      tx.oncomplete = () => {
        db.close()
        resolve({ success: true, path })
      }
      tx.onerror = () => {
        db.close()
        resolve({ success: false, error: 'Failed to save' })
      }
    })
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

/** Get file URL for display. Returns blob URL or null. */
export async function getUploadUrl(path: string): Promise<string | null> {
  if (!path || !path.startsWith('upload/')) return null
  try {
    const db = await openDb()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(path)
      req.onsuccess = () => {
        db.close()
        const row = req.result
        if (row?.blob) {
          resolve(URL.createObjectURL(row.blob))
        } else {
          resolve(null)
        }
      }
      req.onerror = () => {
        db.close()
        resolve(null)
      }
    })
  } catch {
    return null
  }
}

/** Check if path is from our upload store */
export function isUploadPath(path: string): boolean {
  return !!path && path.startsWith('upload/')
}
