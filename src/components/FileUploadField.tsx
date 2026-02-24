import { useState, useRef, useEffect } from 'react'
import { Upload, Check, Loader2 } from 'lucide-react'
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
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = async (file: File) => {
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
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    await processFile(file!)
    e.target.value = ''
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) await processFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
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
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={uploading}
        className="d-none"
        id={`upload-${label.replace(/\s/g, '-')}`}
      />
      <div
        role="button"
        tabIndex={0}
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border rounded-2 p-3 text-center transition-all ${
          isDragging ? 'border-primary bg-primary bg-opacity-10' : 'border-2 border-dashed'
        } ${uploading ? 'opacity-75' : ''}`}
        style={{ minHeight: 80, cursor: uploading ? 'not-allowed' : 'pointer' }}
      >
        {uploading ? (
          <div className="d-flex align-items-center justify-content-center gap-2 text-muted">
            <Loader2 size={20} className="animate-spin" />
            <span>Uploading...</span>
          </div>
        ) : value ? (
          <div className="d-flex flex-column align-items-center gap-1">
            <span className="text-success d-flex align-items-center gap-1">
              <Check size={18} />
              Uploaded
            </span>
            {displayUrl && (
              <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="small text-primary" onClick={(e) => e.stopPropagation()}>
                View file
              </a>
            )}
            <button type="button" className="btn btn-link btn-sm text-danger p-0 mt-1" onClick={handleClear}>
              Clear
            </button>
          </div>
        ) : (
          <div className="d-flex flex-column align-items-center gap-1 text-muted">
            <Upload size={24} />
            <span>Drag and drop or click to upload</span>
          </div>
        )}
      </div>
      {error && <small className="text-danger d-block mt-1">{error}</small>}
    </div>
  )
}
