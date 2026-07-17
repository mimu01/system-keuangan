'use client'

import { useEffect } from 'react'

/**
 * Registrasi Service Worker — minimal & aman.
 * - Hanya di production
 * - Tidak listen controllerchange (bisa cause infinite reload)
 * - Tidak detect update (biarkan SW activate sendiri via skipWaiting)
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
  }, [])

  return null
}
