import { useState, useEffect, useRef } from 'react'
import { Bike } from 'lucide-react'
import { getUploadUrl, isUploadPath } from '@/lib/uploadApi'

interface ModelImageProps {
  imageUrl?: string | null
  alt: string
  className?: string
  style?: React.CSSProperties
}

/** Renders model image - supports external URL or upload/ path */
export function ModelImage({ imageUrl, alt, className, style }: ModelImageProps) {
  const [url, setUrl] = useState<string | null>(null)
  const blobRef = useRef<string | null>(null)

  useEffect(() => {
    if (!imageUrl) {
      setUrl(null)
      return
    }
    if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) {
      setUrl(imageUrl)
      return
    }
    if (isUploadPath(imageUrl)) {
      getUploadUrl(imageUrl).then((u) => {
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
  }, [imageUrl])

  if (!imageUrl) {
    return (
      <div className={`d-flex align-items-center justify-content-center ${className || ''}`} style={{ ...style, backgroundColor: '#f0f0f0' }}>
        <Bike size={48} className="text-muted" />
      </div>
    )
  }

  if (url) {
    return <img src={url} alt={alt} className={className} style={style} />
  }

  return (
    <div className={`d-flex align-items-center justify-content-center ${className || ''}`} style={{ ...style, backgroundColor: '#f0f0f0' }}>
      <Bike size={48} className="text-muted" />
    </div>
  )
}
