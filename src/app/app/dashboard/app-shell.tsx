'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bell,
  GraduationCap,
  Home,
  LogOut,
  ReceiptText,
  User,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'
import { useQueryClient } from '@tanstack/react-query'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { label: 'Beranda', href: '/app/dashboard', icon: Home },
  { label: 'Tagihan', href: '/app/dashboard/tagihan', icon: ReceiptText },
  { label: 'Bayar', href: '/app/dashboard/pembayaran', icon: Wallet },
  { label: 'Notifikasi', href: '/app/dashboard/notifikasi', icon: Bell },
  { label: 'Profil', href: '/app/dashboard/profil', icon: User },
]

interface AppShellProps {
  wali: { id: string; nama: string; email: string }
  siswa: { id: string; nama: string; nis: string; kelas: string; foto: string | null }
  children: React.ReactNode
}

/**
 * AppShell untuk Wali Murid — mobile-first.
 *
 * Optimalisasi untuk HP lama (Android 8.1):
 * - TANPA Framer Motion (ganti CSS transition yang ringan)
 * - TANPA AnimatePresence (bisa hang saat navigasi di browser lama)
 * - TANPA layoutId shared animation (berat, pakai ResizeObserver)
 * - TANPA backdrop-filter berlebihan (bisa lambat di GPU lama)
 * - Opacity modifier dikurangi (kurangi color-mix yang butuh polyfill)
 */
export function AppShell({ wali, siswa, children }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const queryClient = useQueryClient()

  // Realtime: invalidate HANYA query wali yang relevan per event
  useRealtime(
    [
      'dashboard:refresh',
      'pembayaran:created',
      'pembayaran:updated',
      'tagihan:created',
      'tagihan:updated',
      'notifikasi:new',
    ],
    (event) => {
      switch (event) {
        case 'pembayaran:created':
        case 'pembayaran:updated':
          queryClient.invalidateQueries({ queryKey: ['wali-dashboard'] })
          queryClient.invalidateQueries({ queryKey: ['wali-pembayaran'] })
          queryClient.invalidateQueries({ queryKey: ['wali-tagihan'] })
          break
        case 'tagihan:created':
        case 'tagihan:updated':
          queryClient.invalidateQueries({ queryKey: ['wali-tagihan'] })
          queryClient.invalidateQueries({ queryKey: ['wali-dashboard'] })
          break
        case 'notifikasi:new':
          queryClient.invalidateQueries({ queryKey: ['wali-notifikasi'] })
          break
        case 'dashboard:refresh':
          queryClient.invalidateQueries({ queryKey: ['wali-dashboard'] })
          break
      }
      if (event === 'pembayaran:created') {
        toast.success('Pembayaran baru diterima', {
          description: 'Data pembayaran Anda telah diperbarui',
        })
      } else if (event === 'notifikasi:new') {
        toast.info('Notifikasi baru', {
          description: 'Anda memiliki pemberitahuan baru',
        })
      }
    }
  )

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/wali/auth/logout', { method: 'POST' })
      toast.success('Berhasil keluar')
      router.push('/app')
      router.refresh()
    } catch {
      toast.error('Gagal keluar')
    } finally {
      setLoggingOut(false)
    }
  }

  const isActive = (href: string) =>
    href === '/app/dashboard'
      ? pathname === href
      : pathname.startsWith(href)

  return (
    <div className="min-h-screen bg-muted">
      {/* App container — mobile-first, centered max-width untuk tablet/desktop */}
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background shadow-xl">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-background px-4">
          <Link href="/app/dashboard" className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg gradient-emerald text-white">
              <GraduationCap className="size-4" />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-xs font-semibold">{siswa.nama}</p>
              <p className="truncate text-[10px] text-muted-foreground">
                Kelas {siswa.kelas}
              </p>
            </div>
          </Link>
          <ThemeToggle />
        </header>

        {/* Page content — tanpa animation (CSS transition saja) */}
        <main className="flex-1 overflow-x-hidden pb-20">
          <div className="p-4">{children}</div>
        </main>

        {/* Bottom Navigation — tanpa layoutId animation */}
        <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md border-t border-border bg-background">
          <div className="flex items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-colors',
                    active ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                  )}
                >
                  {active && (
                    <span className="absolute inset-x-2 inset-y-1 -z-10 rounded-xl bg-emerald-500/10" />
                  )}
                  <Icon className="size-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
