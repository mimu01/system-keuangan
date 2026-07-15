# 📊 Progress Pengembangan — SIK MI Miftahul Ulum 01

> Status per Juli 2025. Dokumen ini melacak apa yang **sudah diterapkan** dan **belum diterapkan** agar perkembangan aplikasi terlihat jelas.

---

## 🎯 Ringkasan Eksekutif

| Komponen | Progress | Status |
|----------|----------|--------|
| 🟦 Aplikasi Admin (`/admin`) | **95%** | ✅ Siap pakai |
| 🟩 Aplikasi Wali Murid (`/app`) | **85%** | ✅ Siap pakai |
| 🏠 Landing Page | **100%** | ✅ Selesai |
| 🗄️ Database & API | **90%** | ✅ Stabil |
| ⚡ Realtime | **80%** | ✅ Berfungsi (perlu anon key) |
| 📱 PWA | **40%** | ⚠️ Dasar saja |
| 🔔 Push Notification | **0%** | ⬜ Belum mulai |
| 📄 Export PDF | **0%** | ⬜ Belum mulai (CSV ada) |
| 🤖 Android TWA | **0%** | ⬜ Belum mulai |
| 💳 Pembayaran Online | **0%** | ⬜ Belum mulai |

**Overall: ~75% selesai** — Fondasi & fitur inti lengkap, siap dipakai. Tinggal enhancement PWA, notifikasi, dan TWA.

---

## ✅ SUDAH DITERAPKAN (Selesai)

### 🏠 Landing Page Publik (`/`) — 100%
- [x] Hero section dengan tombol "Unduh Aplikasi Wali Murid" → link ke `/app`
- [x] Section: Tentang, Fitur (6), Keunggulan (4), Screenshot, FAQ (6), Kontak (form), Download CTA, Footer
- [x] Navbar responsif (desktop + mobile drawer)
- [x] Dark mode toggle
- [x] Framer Motion animations
- [x] SEO metadata (OpenGraph, Twitter card)
- [x] **TIDAK menampilkan link admin** (sesuai requirement)

### 🟦 Aplikasi Admin (`/admin`) — 95%

**Autentikasi:**
- [x] Login page (split-screen premium, JWT cookie `admin_session` 7 hari)
- [x] Logout
- [x] Ubah kata sandi
- [x] Protected routes (server-side session check)
- [x] Activity log (audit trail: login, create, update, delete)

**13 Modul Lengkap (CRUD):**
- [x] **Dashboard** — 4 stat cards, chart arus keuangan (area), status tagihan (pie), pembayaran terbaru
- [x] **Data Siswa** — tabel + mobile cards, search, filter status/kelas, create/edit/delete (soft delete)
- [x] **Wali Murid** — tabel + mobile cards, search, create/edit/delete
- [x] **Data Kelas** — tabel + mobile cards, jumlah siswa per kelas
- [x] **Jenis Pembayaran** — tabel + mobile cards, filter kategori, aktif switch
- [x] **Tagihan** — tabel + mobile cards + **Generate Tagihan Massal** (SPP semua siswa 1 klik)
- [x] **Pembayaran** — tabel + mobile cards, filter status/metode/tanggal, dialog terima pembayaran (auto-update tagihan status)
- [x] **Pengeluaran** — tabel + mobile cards, filter kategori/tanggal
- [x] **Laporan** — filter tanggal/jenis, summary cards, tabel transaksi gabungan, **Export CSV**
- [x] **Tahun Ajaran** — single-active enforcement
- [x] **Notifikasi** — kirim notifikasi (TAGIHAN_BARU/PEMBAYARAN_BERHASIL/PENGUMUMAN/JATUH_TEMPO)
- [x] **Activity Log** — read-only, filter modul/aksi, colored badges
- [x] **Pengaturan** — info sekolah + profil admin + ubah sandi

