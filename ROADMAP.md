# Roadmap Arsitektur — SIK MI Miftahul Ulum 01

> Dokumen perencanaan fondasi & struktur untuk **dua aplikasi terintegrasi** yang berbagi satu database Supabase.

---

## 1. Visi & Arsitektur

Sistem Informasi Keuangan MI Miftahul Ulum 01 terdiri dari **dua aplikasi** yang saling terintegrasi melalui **satu database Supabase PostgreSQL** dengan **realtime sinkron**:

```
┌─────────────────────────────────────────────────────────────┐
│                    LANDING PAGE PUBLIK (/)                    │
│            Promosi aplikasi — tombol "Unduh Aplikasi"        │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
┌─────────────────────────┐  ┌─────────────────────────────┐
│   APLIKASI ADMIN        │  │   APLIKASI WALI MURID       │
│   URL: /admin           │  │   URL: /app                 │
│   (tersembunyi)         │  │   (publik, PWA)             │
│                         │  │                             │
│   • Kelola seluruh data │  │   • Lihat tagihan anak      │
│   • Input pembayaran    │  │   • Lihat riwayat bayar     │
│   • Generate tagihan    │  │   • Download bukti bayar    │
│   • Laporan & export    │  │   • Notifikasi              │
│   • Manajemen sekolah   │  │   • Profil anak & wali      │
└───────────┬─────────────┘  └──────────────┬──────────────┘
            │                               │
            │      ┌────────────────┐       │
            └─────►│   SUPABASE     │◄──────┘
                   │   PostgreSQL   │
                   │   + Realtime   │
                   └────────────────┘
```

### Prinsip Arsitektur
- **Shared database, separate apps** — satu sumber data, dua pengalaman pengguna berbeda
- **Role-based access** — Admin (full access), Wali Murid (read-only, scoped ke anak sendiri)
- **Realtime native** — Supabase Realtime (postgres_changes), tidak butuh service terpisah
- **Mobile-first** — Wali Murid app = PWA yang siap jadi Android TWA
- **Clean separation** — auth, API, dan UI terpisah antar dua app

---

## 2. Dua Aplikasi

### Aplikasi 1: Admin Dashboard (`/admin`)

| Aspek | Detail |
|-------|--------|
| **URL** | `/admin` (tersembunyi, tidak ditampilkan di landing page) |
| **Pengguna** | Admin sekolah (bendahara) |
| **Akses** | Diketahui internal, tidak ada link publik |
| **Platform** | Desktop-first (juga responsif mobile) |
| **Auth** | JWT cookie `admin_session` (7 hari) |
| **Role** | `ADMIN` — full CRUD ke semua data |

**Fitur (sudah ada):** Dashboard, Data Siswa, Wali Murid, Data Kelas, Jenis Pembayaran, Tagihan (+ generate massal), Pembayaran, Pengeluaran, Laporan (export CSV), Tahun Ajaran, Notifikasi, Activity Log, Pengaturan.

> Lihat [PROGRESS.md](./PROGRESS.md) untuk status detail setiap fitur.

### Aplikasi 2: Wali Murid App (`/app`)

| Aspek | Detail |
|-------|--------|
| **URL** | `/app` (publik, di-link dari landing page) |
| **Pengguna** | Wali murid / orang tua siswa |
| **Akses** | Publik, login dengan email + password |
| **Platform** | **Mobile-first PWA** (siap Android TWA) |
| **Auth** | JWT cookie `wali_session` (30 hari) |
| **Role** | `WALI_MURID` — read-only, scoped ke data anak sendiri |

**Fitur (sudah dibangun):**
1. **Dashboard** — ringkasan tagihan aktif, total tunggakan, pembayaran terbaru
2. **Profil Anak** — data siswa (nama, NIS, kelas, foto, jenis kelamin, tanggal lahir)
3. **Status Tagihan** — daftar tagihan dengan status (Lunas/Belum/Sebagian), filter periode
4. **Riwayat Pembayaran** — histori semua pembayaran + link bukti
5. **Notifikasi** — daftar notifikasi (tagihan baru, pembayaran berhasil, pengumuman, jatuh tempo)
6. **Profil** — data wali murid + ubah kata sandi + logout

