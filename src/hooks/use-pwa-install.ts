'use client'

import { useEffect, useState, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Hook untuk trigger install PWA secara manual.
 * Defensive: semua window access di-guard dengan try/catch.
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Cek standalone mode (defer setState agar tidak trigger cascading render)
    try {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        // @ts-expect-error iOS Safari
        window.navigator.standalone === true
      // Defer ke microtask agar tidak synchronous setState in effect
      Promise.resolve().then(() => setIsInstalled(standalone))
    } catch {
      // ignore
    }

    const handler = (e: Event) => {
      try {
        e.preventDefault()
        setDeferredPrompt(e as BeforeInstallPromptEvent)
      } catch {
        // ignore
      }
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false
    try {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      setDeferredPrompt(null)
      return choice.outcome === 'accepted'
    } catch {
      return false
    }
  }, [deferredPrompt])

  return {
    canInstall: !!deferredPrompt,
    isInstalled,
    promptInstall,
  }
}
