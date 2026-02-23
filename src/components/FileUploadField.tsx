import { useState, useRef, useEffect } from 'react'
import { Upload, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadFile, getFileDisplayUrl, getUploadUrl } from '@/lib/uploadApi'

interface FileUploadFieldProps {
  label: string
  value: string
  onChange: (path: string) => void
  subfolder?: 'cash' | 'lease'
  fieldName: string
  accept?: string
}

export function FileUploadField({ label, value, onChange, subfolder = 'cash', fieldName, accept = 'image/*,.pdf' }: FileUploadFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    const result = await uploadFile(file, subfolder, fieldName)
    setUploading(false)
    if (result.success && result.path) {
      onChange(result.path)
    } else {
      setError(result.error || 'Upload failed')
    }
    e.target.value = ''
  }

  const handleClear = () => {
    onChange('')
    setError('')
  }

  const syncUrl = getFileDisplayUrl(value)
  const [asyncUrl, setAsyncUrl] = useState<string | null>(null)
  const blobUrlRef = useRef<string | null>(null)
  useEffect(() => {
    if (value && value.startsWith('upload/')) {
      getUploadUrl(value).then((url) => {
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = url
        setAsyncUrl(url || null)
      })
      return () => {
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current)
          blobUrlRef.current = null
        }
      }
    }
    setAsyncUrl(null)
  }, [value])
  const displayUrl = syncUrl || asyncUrl || ''

  return (
    <div className="col-md-6">
      <label className="form-label">{label}</label>
      <div className="d-flex align-items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={uploading}
          className="form-control d-none"
          id={`upload-${label.replace(/\s/g, '-')}`}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="d-flex align-items-center gap-1 shrink-0"
        >
          {uploading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={16} />
              {value ? 'Change' : 'Upload'}
            </>
          )}
        </Button>
        {value && (
          <>
            <span className="text-success small d-flex align-items-center gap-1">
              <Check size={14} />
              Uploaded
            </span>
            <button type="button" className="btn btn-link btn-sm text-danger p-0" onClick={handleClear}>
              Clear
            </button>
          </>
        )}
      </div>
      {displayUrl && (
        <div className="mt-1">
          <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="small text-primary">
            View file
          </a>
        </div>
      )}
      {error && <small className="text-danger d-block">{error}</small>}
    </div>
  )
}
