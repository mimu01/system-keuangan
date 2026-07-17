'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'

/**
 * global-error.tsx — Next.js App Router root error boundary.
 * Menangkap error fatal yang tidak tertangkap ErrorBoundary biasa
 * (mis. error di root layout). WAJIB punya <html> dan <body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="id">
      <body className="bg-background text-foreground">
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-6 dark:from-emerald-950/30 dark:to-teal-950/30">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-8" />
            </div>
            <h1 className="mb-2 text-lg font-bold">
              Aplikasi Mengalami Kendala
            </h1>
            <p className="mb-6 text-sm text-muted-foreground">
              Terjadi kesalahan teknis. Silakan coba muat ulang. Jika masalah
              berlanjut, hubungi sekolah.
            </p>
            <button
              onClick={() => reset()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg active:scale-95"
            >
              <RefreshCw className="size-4" />
              Muat Ulang
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
