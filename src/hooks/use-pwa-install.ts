'use client'

import { useEffect, useState, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Hook untuk trigger install PWA secara manual (mis. dari tombol "Pasang Aplikasi").
 * - `canInstall`: true jika browser support beforeinstallprompt (Android/Desktop Chrome)
 * - `isInstalled`: true jika app sudah berjalan dalam standalone mode
 * - `promptInstall()`: trigger dialog install
 *
 * iOS tidak support beforeinstallprompt — untuk iOS, gunakan komponen
 * InstallPrompt yang menampilkan instruksi manual.
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Cek apakah sudah terpasang (standalone mode)
    const checkInstalled = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        // @ts-expect-error iOS Safari
        window.navigator.standalone === true
      setIsInstalled(standalone)
    }
    checkInstalled()

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
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
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    return choice.outcome === 'accepted'
  }, [deferredPrompt])

  return {
    canInstall: !!deferredPrompt,
    isInstalled,
    promptInstall,
  }
}
