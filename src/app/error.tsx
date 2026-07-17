'use client'

import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

/**
 * error.tsx — Next.js App Router error boundary untuk route level.
 * Menangkap error di halaman manapun (admin/wali) tanpa crash seluruh app.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Page error:', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="size-8" />
        </div>
        <h1 className="mb-2 text-lg font-bold">Halaman Tidak Dapat Dimuat</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Terjadi kesalahan saat memuat halaman. Coba lagi atau kembali ke
          beranda.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => reset()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-emerald px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg active:scale-95"
          >
            <RefreshCw className="size-4" />
            Coba Lagi
          </button>
          <Link
            href="/app/dashboard"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-accent"
          >
            <Home className="size-4" />
            Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
