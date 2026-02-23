import { useState, useEffect, useRef } from 'react'
import { getUploadUrl, isUploadPath } from '@/lib/uploadApi'

interface UploadDisplayProps {
  path: string | null | undefined
  label: string
}

/** Shows uploaded image in Customer detail - from upload/ path or external URL */
export function UploadDisplay({ path, label }: UploadDisplayProps) {
  const [url, setUrl] = useState<string | null>(null)
  const blobRef = useRef<string | null>(null)

  useEffect(() => {
    if (!path) {
      setUrl(null)
      return
    }
    if (path.startsWith('http') || path.startsWith('data:')) {
      setUrl(path)
      return
    }
    if (isUploadPath(path)) {
      getUploadUrl(path).then((u) => {
        if (blobRef.current) URL.revokeObjectURL(blobRef.current)
        blobRef.current = u
        setUrl(u || null)
      })
      return () => {
        if (blobRef.current) {
          URL.revokeObjectURL(blobRef.current)
          blobRef.current = null
        }
      }
    }
    setUrl(null)
  }, [path])

  if (!path) return <div className="col-md-6"><strong>{label}:</strong> -</div>

  if (url) {
    const isPdf = path.toLowerCase().endsWith('.pdf')
    return (
      <div className="col-md-6 mb-2">
        <strong>{label}:</strong>
        <div className="mt-1">
          {isPdf ? (
            <a href={url} target="_blank" rel="noopener noreferrer" className="small text-primary">View PDF</a>
          ) : (
            <a href={url} target="_blank" rel="noopener noreferrer" className="d-block">
              <img src={url} alt={label} style={{ maxWidth: 200, maxHeight: 150, objectFit: 'contain', border: '1px solid #ddd', borderRadius: 4 }} />
            </a>
          )}
        </div>
      </div>
    )
  }

  return <div className="col-md-6"><strong>{label}:</strong> <span className="text-muted">Loading...</span></div>
}
