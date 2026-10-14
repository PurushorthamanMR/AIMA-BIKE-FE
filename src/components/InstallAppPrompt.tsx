import { useEffect, useState } from 'react'
import { Download, Share, SquarePlus, X } from 'lucide-react'
import { usePwaInstall } from '@/hooks/usePwaInstall'
import { onOpenInstallDialog } from '@/lib/pwaInstall'

const SNOOZE_KEY = 'aima_install_prompt_snoozed_until'
const SNOOZE_DAYS = 3

function isSnoozed() {
  try {
    return Number(localStorage.getItem(SNOOZE_KEY) || 0) > Date.now()
  } catch {
    return false
  }
}

function snooze() {
  try {
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000))
  } catch {
    // ignore storage errors
  }
}

export default function InstallAppPrompt() {
  const { canInstall, canPrompt, isIos, install } = usePwaInstall()
  const [open, setOpen] = useState(false)

  // Auto-show once the app becomes installable (unless user chose "Not now" recently)
  useEffect(() => {
    if (!canInstall || isSnoozed()) return
    const timer = setTimeout(() => setOpen(true), 1500)
    return () => clearTimeout(timer)
  }, [canInstall])

  // Header "Install App" button can open it any time
  useEffect(() => onOpenInstallDialog(() => setOpen(true)), [])

  if (!open || !canInstall) return null

  const handleNotNow = () => {
    snooze()
    setOpen(false)
  }

  const handleInstall = async () => {
    setOpen(false)
    await install()
  }

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ background: 'rgba(15, 23, 42, 0.5)', zIndex: 2000 }}
      onClick={handleNotNow}
    >
      <div
        className="bg-white rounded-4 shadow-lg p-4 position-relative text-center"
        style={{ width: '100%', maxWidth: 380 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-app-title"
      >
        <button
          type="button"
          className="btn btn-sm position-absolute top-0 end-0 m-2"
          onClick={handleNotNow}
          aria-label="Close"
          style={{ color: 'var(--aima-muted)' }}
        >
          <X size={18} />
        </button>

        <img
          src="/icons/icon-192.png"
          alt="AIMA"
          width={72}
          height={72}
          className="mb-3"
          style={{ borderRadius: '50%' }}
        />
        <h5 id="install-app-title" className="fw-bold mb-2" style={{ color: 'var(--aima-secondary)' }}>
          Install AIMA App
        </h5>

        {canPrompt ? (
          <p className="mb-4" style={{ color: 'var(--aima-muted)', fontSize: '0.9rem' }}>
            Install the app on your device for quick access, full-screen view and a faster experience.
          </p>
        ) : isIos ? (
          <div className="mb-4 text-start" style={{ color: 'var(--aima-muted)', fontSize: '0.9rem' }}>
            <p className="mb-2">To install on your iPhone / iPad:</p>
            <div className="d-flex align-items-center gap-2 mb-1">
              1. Tap <Share size={16} style={{ color: 'var(--aima-info)' }} /> <strong>Share</strong> in Safari
            </div>
            <div className="d-flex align-items-center gap-2">
              2. Tap <SquarePlus size={16} /> <strong>Add to Home Screen</strong>
            </div>
          </div>
        ) : null}

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn flex-fill"
            onClick={handleNotNow}
            style={{ border: '1px solid var(--aima-border)', color: 'var(--aima-secondary)' }}
          >
            Not Now
          </button>
          {canPrompt && (
            <button
              type="button"
              className="btn flex-fill d-inline-flex align-items-center justify-content-center gap-2 text-white"
              onClick={handleInstall}
              style={{ background: 'var(--aima-primary)', border: 'none' }}
            >
              <Download size={16} />
              Install Now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
