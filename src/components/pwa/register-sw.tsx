'use client'

import { useEffect } from 'react'

/**
 * Registrasi Service Worker — minimal & aman.
 * - Hanya di production
 * - SW v6 adalah pure passthrough (no fetch handler, no caching)
 * - Listen untuk SW_UPDATED message → reload halaman (dapat HTML fresh)
 */
export function RegisterSW() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    if (process.env.NODE_ENV !== 'production') return

    const register = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })
      } catch (error) {
        console.error('SW registration failed:', error)
      }
    }

    register()

    // Listen untuk SW_UPDATED message dari SW baru
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SW_UPDATED') {
        // SW baru aktif → reload untuk dapat HTML + chunk fresh
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