> Lihat [PROGRESS.md](./PROGRESS.md) untuk status detail.

---

## 3. Fondasi Bersama (Shared Layer)

Komponen yang dipakai kedua aplikasi — tidak duplikasi:

```
src/
├── lib/
│   ├── db.ts              # Prisma client (shared)
│   ├── supabase.ts        # Supabase client untuk Realtime (shared)
│   ├── auth.ts            # Admin auth (admin_session)
│   ├── wali-auth.ts       # Wali murid auth (wali_session) ← BARU
│   ├── types.ts           # Tipe data + label Indonesia (shared)
│   ├── realtime.ts        # broadcast no-op (Supabase auto) (shared)
│   └── logger.ts          # Activity log (shared)
├── hooks/
│   └── use-realtime.ts    # Realtime hook (shared, dipakai kedua app)
├── components/
│   ├── ui/                # shadcn/ui (shared)
│   ├── theme-toggle.tsx   # Dark mode toggle (shared)
│   └── theme-provider.tsx # Theme provider (shared)
└── prisma/
    └── schema.prisma      # Satu schema untuk semua (shared)
```

---

## 4. Struktur Direktori (Target)

```
src/app/
├── page.tsx                    # Landing page publik
├── layout.tsx                  # Root layout
│
├── admin/                      # 🟦 APLIKASI ADMIN
│   ├── page.tsx                # Login admin (redirect ke dashboard jika authed)
│   ├── login-form.tsx
│   └── dashboard/
│       ├── layout.tsx          # Sidebar + header (desktop-first)
│       ├── page.tsx            # Dashboard overview
│       ├── siswa/
│       ├── wali-murid/
│       ├── kelas/
│       ├── jenis-pembayaran/
│       ├── tagihan/
│       ├── pembayaran/
│       ├── pengeluaran/
│       ├── laporan/
│       ├── tahun-ajaran/
│       ├── notifikasi/
│       ├── activity-log/
│       └── pengaturan/
│
├── app/                        # 🟩 APLIKASI WALI MURID ← BARU
│   ├── page.tsx                # Login wali (redirect ke dashboard jika authed)
│   ├── login-form.tsx
│   └── dashboard/
│       ├── layout.tsx          # Mobile shell + bottom navigation
│       ├── page.tsx            # Dashboard wali
│       ├── profil-anak/        # Profil siswa
│       ├── tagihan/            # Status tagihan
│       ├── pembayaran/         # Riwayat pembayaran + download bukti
│       ├── notifikasi/         # Notifikasi wali
│       └── profil/             # Profil wali + ubah sandi
│
└── api/
    ├── auth/                   # API admin auth
    │   ├── login/
    │   ├── logout/
    │   ├── me/
    │   └── change-password/
    ├── wali/                   # API wali murid auth ← BARU
    │   ├── auth/
    │   │   ├── login/
    │   │   ├── logout/
    │   │   └── change-password/
    │   ├── me/                 # Data wali + siswa
    │   ├── dashboard/          # Statistik dashboard wali
    │   ├── tagihan/            # Tagihan anak (scoped)
    │   ├── pembayaran/         # Riwayat pembayaran (scoped)
    │   ├── notifikasi/         # Notifikasi wali
    │   └── siswa/              # Profil anak
    ├── dashboard/              # API admin dashboard
    ├── siswa/                  # API admin siswa (CRUD)
    ├── wali-murid/             # API admin wali murid (CRUD)
    ├── kelas/
    ├── jenis-pembayaran/
    ├── tagihan/
    ├── pembayaran/
    ├── pengeluaran/
    ├── laporan/
    ├── tahun-ajaran/
    ├── notifikasi/
    ├── activity-log/
    └── pengaturan/
```

---

## 5. Model Keamanan

