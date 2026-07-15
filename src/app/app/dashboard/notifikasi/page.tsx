'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Bell,
  CalendarClock,
  CheckCircle2,
  ReceiptText,
  type LucideIcon,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatTanggalSingkat, type TipeNotifikasi } from '@/lib/types'
import { cn } from '@/lib/utils'

interface NotifikasiItem {
  id: string
  judul: string
  pesan: string
  tipe: TipeNotifikasi
  penerima: string
  dibaca: boolean
  createdAt: string
}

const TIPE_CONFIG: Record<
  TipeNotifikasi,
  { icon: LucideIcon; bg: string; color: string }
> = {
  TAGIHAN_BARU: {
    icon: ReceiptText,
    bg: 'bg-amber-500/10',
    color: 'text-amber-600 dark:text-amber-400',
  },
  PEMBAYARAN_BERHASIL: {
    icon: CheckCircle2,
    bg: 'bg-emerald-500/10',
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  PENGUMUMAN: {
    icon: Bell,
    bg: 'bg-sky-500/10',
    color: 'text-sky-600 dark:text-sky-400',
  },
  JATUH_TEMPO: {
    icon: CalendarClock,
    bg: 'bg-rose-500/10',
    color: 'text-rose-600 dark:text-rose-400',
  },
}

export default function NotifikasiPage() {
  const { data, isLoading } = useQuery<NotifikasiItem[]>({
    queryKey: ['wali-notifikasi'],
    queryFn: async () => {
      const res = await fetch('/api/wali/notifikasi')
      if (!res.ok) throw new Error('Gagal memuat notifikasi')
      const json = await res.json()
      return json.data as NotifikasiItem[]
    },
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Notifikasi</h1>
        <p className="text-sm text-muted-foreground">
          Pemberitahuan dari sekolah
        </p>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))
        ) : data && data.length > 0 ? (
          data.map((n, i) => {
            const cfg = TIPE_CONFIG[n.tipe] ?? TIPE_CONFIG.PENGUMUMAN
            const Icon = cfg.icon
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className={cn(
                    'relative flex gap-3 overflow-hidden p-3.5',
                    !n.dibaca && 'border-l-4 border-l-emerald-500'
                  )}
                >
                  <div
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-xl',
                      cfg.bg,
                      cfg.color
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-tight">
                        {n.judul}
                      </p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {formatTanggalSingkat(n.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {n.pesan}
                    </p>
                  </div>
                  {!n.dibaca && (
                    <span className="absolute right-2 top-2 size-2 rounded-full bg-emerald-500" />
                  )}
                </Card>
              </motion.div>
            )
          })
        ) : (
          <Card className="p-8 text-center">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Bell className="size-7" />
            </div>
            <p className="text-sm font-semibold">Belum ada notifikasi</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Pemberitahuan dari sekolah akan muncul di sini
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