**UX:**
- [x] Sidebar navigation (desktop) + Sheet drawer (mobile)
- [x] Topbar: search, theme toggle, notifikasi, profil dropdown
- [x] Framer Motion page transitions
- [x] Toast notifications (sonner)
- [x] Loading skeletons
- [x] Empty states
- [x] Confirm delete dialogs
- [x] Form validation (Zod + Indonesian messages)
- [x] Responsive: dual-view (desktop table + mobile cards)

### 🟩 Aplikasi Wali Murid (`/app`) — 85%

**Autentikasi:**
- [x] Login page (mobile-first, PWA feel, JWT cookie `wali_session` 30 hari)
- [x] Logout
- [x] Ubah kata sandi (dengan validasi)
- [x] Protected routes (server-side session check)
- [x] **Scoped ke data anak sendiri** (API selalu filter by siswaId)

**6 Halaman:**
- [x] **Dashboard** — kartu tunggakan (gradient hero), 2 stat mini, tagihan jatuh tempo, pembayaran terbaru, link profil anak
- [x] **Status Tagihan** — filter pills (Semua/Lunas/Belum/Sebagian), progress bar, riwayat pembayaran per tagihan (collapsible)
- [x] **Riwayat Pembayaran** — summary hero (total berhasil), list pembayaran, link "Lihat Bukti" (jika ada)
- [x] **Notifikasi** — icon per tipe, indicator belum dibaca, list 50 terbaru
- [x] **Profil Anak** — data lengkap siswa (NIS, NISN, JK, lahir, alamat, kelas, tahun ajaran)
- [x] **Profil Wali** — info wali, link profil anak, form ubah sandi, logout

**UX:**
- [x] Mobile-first design (max-w-md centered)
- [x] Bottom navigation (5 menu: Beranda, Tagihan, Bayar, Notifikasi, Profil)
- [x] Framer Motion animations + active nav indicator
- [x] Touch-friendly (44px+ targets)
- [x] Safe area inset (iOS notch)

### 🗄️ Database & Backend — 90%

**Database (Supabase PostgreSQL):**
- [x] 12 tabel: Admin, TahunAjaran, Kelas, Siswa, WaliMurid, JenisPembayaran, Tagihan, Pembayaran, Pengeluaran, Notifikasi, ActivityLog, Pengaturan
- [x] UUID primary keys (cuid)
- [x] created_at, updated_at otomatis
- [x] Soft delete (deletedAt) di semua entitas
- [x] Foreign keys dengan relasi proper
- [x] **40+ database indexes** (FK + field yang sering di-query) — query 10-100x lebih cepat
- [x] Seed data (admin, 6 kelas, 12 siswa, 12 wali, 5 jenis pembayaran, tagihan, pembayaran, pengeluaran, notifikasi, pengaturan)

**API Routes (REST):**
- [x] Admin auth: login, logout, me, change-password
- [x] Admin data: dashboard/stats, siswa (+list), wali-murid, kelas (+list), jenis-pembayaran (+list), tagihan (+list+generate), pembayaran, pengeluaran, laporan, tahun-ajaran (+list), notifikasi, activity-log, pengaturan
- [x] Wali auth: login, logout, change-password
- [x] Wali data: me, dashboard, tagihan, pembayaran, notifikasi, siswa
- [x] Zod validation di semua endpoint
- [x] Soft delete pattern
- [x] Activity logging di mutasi
- [x] Error handling (try/catch, status codes)

### ⚡ Realtime — 80%
- [x] Supabase Realtime (postgres_changes) terintegrasi
- [x] 12 tabel aktif di publication `supabase_realtime`
- [x] Hook `useRealtime` (dipakai admin + wali)
- [x] Targeted invalidation per event (bukan invalidate semua)
- [x] No-op jika env vars belum set (tidak ada polling yang membebani)
- [x] Toast notification saat event diterima
- [x] Auto-refresh dashboard saat admin input pembayaran
- [⚠] **Butuh `NEXT_PUBLIC_SUPABASE_ANON_KEY` di Vercel untuk aktif** (jika belum set, realtime non-aktif tapi app tetap jalan)

