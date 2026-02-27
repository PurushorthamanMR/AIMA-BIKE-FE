import { useState, useEffect } from 'react'
import { getUploadUrl } from '@/lib/uploadApi'

/**
 * Resolves logo path to a displayable URL.
 * If path starts with upload/, fetches blob URL from upload store; otherwise returns path (external URL).
 */
export function useResolvedLogoUrl(path: string | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!path || !path.trim()) {
      setUrl(null)
      return
    }
    if (path.startsWith('upload/')) {
      let cancelled = false
      getUploadUrl(path).then((resolved) => {
        if (!cancelled && resolved) setUrl(resolved)
      })
      return () => { cancelled = true }
    }
    setUrl(path.trim())
    return () => {}
  }, [path])

  return url
}
