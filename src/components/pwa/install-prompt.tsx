'use client'

import { useEffect, useState, useCallback } from 'react'
import { Download, X, Share, Plus, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'pwa-install-dismissed'
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 hari

function detectIOS() {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua)
  const isMacSafari = /Macintosh/.test(ua) && 'ontouchend' in document
  return isIOS || isMacSafari
}

function isStandalone() {
  if (typeof window === 'undefined') return false
  try {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true
    )
  } catch {
    return false
  }
}

/**
 * Install Prompt untuk PWA — defensive & minimal.
 * - Jangan tampilkan apa-apa di PWA standalone mode (sudah terpasang)
 * - Tidak pakai Framer Motion (kurangi risk crash di mobile)
 * - Tidak pakai AnimatePresence (bisa cause layout issue)
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (typeof window === 'undefined') return

    // Jangan tampilkan jika sudah terpasang sebagai app
    if (isStandalone()) return

    // Cek dismiss
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY)
      if (dismissed) {
        const dismissedTime = parseInt(dismissed, 10)
        if (Date.now() - dismissedTime < DISMISS_DURATION) return
      }
    } catch {
      // localStorage unavailable, ignore
    }

    const isIOS = detectIOS()

    if (isIOS) {
      const timer = setTimeout(() => setShowIOSGuide(true), 3000)
      return () => clearTimeout(timer)
    }

    const handler = (e: Event) => {
      try {
        e.preventDefault()
        setDeferredPrompt(e as BeforeInstallPromptEvent)
        setShowBanner(true)
      } catch {
        // ignore
      }
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [mounted])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    try {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        toast.success('Aplikasi berhasil dipasang!')
      }
    } catch {
      // ignore
    }
    setDeferredPrompt(null)
    setShowBanner(false)
  }, [deferredPrompt])

  const handleDismiss = useCallback(() => {
    setShowBanner(false)
    setShowIOSGuide(false)
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString())
    } catch {
      // ignore
    }
  }, [])

  if (!mounted) return null
  if (typeof window === 'undefined') return null
  // Jangan render apa-apa jika sudah standalone (PWA mode)
  if (isStandalone()) return null

  return (
    <>
      {/* Banner install untuk Android/Desktop — tanpa animation */}
      {showBanner && (
        <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md">
          <div className="glass-strong flex items-center gap-3 rounded-2xl border border-emerald-500/20 p-3 shadow-2xl">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl gradient-emerald text-white">
              <Download className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">Pasang Aplikasi</p>
              <p className="text-xs text-muted-foreground">
                Akses lebih cepat dari layar utama HP
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleInstall}
              className="gradient-emerald shrink-0 text-white"
            >
              Pasang
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleDismiss}
              className="size-8 shrink-0"
              aria-label="Tutup"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Guide install untuk iOS — tanpa animation */}
      {showIOSGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          onClick={handleDismiss}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-background p-6 shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl gradient-emerald text-white">
              <Smartphone className="size-8" />
            </div>
            <h3 className="mb-1 text-center text-lg font-bold">Pasang di iPhone</h3>
            <p className="mb-5 text-center text-sm text-muted-foreground">
              Ikuti langkah berikut untuk menambahkan aplikasi ke layar utama
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Share className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">1. Tombol Bagikan</p>
                  <p className="text-xs text-muted-foreground">
                    Ketuk tombol Bagikan di toolbar bawah Safari
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Plus className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">2. Tambah ke Layar Utama</p>
                  <p className="text-xs text-muted-foreground">
                    Pilih &quot;Tambah ke Layar Utama&quot; dari menu
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Download className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">3. Pasang</p>
                  <p className="text-xs text-muted-foreground">
                    Ketuk &quot;Tambah&quot; untuk memasang aplikasi
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={handleDismiss} className="mt-6 w-full gradient-emerald text-white">
              Mengerti
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
