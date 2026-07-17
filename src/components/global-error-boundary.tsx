'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Global Error Boundary — catch fatal React errors (mis. hydration mismatch,
  runtime crash) agar aplikasi tidak keluar sendiri / blank screen.
 * Tampilkan halaman error ramah pengguna dengan tombol reload.
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error untuk debugging (production: kirim ke Sentry/dll)
    console.error('Global error caught:', error, errorInfo)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-6 dark:from-emerald-950/30 dark:to-teal-950/30">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-8" />
            </div>
            <h1 className="mb-2 text-lg font-bold text-foreground">
              Terjadi Kesalahan
            </h1>
            <p className="mb-6 text-sm text-muted-foreground">
              Aplikasi mengalami kendala teknis. Silakan muat ulang halaman.
              Jika masalah berlanjut, hubungi sekolah.
            </p>
            <button
              onClick={this.handleReload}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-emerald px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg active:scale-95"
            >
              <RefreshCw className="size-4" />
              Muat Ulang
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