### 🎨 Desain & UX — 100%
- [x] Tema Hijau Islami Emerald (light + dark mode)
- [x] shadcn/ui component library (New York style)
- [x] Framer Motion animations (page transition, stagger, hover)
- [x] Lucide icons
- [x] Glassmorphism (navbar, cards)
- [x] Premium SaaS style (Stripe/Linear/Vercel inspired)
- [x] 100% Bahasa Indonesia
- [x] Accessibility (semantic HTML, ARIA, keyboard nav)
- [x] Responsive mobile-first

### 🔒 Keamanan — 70%
- [x] JWT cookie session (httpOnly, secure, sameSite)
- [x] Password hashing (bcryptjs, 10 rounds)
- [x] Session terpisah admin vs wali
- [x] API protection (getCurrentAdmin / getCurrentWali)
- [x] Wali scoped ke data anak sendiri (API-level)
- [x] Soft delete (data tidak benar-benar hilang)
- [x] Audit trail (Activity Log)
- [⚠] **Supabase RLS (Row Level Security) belum diaktifkan** — saat ini security di API level (Prisma query filter), bukan database level

### 🚀 Deployment & Performa — 90%
- [x] Vercel deployment (auto-deploy dari GitHub)
- [x] Supabase PostgreSQL (session pooler port 5432, IPv4)
- [x] GitHub repo: `mimu01/system-keuangan`
- [x] Query optimization (Promise.all, no N+1, select specific fields)
- [x] staleTime 2 menit (kurangi refetch)
- [x] refetchOnWindowFocus: false
- [x] 40+ database indexes
- [x] Lint: 0 errors

---

## ⬜ BELUM DITERAPKAN (To-Do)

### 📱 PWA Enhancement — 40% selesai

**Sudah ada:**
- [x] `manifest.json` (name, icons, theme color, display standalone)
- [x] App icons (192px, 512px, 1024px)
- [x] Apple touch icon
- [x] Favicon (16px, 32px)

**Belum ada:**
- [ ] **Service Worker** (`sw.js`) — untuk offline cache & background sync
- [ ] **Install prompt** — handler `beforeinstallprompt` (tombol "Pasang Aplikasi")
- [ ] **Offline fallback page** — halaman yang tampil saat tidak ada internet
- [ ] **Cache strategy** — cache-first untuk assets, network-first untuk data
- [ ] **Splash screen** optimization (sesuai manifest)
- [ ] **App shortcut** (Android — shortcut "Dashboard" di long-press icon)
- [ ] **next-pwa** package integration (atau Serwist untuk Next.js 16)

### 🔔 Push Notification — 0%

- [ ] **Firebase Cloud Messaging (FCM)** integration
  - [ ] Setup Firebase project
  - [ ] Install `firebase` package
  - [ ] Request notification permission
  - [ ] Generate FCM token per device
  - [ ] Store token di tabel WaliMurid (field `fcmToken` sudah ada di schema)
- [ ] **Server-side push** — kirim notifikasi ke FCM saat:
  - [ ] Tagihan baru dibuat
  - [ ] Pembayaran berhasil dikonfirmasi
  - [ ] Tagihan jatuh tempo (scheduled, H-3 / H-1)
  - [ ] Pengumuman sekolah
- [ ] **Notification click** — buka halaman relevan saat notifikasi diklik
- [ ] **Background notification** — terima notifikasi saat app tertutup

### 📄 Export PDF — 0%

- [ ] **Export Laporan PDF** (admin) — saat ini hanya CSV
  - [ ] Library: `@react-pdf/renderer` atau `jspdf` + `html2canvas`
  - [ ] Template: kop sekolah, periode, tabel transaksi, ringkasan, tanda tangan