### Session Terpisah
| App | Cookie Name | Duration | Scope |
|-----|-------------|----------|-------|
| Admin | `admin_session` | 7 hari | Akses penuh semua data |
| Wali Murid | `wali_session` | 30 hari | Hanya data anak sendiri |

### API Protection
- **Admin API** (`/api/*` selain `/api/wali/*`): cek `getCurrentAdmin()` → 401 jika tidak login
- **Wali API** (`/api/wali/*`): cek `getCurrentWali()` → 401 jika tidak login + **scope query ke `siswaId` wali tersebut**

### Row-Level Security (Supabase)
- Prisma query di API wali **selalu** difilter `WHERE siswaId = wali.siswaId`
- Wali tidak bisa melihat data siswa lain meski tahu ID-nya
- Admin bisa lihat semua data

---

## 6. Roadmap Implementasi

### Fase 1 — Fondasi Wali Murid App ✅ SELESAI
- [x] ROADMAP.md + PROGRESS.md
- [x] `wali-auth.ts` — lib auth terpisah (JWT `wali_session`)
- [x] `/app` login page (mobile-first, PWA feel)
- [x] `/app/dashboard` layout — mobile shell + bottom navigation (5 menu)
- [x] API wali: `/api/wali/auth/login`, `/api/wali/auth/logout`, `/api/wali/me`, dll
- [x] Update landing page: tombol "Unduh Aplikasi Wali Murid" → `/app`

### Fase 2 — Halaman Inti Wali Murid ✅ SELESAI
- [x] Dashboard wali — kartu total tagihan, tunggakan, pembayaran terbaru
- [x] Status Tagihan — daftar tagihan anak, filter status/periode, progress bayar
- [x] Riwayat Pembayaran — histori transaksi + link bukti
- [x] Profil Anak — data lengkap siswa
- [x] Notifikasi — daftar notifikasi (realtime via Supabase)
- [x] Profil Wali — data wali + ubah kata sandi + logout

### Fase 3 — Stabilisasi & Performa ✅ SELESAI
- [x] Migrasi SQLite → Supabase PostgreSQL
- [x] Supabase Realtime (postgres_changes)
- [x] 40+ database indexes
- [x] Query optimization (Promise.all, no N+1)
- [x] Targeted invalidation per event
- [x] Hapus polling fallback (no-op jika env belum set)
- [x] Mobile responsive (admin dual-view + wali mobile-first)

### Fase 4 — PWA Enhancement ✅ SELESAI
- [x] Service worker untuk offline cache (`public/sw.js`)
- [x] Install prompt (beforeinstallprompt) — banner Android/Desktop + guide iOS
- [x] Offline fallback page (`public/offline.html`)
- [x] Cache strategy (network-first navigasi, stale-while-revalidate assets)
- [x] Splash screen optimization (Apple touch startup image, theme color)
- [x] App shortcut (3 shortcut di manifest: Dashboard, Tagihan, Pembayaran)
- [x] Tombol "Pasang Aplikasi" di halaman profil wali
- [x] Update detection + auto-reload saat versi baru

### Fase 5 — Push Notification ⬜
- [ ] Firebase Cloud Messaging (FCM) integration
- [ ] Request notification permission
- [ ] Generate FCM token per device (field `fcmToken` sudah ada)
- [ ] Server-side push: tagihan baru, pembayaran berhasil, jatuh tempo, pengumuman
- [ ] Notification click handler
- [ ] Background notification

### Fase 6 — Export PDF ⬜
- [ ] Export Laporan PDF (admin) — kop sekolah, tabel, tanda tangan
- [ ] Download Struk/Bukti Pembayaran PDF (wali & admin)
- [ ] Library: @react-pdf/renderer atau jspdf

### Fase 7 — Android TWA ⬜
- [ ] Bubblewrap init dari URL Vercel
- [ ] Digital Asset Links (assetlinks.json)
- [ ] Build AAB → upload ke Play Store
- [ ] Play Store listing

