'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  ReceiptText,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/admin/status-badge'
import {
  formatRupiah,
  formatTanggalSingkat,
  LABEL_METODE,
  LABEL_STATUS_PEMBAYARAN,
  LABEL_STATUS_TAGIHAN,
  type StatusTagihan,
} from '@/lib/types'
import { cn } from '@/lib/utils'

interface TagihanPembayaran {
  id: string
  jumlah: number
  metode: string
  status: string
  tanggalBayar: string
  kodeTransaksi: string
}

interface TagihanItem {
  id: string
  periode: string
  jumlah: number
  jumlahDibayar: number
  tanggalJatuhTempo: string
  status: StatusTagihan
  keterangan: string | null
  tahunAjaran: { nama: string }
  jenisPembayaran: { id: string; nama: string; kategori: string; frekuensi: string }
  pembayaran: TagihanPembayaran[]
}

type FilterStatus = 'all' | StatusTagihan

const FILTERS: { label: string; value: FilterStatus }[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Lunas', value: 'LUNAS' },
  { label: 'Belum Bayar', value: 'BELUM_BAYAR' },
  { label: 'Sebagian', value: 'SEBAGIAN' },
]

const FILTER_EMPTY_MESSAGE: Record<FilterStatus, string> = {
  all: 'Belum ada tagihan untuk anak Anda',
  LUNAS: 'Belum ada tagihan yang berstatus lunas',
  BELUM_BAYAR: 'Tidak ada tagihan belum dibayar',
  SEBAGIAN: 'Tidak ada tagihan berstatus sebagian',
}

export default function TagihanPage() {
  const [filter, setFilter] = useState<FilterStatus>('all')

  const { data, isLoading } = useQuery<TagihanItem[]>({
    queryKey: ['wali-tagihan', filter],
    queryFn: async () => {
      const res = await fetch(`/api/wali/tagihan?status=${filter}`)
      if (!res.ok) throw new Error('Gagal memuat tagihan')
      const json = await res.json()
      return json.data as TagihanItem[]
    },
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Tagihan</h1>
        <p className="text-sm text-muted-foreground">
          Daftar tagihan sekolah anak Anda
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => {
          const active = filter === f.value
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
                active
                  ? 'gradient-emerald text-white shadow-sm shadow-emerald-600/20'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              )}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))
        ) : data && data.length > 0 ? (
          data.map((t, i) => (
            <div key={t.id}>
              <TagihanCard tagihan={t} />
            </div>
          ))
        ) : (
          <Card className="p-8 text-center">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-7" />
            </div>
            <p className="text-sm font-semibold">Tidak ada tagihan</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {filter ? FILTER_EMPTY_MESSAGE[filter] : ''}
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}

function TagihanCard({ tagihan }: { tagihan: TagihanItem }) {
  const [open, setOpen] = useState(false)
  const persen =
    tagihan.jumlah > 0
      ? Math.min(100, Math.round((tagihan.jumlahDibayar / tagihan.jumlah) * 100))
      : 0
  const hasPembayaran = tagihan.pembayaran.length > 0

  return (
    <Card className="overflow-hidden p-4">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ReceiptText className="size-4" />
            </div>
            <p className="truncate text-sm font-semibold">
              {tagihan.jenisPembayaran.nama}
            </p>
          </div>
        </div>
        <StatusBadge
          value={tagihan.status}
          label={LABEL_STATUS_TAGIHAN[tagihan.status]}
        />
      </div>

      {/* Periode & jatuh tempo */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>Periode {tagihan.periode}</span>
        <span className="flex items-center gap-1">
          <Clock className="size-3" />
          Jatuh tempo {formatTanggalSingkat(tagihan.tanggalJatuhTempo)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full gradient-emerald transition-all duration-500"
            style={{ width: `${persen}%` }}
          />
        </div>
      </div>

      {/* Bottom row */}
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Dibayar {formatRupiah(tagihan.jumlahDibayar)}
        </span>
        <span className="font-bold">Total {formatRupiah(tagihan.jumlah)}</span>
      </div>

      {/* Payment history */}
      {hasPembayaran && (
        <Collapsible open={open} onOpenChange={setOpen} className="mt-3 border-t pt-2">
          <CollapsibleTrigger className="flex w-full items-center justify-between text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span>Riwayat Pembayaran ({tagihan.pembayaran.length})</span>
            <ChevronDown
              className={cn(
                'size-4 transition-transform duration-200',
                open && 'rotate-180'
              )}
            />
          </CollapsibleTrigger>
            {open && (
              <div className="overflow-hidden">
                <div className="mt-2 space-y-1.5">
                  {tagihan.pembayaran.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg bg-muted/50 px-2.5 py-1.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-mono text-[10px] text-muted-foreground">
                          {p.kodeTransaksi}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {LABEL_METODE[p.metode as keyof typeof LABEL_METODE] ?? p.metode} ·{' '}
                          {formatTanggalSingkat(p.tanggalBayar)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-xs font-semibold">
                          {formatRupiah(p.jumlah)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {LABEL_STATUS_PEMBAYARAN[p.status as keyof typeof LABEL_STATUS_PEMBAYARAN] ?? p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </Collapsible>
      )}
    </Card>
  )
}
