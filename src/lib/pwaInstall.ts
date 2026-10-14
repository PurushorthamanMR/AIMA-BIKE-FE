/**
 * PWA install state - captures the browser's `beforeinstallprompt` event as early as possible
 * so both the Header "Install App" button and the install popup can trigger it.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface PwaInstallState {
  /** Native install prompt is available (Chrome / Edge / Android) */
  canPrompt: boolean
  /** App already running as installed app */
  isInstalled: boolean
  /** iOS Safari - no prompt API, user must use Share → Add to Home Screen */
  isIos: boolean
}

let deferredPrompt: BeforeInstallPromptEvent | null = null
const listeners = new Set<() => void>()

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true

const isIosDevice = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

let state: PwaInstallState = {
  canPrompt: false,
  isInstalled: isStandalone(),
  isIos: isIosDevice(),
}

function setState(next: Partial<PwaInstallState>) {
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e as BeforeInstallPromptEvent
  setState({ canPrompt: true })
})

window.addEventListener('appinstalled', () => {
  deferredPrompt = null
  setState({ canPrompt: false, isInstalled: true })
})

export function subscribePwaInstall(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getPwaInstallState() {
  return state
}

/** Shows the native install dialog. Returns true if the user accepted. */
export async function promptPwaInstall(): Promise<boolean> {
  if (!deferredPrompt) return false
  const promptEvent = deferredPrompt
  deferredPrompt = null
  setState({ canPrompt: false })
  await promptEvent.prompt()
  const { outcome } = await promptEvent.userChoice
  return outcome === 'accepted'
}

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('Service worker registration failed:', err)
    })
  })
}

const OPEN_DIALOG_EVENT = 'aima:open-install-dialog'

/** Opens the install popup (used for iOS manual instructions) */
export function openInstallDialog() {
  window.dispatchEvent(new Event(OPEN_DIALOG_EVENT))
}

export function onOpenInstallDialog(handler: () => void) {
  window.addEventListener(OPEN_DIALOG_EVENT, handler)
  return () => window.removeEventListener(OPEN_DIALOG_EVENT, handler)
}