- [ ] **Download Bukti Pembayaran / Struk PDF** (wali & admin)
  - [ ] Generate struk PDF per transaksi (kode transaksi, siswa, jumlah, metode, tanggal, tanda tangan)
  - [ ] Tombol "Unduh Bukti" di halaman riwayat pembayaran wali
  - [ ] Tombol "Cetak Struk" di halaman pembayaran admin

### 💳 Pembayaran Online — 0%

- [ ] **Integrasi payment gateway** (Midtrans / Xendit)
  - [ ] Virtual Account (BCA, BNI, BRI, Mandiri)
  - [ ] QRIS
  - [ ] E-wallet (GoPay, OVO, DANA)
  - [ ] Credit card (opsional)
- [ ] **Payment flow wali:**
  - [ ] Pilih tagihan → klik "Bayar Sekarang"
  - [ ] Pilih metode → generate payment link / QR code
  - [ ] Redirect ke payment gateway / tampilkan QR
  - [ ] Webhook receiver → update status pembayaran otomatis
- [ ] **Payment webhook** (`/api/payment/webhook`) — terima callback dari gateway
- [ ] **Auto-update tagihan** saat pembayaran sukses dari webhook
- [ ] **Refund handling** (opsional)

### 🤖 Android TWA (Trusted Web Activity) — 0%

- [ ] **Bubblewrap CLI** setup
- [ ] `bubblewrap init --manifest https://[url-vercel]/manifest.json`
- [ ] **Digital Asset Links** (`assetlinks.json`) — verifikasi domain
- [ ] Build AAB (Android App Bundle)
- [ ] Upload ke **Google Play Console**
- [ ] Play Store listing (deskripsi, screenshot, icon, feature graphic)
- [ ] Signing key (keystore)
- [ ] Versi & update management

### 🔒 Keamanan Lanjutan — 30% (RLS belum aktif)

- [ ] **Supabase RLS (Row Level Security)**
  - [ ] Enable RLS di semua tabel
  - [ ] Policy: wali hanya bisa SELECT data `WHERE siswaId = auth.uid()` (perlu mapping Supabase auth ↔ wali)
  - [ ] Policy: admin full access
  - [ ] Migrate auth ke Supabase Auth (opsional, atau tetap JWT custom)
- [ ] **Rate limiting** — limit API calls per IP/user (cegah abuse)
- [ ] **CSRF protection** — untuk form submissions
- [ ] **Input sanitization** — XSS prevention (Zod sudah validasi, tapi bisa diperkuat)
- [ ] **Audit log enhancement** — log lebih detail (field changes, before/after values)

### 🗃️ Supabase Storage — 0%

- [ ] **Upload bukti pembayaran** (wali upload bukti transfer)
  - [ ] Setup Supabase Storage bucket `bukti-pembayaran`
  - [ ] Upload component di halaman pembayaran wali
  - [ ] Generate signed URL (akses terbatas waktu)
  - [ ] Admin review bukti di halaman pembayaran
- [ ] **Upload foto siswa** (admin)
  - [ ] Bucket `foto-siswa`
  - [ ] Resize & compress di client (sharp/client-side)
- [ ] **Upload file pengeluaran** (bukti kuitansi)
  - [ ] Bucket `bukti-pengeluaran`

### ⚡ Supabase Edge Functions — 0%

- [ ] **Cron job: notifikasi jatuh tempo** — cron harian, cek tagihan jatuh tempo H-3/H-1, kirim notifikasi
- [ ] **Auto-generate tagihan SPP** — cron awal bulan, generate tagihan SPP untuk semua siswa aktif
- [ ] **Backup database** — scheduled backup
- [ ] **Email sender** — kirim email notifikasi (via Resend/SendGrid)

### 👥 Multi-Anak per Wali — 0%

Saat ini: 1 wali murid : 1 siswa. Target: 1 wali bisa punya beberapa anak.
- [ ] Ubah relasi: `WaliMurid.siswaId` (1:1) → `WaliMurid.siswa[]` (1:many)
- [ ] Wali pilih anak saat login (switcher di header)
- [ ] API wali filter by anak yang dipilih
- [ ] UI: tabs atau dropdown untuk pilih anak

