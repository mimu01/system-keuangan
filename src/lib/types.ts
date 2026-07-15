// Tipe data untuk seluruh aplikasi

export type Role = 'ADMIN' | 'WALI_MURID'

export type StatusSiswa = 'AKTIF' | 'LULUS' | 'PINDAH' | 'NONAKTIF'
export type JenisKelamin = 'L' | 'P'

export type KategoriPembayaran =
  | 'SPP'
  | 'PENGEMBANGAN'
  | 'KEGIATAN'
  | 'SERAGAM'
  | 'BUKU'
  | 'LAINNYA'

export type FrekuensiPembayaran = 'BULANAN' | 'TAHUNAN' | 'SEKALI' | 'SEMESTER'

export type StatusTagihan = 'BELUM_BAYAR' | 'SEBAGIAN' | 'LUNAS'

export type MetodePembayaran = 'TUNAI' | 'TRANSFER' | 'QRISS' | 'EWALLET'

export type StatusPembayaran = 'PENDING' | 'BERHASIL' | 'GAGAL' | 'DITOLAK'

export type TipeNotifikasi =
  | 'TAGIHAN_BARU'
  | 'PEMBAYARAN_BERHASIL'
  | 'PENGUMUMAN'
  | 'JATUH_TEMPO'

export type AksiLog = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT'

export interface DashboardStats {
  totalSiswa: number
  totalTagihan: number
  totalPemasukan: number
  totalPengeluaran: number
  tagihanLunas: number
  tagihanBelumBayar: number
  tagihanSebagian: number
  saldo: number
}

export interface ChartData {
  bulan: string
  pemasukan: number
  pengeluaran: number
}

export const LABEL_STATUS_SISWA: Record<StatusSiswa, string> = {
  AKTIF: 'Aktif',
  LULUS: 'Lulus',
  PINDAH: 'Pindah',
  NONAKTIF: 'Nonaktif',
}

export const LABEL_KATEGORI: Record<KategoriPembayaran, string> = {
  SPP: 'SPP',
  PENGEMBANGAN: 'Pengembangan',
  KEGIATAN: 'Kegiatan',
  SERAGAM: 'Seragam',
  BUKU: 'Buku',
  LAINNYA: 'Lainnya',
}

export const LABEL_FREKUENSI: Record<FrekuensiPembayaran, string> = {
  BULANAN: 'Bulanan',
  TAHUNAN: 'Tahunan',
  SEKALI: 'Sekali Bayar',
  SEMESTER: 'Semester',
}

export const LABEL_STATUS_TAGIHAN: Record<StatusTagihan, string> = {
  BELUM_BAYAR: 'Belum Bayar',
  SEBAGIAN: 'Sebagian',
  LUNAS: 'Lunas',
}

export const LABEL_METODE: Record<MetodePembayaran, string> = {
  TUNAI: 'Tunai',
  TRANSFER: 'Transfer Bank',
  QRISS: 'QRIS',
  EWALLET: 'E-Wallet',
}

export const LABEL_STATUS_PEMBAYARAN: Record<StatusPembayaran, string> = {
  PENDING: 'Menunggu',
  BERHASIL: 'Berhasil',
  GAGAL: 'Gagal',
  DITOLAK: 'Ditolak',
}

export const LABEL_TIPE_NOTIFIKASI: Record<TipeNotifikasi, string> = {
  TAGIHAN_BARU: 'Tagihan Baru',
  PEMBAYARAN_BERHASIL: 'Pembayaran Berhasil',
  PENGUMUMAN: 'Pengumuman',
  JATUH_TEMPO: 'Jatuh Tempo',
}

// Format mata uang Rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format tanggal Indonesia
export function formatTanggal(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

export function formatTanggalSingkat(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

export function formatTanggalWaktu(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

// Generate kode transaksi
export function generateKodeTransaksi(): string {
  const now = new Date()
  const tahun = now.getFullYear()
  const bulan = String(now.getMonth() + 1).padStart(2, '0')
  const tanggal = String(now.getDate()).padStart(2, '0')
  const jam = String(now.getHours()).padStart(2, '0')
  const menit = String(now.getMinutes()).padStart(2, '0')
  const detik = String(now.getSeconds()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `TRX-${tahun}${bulan}${tanggal}${jam}${menit}${detik}${random}`
}
