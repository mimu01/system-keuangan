// Konfigurasi konten Landing Page
import {
  Wallet,
  Bell,
  FileText,
  ShieldCheck,
  Smartphone,
  Clock,
  Users,
  TrendingUp,
  Download,
  CheckCircle2,
  Building2,
  Heart,
  type LucideIcon,
} from 'lucide-react'

export interface FiturItem {
  icon: LucideIcon
  judul: string
  deskripsi: string
}

export const fiturList: FiturItem[] = [
  {
    icon: Wallet,
    judul: 'Pembayaran Digital',
    deskripsi:
      'Bayar SPP dan tagihan sekolah kapan saja dengan metode tunai, transfer bank, QRIS, atau e-wallet. Praktis tanpa antri.',
  },
  {
    icon: FileText,
    judul: 'Tagihan Transparan',
    deskripsi:
      'Lihat seluruh rincian tagihan anak secara jelas — jumlah, periode, dan status pembayaran dalam satu layar.',
  },
  {
    icon: Bell,
    judul: 'Notifikasi Real-time',
    deskripsi:
      'Dapatkan pemberitahuan langsung saat ada tagihan baru, tagihan jatuh tempo, atau pembayaran berhasil dikonfirmasi.',
  },
  {
    icon: Download,
    judul: 'Bukti Pembayaran',
    deskripsi:
      'Unduh kuitansi dan bukti pembayaran dalam format digital kapan pun dibutuhkan untuk arsip pribadi.',
  },
  {
    icon: Clock,
    judul: 'Riwayat Lengkap',
    deskripsi:
      'Akses seluruh riwayat pembayaran anak dari tahun ke tahun. Transparan, rapi, dan mudah dilacak.',
  },
  {
    icon: ShieldCheck,
    judul: 'Aman & Terpercaya',
    deskripsi:
      'Data keuangan anak Anda dilindungi dengan enkripsi tingkat sekolah dan sistem keamanan berlapis.',
  },
]

export interface KeunggulanItem {
  icon: LucideIcon
  judul: string
  deskripsi: string
}

export const keunggulanList: KeunggulanItem[] = [
  {
    icon: Smartphone,
    judul: 'Mobile First',
    deskripsi:
      'Dirancang khusus untuk HP. Antarmuka yang bersih, ringan, dan nyaman digunakan setiap hari oleh wali murid.',
  },
  {
    icon: TrendingUp,
    judul: 'Update Langsung',
    deskripsi:
      'Setiap perubahan data langsung tersinkronisasi. Tidak perlu menunggu atau memuat ulang halaman.',
  },
  {
    icon: Users,
    judul: 'Ramah Wali Murid',
    deskripsi:
      'Bahasa sederhana, alur mudah, tanpa istilah rumit. Semua orang tua bisa menggunakannya tanpa bingung.',
  },
  {
    icon: Heart,
    judul: 'Transparansi Penuh',
    deskripsi:
      'Wali murid bisa memantau setiap rupiah yang dibayarkan. Membangun kepercayaan antara sekolah dan keluarga.',
  },
]

export interface FaqItem {
  pertanyaan: string
  jawaban: string
}

export const faqList: FaqItem[] = [
  {
    pertanyaan: 'Bagaimana cara mendaftar akun wali murid?',
    jawaban:
      'Akun wali murid dibuatkan oleh pihak sekolah secara otomatis saat anak terdaftar. Anda akan menerima email berisi tautan untuk mengatur kata sandi akun. Jika belum menerima, silakan hubungi bagian administrasi sekolah.',
  },
  {
    pertanyaan: 'Metode pembayaran apa saja yang didukung?',
    jawaban:
      'Aplikasi mendukung pembayaran tunai (di sekolah), transfer bank, QRIS, dan dompet digital. Setiap pembayaran akan tercatat secara otomatis dan bukti dapat diunduh kapan saja.',
  },
  {
    pertanyaan: 'Apakah aplikasi ini berbayar untuk wali murid?',
    jawaban:
      'Tidak. Aplikasi ini sepenuhnya gratis untuk seluruh wali murid MI Miftahul Ulum 01. Tidak ada biaya langganan atau biaya transaksi tambahan.',
  },
  {
    pertanyaan: 'Apakah data saya aman di aplikasi ini?',
    jawaban:
      'Aman. Seluruh data keuangan disimpan dengan enkripsi dan hanya dapat diakses oleh wali murid yang bersangkutan. Sistem kami mematuhi standar keamanan data sekolah.',
  },
  {
    pertanyaan: 'Bagaimana jika saya lupa kata sandi?',
    jawaban:
      'Anda dapat menggunakan fitur "Lupa Kata Sandi" pada halaman masuk. Tautan pemulihan akan dikirim ke email terdaftar. Bila mengalami kendala, hubungi administrasi sekolah.',
  },
  {
    pertanyaan: 'Apakah aplikasi bisa diakses tanpa internet?',
    jawaban:
      'Aplikasi dapat dipasang di HP Anda sebagai Progressive Web App. Beberapa informasi seperti riwayat pembayaran tetap dapat dilihat secara luring, namun pembayaran dan sinkronisasi memerlukan koneksi internet.',
  },
]

export interface KontakInfo {
  icon: LucideIcon
  label: string
  value: string
}

export const kontakInfo: KontakInfo[] = [
  {
    icon: Building2,
    label: 'Alamat Sekolah',
    value: 'Jl. Miftahul Ulum No. 01, Pasuruan, Jawa Timur',
  },
  {
    icon: Bell,
    label: 'Telepon',
    value: '(0343) 123-456',
  },
  {
    icon: FileText,
    label: 'Email',
    value: 'info@miftahululum01.sch.id',
  },
  {
    icon: Clock,
    label: 'Jam Layanan',
    value: 'Senin–Sabtu, 07.00–15.00 WIB',
  },
]

export const statistikSekolah = [
  { label: 'Siswa Aktif', value: '320+' },
  { label: 'Wali Murid Terdaftar', value: '280+' },
  { label: 'Transaksi/Bulan', value: '1.500+' },
  { label: 'Tingkat Kepuasan', value: '98%' },
]

export const langkahUnduh = [
  {
    nomor: '01',
    judul: 'Buka Aplikasi',
    deskripsi: 'Akses aplikasi melalui browser HP Anda atau unduh dari tombol di bawah ini.',
  },
  {
    nomor: '02',
    judul: 'Pasang di HP',
    deskripsi: 'Pilih "Tambahkan ke Layar Utama" agar aplikasi tampil seperti aplikasi native.',
  },
  {
    nomor: '03',
    judul: 'Masuk & Nikmati',
    deskripsi: 'Gunakan akun wali murid yang telah dibuatkan sekolah untuk mulai memantau keuangan.',
  },
]