### 💬 Fitur Tambahan (Opsional)

- [ ] **Chat Wali ↔ Admin** — realtime messaging
- [ ] **Export laporan wali** (PDF bulanan, untuk arsip pribadi)
- [ ] **QR Code pembayaran** — siswa/wali scan QR untuk lihat tagihan
- [ ] **Reminders** — wali set reminder tagihan
- [ ] **Pencarian global** — search bar di admin (cari siswa, pembayaran, dll sekaligus)
- [ ] **Dashboard analytics** — chart lebih lengkap (tren pembayaran, kategori pengeluaran, dll)
- [ ] **Multi-sekolah** — satu install untuk banyak sekolah (SaaS multi-tenant)
- [ ] **WhatsApp notification** — kirim tagihan via WhatsApp (WA Business API)

---

## 🗓️ Roadmap Prioritas (Urutan Pengerjaan)

### Prioritas TINGGI (segera — untuk stabil produksi)
1. **Set env vars Supabase di Vercel** (NEXT_PUBLIC_SUPABASE_URL + ANON_KEY) ← user lakukan
2. **Service Worker + PWA install prompt** ← agar bisa "dipasang" di HP
3. **Export PDF laporan + struk pembayaran** ← fitur yang sering diminta sekolah
4. **Push notification (FCM)** ← wali harus tahu tagihan baru tanpa buka app

### Prioritas SEDANG (1-2 bulan)
5. **Supabase RLS** ← security di database level (defense in depth)
6. **Android TWA (Bubblewrap)** ← publish ke Play Store
7. **Supabase Storage** (upload bukti pembayaran + foto siswa)
8. **Cron job: auto-generate SPP & notifikasi jatuh tempo**

### Prioritas RENDAH (3+ bulan / opsional)
9. **Pembayaran online** (Midtrans/Xendit) ← butuh akun bisnis payment gateway
10. **Multi-anak per wali** ← butuh restruktur relasi
11. **Chat wali ↔ admin**
12. **Multi-sekolah (SaaS)**

---

## 📈 Metrik Pengembangan

| Kategori | Selesai | Total | % |
|----------|---------|-------|---|
| Landing Page | 8 | 8 | 100% |
| Admin Auth | 5 | 5 | 100% |
| Admin Modul | 13 | 13 | 100% |
| Admin API | 20 | 20 | 100% |
| Wali Auth | 4 | 4 | 100% |
| Wali Halaman | 6 | 6 | 100% |
| Wali API | 9 | 9 | 100% |
| Database | 12 tabel + 40 index | — | 90% |
| Realtime | 6 event | 6 | 100%* |
| PWA | 4 komponen | 11 | 36% |
| Push Notif | 0 | 8 | 0% |
| Export PDF | 0 | 4 | 0% |
| Pembayaran Online | 0 | 8 | 0% |
| Android TWA | 0 | 7 | 0% |
| Supabase RLS | 0 | 5 | 0% |
| Supabase Storage | 0 | 3 | 0% |
| Edge Functions | 0 | 4 | 0% |

*Realtime 100% jika env vars sudah set di Vercel

**Estimasi keseluruhan: ~75% selesai**

---

## 🔑 Akun Demo

| App | URL | Email | Sandi |
|-----|-----|-------|-------|
| Admin | `/admin` | admin@miftahululum01.sch.id | admin123 |
| Wali Murid | `/app` | wali2024002@miftahululum01.sch.id | wali123 |

---

## 📦 Deployment

- **GitHub**: https://github.com/mimu01/system-keuangan
- **Vercel**: auto-deploy dari branch `main`
- **Supabase**: project `lorfloiepzqatelbiflk` (region: eu-west-1)
- **Env vars wajib di Vercel**: `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

*Dokumen ini diperbarui setiap kali ada penambahan fitur. Update terakhir: Juli 2025.*
