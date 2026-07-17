'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

/**
 * Registrasi Service Worker.
 * - Hanya di production (di dev, SW bisa cache kode lama & bikin bingung)
 * - Tampilkan toast saat update tersedia
 */
export function RegisterSW() {
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    // Skip di development agar tidak cache kode yang sedang diubah
    if (process.env.NODE_ENV !== 'production') return

    let registration: ServiceWorkerRegistration | null = null

    const register = async () => {
      try {
        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        })

        // Deteksi update SW baru
        registration.addEventListener('updatefound', () => {
          const newWorker = registration?.installing
          if (!newWorker) return
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // Update tersedia
              setUpdateAvailable(true)
            }
          })
        })
      } catch (error) {
        console.error('Gagal registrasi service worker:', error)
      }
    }

    register()

    // Listen untuk pesan dari SW
    const handleControllerChange = () => {
      // Controller berubah (update aktif) — reload halaman
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
    }
  }, [])

  // Tampilkan toast saat update tersedia
  useEffect(() => {
    if (updateAvailable) {
      toast.info('Versi baru tersedia', {
        description: 'Memuat ulang untuk pembaruan...',
        duration: 3000,
        onDismiss: () => window.location.reload(),
        onAutoClose: () => window.location.reload(),
      })
    }
  }, [updateAvailable])

  return null
}
