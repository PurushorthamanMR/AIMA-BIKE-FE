import { useSyncExternalStore } from 'react'
import { getPwaInstallState, promptPwaInstall, subscribePwaInstall } from '@/lib/pwaInstall'

export function usePwaInstall() {
  const state = useSyncExternalStore(subscribePwaInstall, getPwaInstallState)
  return {
    ...state,
    /** Show Install button: not installed and either native prompt or iOS manual steps are possible */
    canInstall: !state.isInstalled && (state.canPrompt || state.isIos),
    install: promptPwaInstall,
  }
}