### Fase 8 — Keamanan Lanjutan ⬜
- [ ] Supabase RLS (Row Level Security) di semua tabel
- [ ] Rate limiting API
- [ ] CSRF protection
- [ ] Audit log enhancement (field changes)

### Fase 9 — Supabase Storage ⬜
- [ ] Upload bukti pembayaran (wali)
- [ ] Upload foto siswa (admin)
- [ ] Upload bukti pengeluaran (admin)
- [ ] Signed URL untuk akses terbatas

### Fase 10 — Edge Functions & Cron ⬜
- [ ] Cron: notifikasi jatuh tempo (H-3, H-1)
- [ ] Cron: auto-generate tagihan SPP awal bulan
- [ ] Email notification (via Resend/SendGrid)
- [ ] Scheduled backup

### Fase 11 — Pembayaran Online ⬜ (opsional)
- [ ] Integrasi Midtrans/Xendit
- [ ] Virtual Account, QRIS, E-wallet
- [ ] Payment flow wali (pilih tagihan → bayar → webhook)
- [ ] Webhook receiver → auto-update tagihan

### Fase 12 — Pengembangan Lanjutan ⬜ (opsional)
- [ ] Multi-anak per wali (1 wali : banyak siswa)
- [ ] Chat wali ↔ admin
- [ ] QR code pembayaran
- [ ] Export laporan wali (PDF bulanan)
- [ ] Pencarian global admin
- [ ] Multi-sekolah (SaaS multi-tenant)

---

## 7. Alur Data Realtime

```
Admin input pembayaran di /admin/dashboard/pembayaran
    │
    ▼
POST /api/pembayaran → Prisma create ke Supabase
    │
    ▼
Supabase Realtime detect INSERT di tabel pembayaran
    │
    ▼
Broadcast event ke semua subscriber
    │
    ▼
Wali Murid app (yang sedang login) terima event
    │
    ▼
TanStack Query invalidate → dashboard wali refresh otomatis
    │
    ▼
Wali lihat pembayaran baru TANPA refresh halaman
```

---

## 8. Teknologi (Konsisten kedua app)

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 16 App Router |
| Bahasa | TypeScript 5 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Prisma + Supabase PostgreSQL |
| Realtime | Supabase Realtime (postgres_changes) |
| Auth | JWT cookie session + bcryptjs |
| State | TanStack Query (server) + Zustand (client) |
| Form | React Hook Form + Zod |
| Animasi | Framer Motion |
| Icons | Lucide React |
| PWA | next-pwa / manifest + service worker |

---

## 9. Bahasa & Desain

- **Bahasa**: Seluruh aplikasi 100% Bahasa Indonesia (formal, mudah dipahami)
- **Tema warna**: Hijau Islami Emerald + Putih + Abu terang + Dark mode
- **Admin**: desktop-first, sidebar navigation, data-dense
- **Wali Murid**: mobile-first, **bottom navigation**, card-based, touch-friendly (44px+ targets)
- **Referensi style**: Stripe, Linear, Vercel, Notion, Apple

---

## 10. Akun Demo

### Admin
```
URL:     /admin
Email:   admin@miftahululum01.sch.id
Sandi:   admin123
```

### Wali Murid
```
URL:     /app
Email:   wali2024002@miftahululum01.sch.id
Sandi:   wali123
Anak:    Muhammad Faiz Abdullah (Kelas 1A)
```

---

## 11. Deployment

- **Repo**: https://github.com/mimu01/system-keuangan
- **Hosting**: Vercel (auto-deploy dari GitHub main branch)
- **Database**: Supabase PostgreSQL (project `lorfloiepzqatelbiflk`)
- **Environment Variables** (Vercel):
  - `DATABASE_URL` — Supabase connection string
  - `JWT_SECRET` — secret untuk JWT
  - `NEXT_PUBLIC_SUPABASE_URL` — URL Supabase
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon key untuk Realtime

---

*Dokumen ini hidup — update saat ada perubahan arsitektur atau penambahan fitur.*
