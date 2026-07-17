'use client'

import { useEffect } from 'react'

/**
 * Global ChunkLoadError handler.
 *
 * Saat Vercel deploy versi baru, chunk hash berubah. Jika browser masih
 * punya HTML lama (dari cache browser), HTML itu reference chunk lama
 * yang sudah 404 di server baru → ChunkLoadError → app blank.
 *
 * Fix: tangkap error chunk load, reload halaman (browser akan fetch
 * HTML fresh dari server → dapat chunk hash baru → load sukses).
 *
 * Guard: hanya reload sekali per session (flag di sessionStorage)
 * untuk mencegah infinite loop jika memang ada bug lain.
 */
export function ChunkErrorHandler() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const RELOAD_FLAG = 'chunk-error-reloaded'

    const isChunkError = (message: string): boolean => {
      if (!message) return false
      const msg = message.toLowerCase()
      return (
        msg.includes('loading chunk') ||
        msg.includes('loading css chunk') ||
        msg.includes('failed to fetch dynamically imported module') ||
        msg.includes('importing a module script failed') ||
        msg.includes('chunkloaderror') ||
        // Ketika chunk 404, server return HTML (404 page) bukan JS → SyntaxError
        (msg.includes('unexpected token') && msg.includes('<'))
      )
    }

    const handleChunkError = (event: ErrorEvent) => {
      const message = event?.message || event?.error?.message || ''
      if (!isChunkError(message)) return

      // Cek flag — hanya reload sekali per session
      try {
        if (sessionStorage.getItem(RELOAD_FLAG)) return
        sessionStorage.setItem(RELOAD_FLAG, '1')
      } catch {
        // sessionStorage unavailable, proceed anyway
      }

      console.warn('Chunk load error detected, reloading page...', message)
      // Hard reload (bypass cache) untuk dapat HTML + chunk fresh
      window.location.reload()
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event?.reason?.message || String(event?.reason || '')
      if (!isChunkError(message)) return

      try {
        if (sessionStorage.getItem(RELOAD_FLAG)) return
        sessionStorage.setItem(RELOAD_FLAG, '1')
      } catch {
        // ignore
      }

      console.warn('Chunk load rejection detected, reloading page...', message)
      window.location.reload()
    }

    window.addEventListener('error', handleChunkError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleChunkError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
}
