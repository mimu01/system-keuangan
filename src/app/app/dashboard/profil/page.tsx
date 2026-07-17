'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  LogOut,
  MapPin,
  Phone,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { usePWAInstall } from '@/hooks/use-pwa-install'

interface WaliSiswa {
  id: string
  nis: string
  nama: string
  kelas: { nama: string } | null
  foto: string | null
}

interface WaliMe {
  id: string
  nama: string
  email: string
  noHp: string | null
  alamat: string | null
  pekerjaan: string | null
  hubungan: string | null
  foto: string | null
  siswaId: string
  siswa: WaliSiswa
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Kata sandi saat ini wajib diisi'),
    newPassword: z.string().min(6, 'Kata sandi baru minimal 6 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok',
    path: ['confirmPassword'],
  })

type PasswordForm = z.infer<typeof passwordSchema>

export default function ProfilPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [loggingOut, setLoggingOut] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { data, isLoading } = useQuery<WaliMe>({
    queryKey: ['wali-me'],
    queryFn: async () => {
      const res = await fetch('/api/wali/me')
      if (!res.ok) throw new Error('Gagal memuat profil')
      const json = await res.json()
      return json.wali as WaliMe
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: PasswordForm) => {
    try {
      const res = await fetch('/api/wali/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? 'Gagal mengubah kata sandi')
        return
      }
      toast.success('Kata sandi berhasil diubah')
      reset()
      queryClient.invalidateQueries({ queryKey: ['wali-me'] })
    } catch {
      toast.error('Terjadi kesalahan, silakan coba lagi')
    }
  }

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

  const hubunganLabel =
    data?.hubungan === 'ORTU'
      ? 'Orang Tua'
      : data?.hubungan === 'WALI'
        ? 'Wali'
        : (data?.hubungan ?? 'Wali')

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Profil Saya</h1>
        <p className="text-sm text-muted-foreground">Informasi akun wali murid</p>
      </div>

      {/* Profile header card */}
      {isLoading ? (
        <Skeleton className="h-40 rounded-3xl" />
      ) : data ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden p-5">
            <div className="flex flex-col items-center text-center">
              {data.foto ? (
                <img
                  src={data.foto}
                  alt={data.nama}
                  className="size-20 rounded-full object-cover ring-4 ring-emerald-500/20"
                />
              ) : (
                <div className="flex size-20 items-center justify-center rounded-full gradient-emerald text-2xl font-bold text-white">
                  {data.nama.charAt(0).toUpperCase()}
                </div>
              )}
              <h2 className="mt-3 text-lg font-bold tracking-tight">
                {data.nama}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{data.email}</p>
              <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <User className="size-3.5" />
                {hubunganLabel}
              </span>
            </div>
          </Card>
        </motion.div>
      ) : null}

      {/* Info card */}
      {isLoading ? (
        <Skeleton className="h-44 rounded-2xl" />
      ) : data ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="divide-y divide-border p-0">
            <InfoRow
              icon={<Phone className="size-4" />}
              label="No. HP"
              value={data.noHp || '-'}
            />
            <InfoRow
              icon={<Briefcase className="size-4" />}
              label="Pekerjaan"
              value={data.pekerjaan || '-'}
            />
            <InfoRow
              icon={<MapPin className="size-4" />}
              label="Alamat"
              value={data.alamat || '-'}
            />
          </Card>
        </motion.div>
      ) : null}

      {/* Anak card */}
      {data?.siswa && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Link href="/app/dashboard/profil-anak">
            <Card className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-accent">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <GraduationCap className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Profil Anak</p>
                  <p className="text-sm font-semibold">{data.siswa.nama}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {data.siswa.kelas
                      ? `Kelas ${data.siswa.kelas.nama} · NIS ${data.siswa.nis}`
                      : `NIS ${data.siswa.nis}`}
                  </p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Card>
          </Link>
        </motion.div>
      )}

      {/* Ubah Kata Sandi */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Lock className="size-4" />
            </div>
            <h2 className="text-sm font-semibold">Ubah Kata Sandi</h2>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword" className="text-xs">
                Kata Sandi Saat Ini
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('currentPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  tabIndex={-1}
                  aria-label="Tampilkan kata sandi"
                >
                  {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-[11px] text-destructive">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-xs">
                Kata Sandi Baru
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('newPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  tabIndex={-1}
                  aria-label="Tampilkan kata sandi"
                >
                  {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-[11px] text-destructive">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs">
                Konfirmasi Kata Sandi
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  tabIndex={-1}
                  aria-label="Tampilkan kata sandi"
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full gradient-emerald text-white shadow-sm shadow-emerald-600/20 hover:opacity-90"
            >
              {isSubmitting ? 'Menyimpan...' : 'Ubah Kata Sandi'}
            </Button>
          </form>
        </Card>
      </motion.div>

      {/* Pasang Aplikasi (PWA Install) */}
      <InstallAppCard />

      {/* Logout */}
      <Button
        variant="destructive"
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full"
      >
        <LogOut className="size-4" />
        {loggingOut ? 'Keluar...' : 'Keluar'}
      </Button>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

function InstallAppCard() {
  const { canInstall, isInstalled, promptInstall } = usePWAInstall()
  const [installing, setInstalling] = useState(false)

  const handleInstall = async () => {
    setInstalling(true)
    const accepted = await promptInstall()
    setInstalling(false)
    if (accepted) {
      toast.success('Aplikasi berhasil dipasang!')
    }
  }

  // Jika sudah terpasang, tampilkan status
  if (isInstalled) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Aplikasi Terpasang</p>
            <p className="text-xs text-muted-foreground">
              Akses dari layar utama HP Anda
            </p>
          </div>
        </div>
      </Card>
    )
  }

  // Jika bisa dipasang (Android/Desktop Chrome), tampilkan tombol
  if (canInstall) {
    return (
      <Card className="overflow-hidden p-0">
        <div className="gradient-emerald p-4 text-white">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Download className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">Pasang Aplikasi</p>
              <p className="mt-0.5 text-xs text-white/80">
                Akses lebih cepat dari layar utama, bekerja offline
              </p>
              <Button
                onClick={handleInstall}
                disabled={installing}
                size="sm"
                className="mt-3 bg-white text-emerald-700 hover:bg-white/90"
              >
                {installing ? 'Memproses...' : 'Pasang Sekarang'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // iOS / browser lain — tampilkan info instruksi (InstallPrompt banner akan muncul otomatis)
  return null
}
