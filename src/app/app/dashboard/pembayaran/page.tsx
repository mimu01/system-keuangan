'use client'

import { useQuery } from '@tanstack/react-query'
import {
  ExternalLink,
  ReceiptText,
  Wallet,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/admin/status-badge'
import {
  formatRupiah,
  formatTanggalSingkat,
  LABEL_METODE,
} from '@/lib/types'

interface PembayaranItem {
  id: string
  kodeTransaksi: string
  jumlah: number
  metode: string
  status: string
  tanggalBayar: string
  keterangan: string | null
  buktiPembayaran: string | null
  tagihan: {
    id: string
    periode: string
    jenisPembayaran: { nama: string; kategori: string }
  }
}

export default function PembayaranPage() {
  const { data, isLoading } = useQuery<PembayaranItem[]>({
    queryKey: ['wali-pembayaran'],
    queryFn: async () => {
      const res = await fetch('/api/wali/pembayaran')
      if (!res.ok) throw new Error('Gagal memuat pembayaran')
      const json = await res.json()
      return json.data as PembayaranItem[]
    },
  })

  const totalBerhasil =
    data?.filter((p) => p.status === 'BERHASIL').reduce((s, p) => s + p.jumlah, 0) ?? 0
  const totalTransaksi =
    data?.filter((p) => p.status === 'BERHASIL').length ?? 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Riwayat Pembayaran</h1>
        <p className="text-sm text-muted-foreground">
          Semua pembayaran yang telah dilakukan
        </p>
      </div>

      {/* Summary card */}
      <div>
        {isLoading ? (
          <Skeleton className="h-32 rounded-3xl" />
        ) : (
          <div className="relative overflow-hidden rounded-3xl gradient-emerald p-5 text-white shadow-lg shadow-emerald-600/20">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">Total Pembayaran Berhasil</p>
                  <p className="mt-1 text-3xl font-extrabold tracking-tight">
                    {formatRupiah(totalBerhasil)}
                  </p>
                </div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                  <Wallet className="size-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-white/80">
                <ReceiptText className="size-3.5" />
                <span>{totalTransaksi} transaksi berhasil</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))
        ) : data && data.length > 0 ? (
          data.map((p, i) => (
            <div key={p.id}>
              <PembayaranCard pembayaran={p} />
            </div>
          ))
        ) : (
          <Card className="p-8 text-center">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Wallet className="size-7" />
            </div>
            <p className="text-sm font-semibold">Belum ada pembayaran</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Riwayat pembayaran akan muncul di sini
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}

function PembayaranCard({ pembayaran }: { pembayaran: PembayaranItem }) {
  return (
    <Card className="p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] text-muted-foreground">
            {pembayaran.kodeTransaksi}
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold">
            {pembayaran.tagihan.jenisPembayaran.nama}
          </p>
          <p className="text-xs text-muted-foreground">
            Periode {pembayaran.tagihan.periode}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {LABEL_METODE[pembayaran.metode as keyof typeof LABEL_METODE] ?? pembayaran.metode}{' '}
            · {formatTanggalSingkat(pembayaran.tanggalBayar)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {formatRupiah(pembayaran.jumlah)}
          </span>
          <StatusBadge value={pembayaran.status} />
        </div>
      </div>

      {pembayaran.buktiPembayaran && (
        <a
          href={pembayaran.buktiPembayaran}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-[11px] font-medium text-emerald-600 transition-colors hover:bg-accent dark:text-emerald-400"
        >
          <ExternalLink className="size-3" />
          Lihat Bukti
        </a>
      )}
    </Card>
  )
}
