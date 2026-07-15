'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock,
  ReceiptText,
  TrendingDown,
  Wallet,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/admin/status-badge'
import {
  formatRupiah,
  formatTanggalSingkat,
  LABEL_METODE,
  LABEL_STATUS_TAGIHAN,
} from '@/lib/types'

interface DashboardData {
  siswa: {
    id: string
    nama: string
    nis: string
    kelas: string
    foto: string | null
  }
  stats: {
    totalTagihan: number
    tagihanLunas: number
    tagihanBelumBayar: number
    tagihanSebagian: number
    totalTunggakan: number
    totalSudahDibayar: number
    notifikasiBelumDibaca: number
  }
  pembayaranRecent: {
    id: string
    kodeTransaksi: string
    jumlah: number
    metode: string
    status: string
    tanggalBayar: string
    tagihan: { jenisPembayaran: { nama: string }; periode: string }
  }[]
  jatuhTempoTerdekat: {
    id: string
    periode: string
    jumlah: number
    jumlahDibayar: number
    tanggalJatuhTempo: string
    status: string
    jenisPembayaran: { nama: string }
  }[]
}

export default function WaliDashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['wali-dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/wali/dashboard')
      if (!res.ok) throw new Error('Gagal memuat dashboard')
      return res.json()
    },
  })

  const tunggakan = data?.stats.totalTunggakan ?? 0
  const sudahBayar = data?.stats.totalSudahDibayar ?? 0

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <p className="text-sm text-muted-foreground">Selamat Datang,</p>
        <h1 className="text-xl font-bold tracking-tight">
          {data?.siswa.nama ?? '...'}
        </h1>
        <p className="text-xs text-muted-foreground">
          {data?.siswa.kelas ? `Kelas ${data.siswa.kelas}` : ''} · NIS {data?.siswa.nis ?? ''}
        </p>
      </div>

      {/* Tunggakan card (hero) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {isLoading ? (
          <Skeleton className="h-36 rounded-3xl" />
        ) : (
          <div className="relative overflow-hidden rounded-3xl gradient-emerald p-5 text-white shadow-lg shadow-emerald-600/20">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">Total Tunggakan</p>
                  <p className="mt-1 text-3xl font-extrabold tracking-tight">
                    {formatRupiah(tunggakan)}
                  </p>
                </div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                  <Wallet className="size-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5" />
                  <span>{data?.stats.tagihanLunas ?? 0} lunas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  <span>
                    {(data?.stats.tagihanBelumBayar ?? 0) + (data?.stats.tagihanSebagian ?? 0)} belum bayar
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatMini
          icon={<TrendingDown className="size-4" />}
          label="Sudah Dibayar"
          value={isLoading ? null : formatRupiah(sudahBayar)}
          color="text-emerald-600 dark:text-emerald-400"
          bg="bg-emerald-500/10"
        />
        <StatMini
          icon={<ReceiptText className="size-4" />}
          label="Total Tagihan"
          value={isLoading ? null : String(data?.stats.totalTagihan ?? 0)}
          color="text-amber-600 dark:text-amber-400"
          bg="bg-amber-500/10"
        />
      </div>

      {/* Jatuh tempo terdekat */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <CalendarClock className="size-4 text-muted-foreground" />
            Tagihan Jatuh Tempo
          </h2>
          <Link
            href="/app/dashboard/tagihan"
            className="text-xs font-medium text-emerald-600 dark:text-emerald-400"
          >
            Lihat Semua
          </Link>
        </div>
        <div className="space-y-2.5">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))
          ) : data?.jatuhTempoTerdekat?.length ? (
            data.jatuhTempoTerdekat.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="flex items-center justify-between gap-3 p-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {t.jenisPembayaran.nama}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Periode {t.periode} · Jatuh tempo {formatTanggalSingkat(t.tanggalJatuhTempo)}
                    </p>
                    <div className="mt-1.5">
                      <StatusBadge
                        value={t.status}
                        label={LABEL_STATUS_TAGIHAN[t.status as keyof typeof LABEL_STATUS_TAGIHAN]}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatRupiah(t.jumlah - t.jumlahDibayar)}</p>
                    <p className="text-[10px] text-muted-foreground">sisa tagihan</p>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="p-6 text-center">
              <CheckCircle2 className="mx-auto mb-2 size-8 text-emerald-500" />
              <p className="text-sm font-medium">Tidak ada tagihan tertunggak</p>
              <p className="text-xs text-muted-foreground">Semua tagihan sudah lunas</p>
            </Card>
          )}
        </div>
      </section>

      {/* Pembayaran terbaru */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Wallet className="size-4 text-muted-foreground" />
            Pembayaran Terbaru
          </h2>
          <Link
            href="/app/dashboard/pembayaran"
            className="text-xs font-medium text-emerald-600 dark:text-emerald-400"
          >
            Riwayat
          </Link>
        </div>
        <div className="space-y-2.5">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))
          ) : data?.pembayaranRecent?.length ? (
            data.pembayaranRecent.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="flex items-center justify-between gap-3 p-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {p.tagihan.jenisPembayaran.nama}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {LABEL_METODE[p.metode as keyof typeof LABEL_METODE] ?? p.metode} ·{' '}
                      {formatTanggalSingkat(p.tanggalBayar)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(p.jumlah)}
                    </span>
                    <StatusBadge value={p.status} />
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              Belum ada pembayaran
            </Card>
          )}
        </div>
      </section>

      {/* Quick link profil anak */}
      <Link href="/app/dashboard/profil-anak">
        <Card className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-accent">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ReceiptText className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Profil Anak</p>
              <p className="text-xs text-muted-foreground">Lihat data lengkap siswa</p>
            </div>
          </div>
          <ArrowRight className="size-4 text-muted-foreground" />
        </Card>
      </Link>
    </div>
  )
}

function StatMini({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode
  label: string
  value: string | null
  color: string
  bg: string
}) {
  return (
    <Card className="p-4">
      <div className={`mb-2 flex size-8 items-center justify-center rounded-lg ${bg} ${color}`}>
        {icon}
      </div>
      <p className="text-lg font-bold leading-tight">
        {value ?? <Skeleton className="h-5 w-16" />}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  )
}
