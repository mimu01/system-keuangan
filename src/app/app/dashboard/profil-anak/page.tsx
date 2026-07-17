'use client'

import { useQuery } from '@tanstack/react-query'
import { GraduationCap, MapPin, User } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/admin/status-badge'
import {
  formatTanggal,
  LABEL_STATUS_SISWA,
  type JenisKelamin,
  type StatusSiswa,
} from '@/lib/types'

interface SiswaDetail {
  id: string
  nis: string
  nisn: string
  nama: string
  jenisKelamin: JenisKelamin
  tempatLahir: string | null
  tanggalLahir: string | null
  alamat: string | null
  foto: string | null
  status: StatusSiswa
  kelas: { id: string; nama: string; tingkat: number; waliKelas: string | null } | null
  tahunAjaran: { id: string; nama: string } | null
}

interface WaliInfo {
  id: string
  nama: string
  hubungan: string | null
}

interface SiswaResponse {
  siswa: SiswaDetail
  wali: WaliInfo
}

export default function ProfilAnakPage() {
  const { data, isLoading } = useQuery<SiswaResponse>({
    queryKey: ['wali-siswa'],
    queryFn: async () => {
      const res = await fetch('/api/wali/siswa')
      if (!res.ok) throw new Error('Gagal memuat profil siswa')
      return res.json()
    },
  })

  const siswa = data?.siswa

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Profil Anak</h1>
        <p className="text-sm text-muted-foreground">Data lengkap siswa</p>
      </div>

      {/* Profile header card */}
      {isLoading ? (
        <Skeleton className="h-44 rounded-3xl" />
      ) : siswa ? (
        <div>
          <Card className="overflow-hidden p-5">
            <div className="flex flex-col items-center text-center">
              {siswa.foto ? (
                <img
                  src={siswa.foto}
                  alt={siswa.nama}
                  className="size-20 rounded-full object-cover ring-4 ring-emerald-500/20"
                />
              ) : (
                <div className="flex size-20 items-center justify-center rounded-full gradient-emerald text-2xl font-bold text-white">
                  {siswa.nama.charAt(0).toUpperCase()}
                </div>
              )}
              <h2 className="mt-3 text-xl font-bold tracking-tight">
                {siswa.nama}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                NIS {siswa.nis}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {siswa.kelas && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <GraduationCap className="size-3.5" />
                    Kelas {siswa.kelas.nama}
                  </span>
                )}
                <StatusBadge
                  value={siswa.status}
                  label={LABEL_STATUS_SISWA[siswa.status]}
                />
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {/* Detail card */}
      {isLoading ? (
        <Skeleton className="h-72 rounded-2xl" />
      ) : siswa ? (
        <div>
          <Card className="divide-y divide-border p-0">
            <DetailRow label="NIS" value={siswa.nis} />
            <DetailRow label="NISN" value={siswa.nisn || '-'} />
            <DetailRow
              label="Jenis Kelamin"
              value={siswa.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
            />
            <DetailRow label="Tempat Lahir" value={siswa.tempatLahir || '-'} />
            <DetailRow
              label="Tanggal Lahir"
              value={
                siswa.tanggalLahir ? formatTanggal(siswa.tanggalLahir) : '-'
              }
            />
            <DetailRow
              label="Alamat"
              value={siswa.alamat || '-'}
              icon={<MapPin className="size-3.5" />}
            />
            <DetailRow
              label="Tahun Ajaran"
              value={siswa.tahunAjaran?.nama ?? '-'}
            />
            {siswa.kelas?.waliKelas && (
              <DetailRow
                label="Wali Kelas"
                value={siswa.kelas.waliKelas}
                icon={<User className="size-3.5" />}
              />
            )}
          </Card>
        </div>
      ) : null}

      {/* Hubungan wali */}
      {siswa && data?.wali && (
        <div>
          <Card className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <User className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Wali Murid</p>
              <p className="text-sm font-semibold">{data.wali.nama}</p>
              <p className="text-[11px] text-muted-foreground">
                {data.wali.hubungan ?? 'Wali'}
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="max-w-[60%] text-right text-sm font-medium">
        {value}
      </span>
    </div>
  )
}
