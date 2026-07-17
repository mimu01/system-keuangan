'use client'

import { useEffect } from 'react'

/**
 * Registrasi Service Worker — v7 self-unregister strategy.
 *
 * 1. Daftarkan SW v7 (yang akan unregister dirinya sendiri)
 * 2. Juga unregister dari sisi client (double insurance)
 * 3. Listen SW_UNREGISTERED message → reload (tanpa SW)
 *
 * Setelah ini, TIDAK ada SW yang aktif. Aplikasi jalan sebagai website biasa.
 */
export function RegisterSW() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    if (process.env.NODE_ENV !== 'production') return

    const cleanup = async () => {
      try {
        // Unregister SEMUA SW dari sisi client
        const registrations = await navigator.serviceWorker.getRegistrations()
        for (const reg of registrations) {
          await reg.unregister()
        }

        // Hapus semua cache
        if ('caches' in window) {
          const keys = await caches.keys()
          await Promise.all(keys.map((key) => caches.delete(key)))
        }

        // Daftarkan SW v7 (yang juga self-unregister)
        await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      } catch (error) {
        console.error('SW cleanup failed:', error)
      }
    }

    cleanup()

    // Listen untuk SW_UNREGISTERED message → reload
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SW_UNREGISTERED') {
        window.location.reload()
      }
    }
    navigator.serviceWorker.addEventListener('message', handleMessage)

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage)
    }
  }, [])

  return null
}
