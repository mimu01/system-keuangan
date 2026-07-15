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

**Fitur (sudah ada):** Dashboard, Data Siswa, Wali Murid, Kelas, Jenis Pembayaran, Tagihan (+ generate massal), Pembayaran, Pengeluaran, Laporan (export), Tahun Ajaran, Notifikasi, Activity Log, Pengaturan.

### Aplikasi 2: Wali Murid App (`/app`)

| Aspek | Detail |
|-------|--------|
| **URL** | `/app` (publik, di-link dari landing page) |
| **Pengguna** | Wali murid / orang tua siswa |
| **Akses** | Publik, login dengan email + password |
| **Platform** | **Mobile-first PWA** (siap Android TWA) |
| **Auth** | JWT cookie `wali_session` (30 hari) |
| **Role** | `WALI_MURID` — read-only, scoped ke data anak sendiri |

**Fitur (akan dibangun):**
1. **Dashboard** — ringkasan tagihan aktif, total tunggakan, pembayaran terbaru
2. **Profil Anak** — data siswa (nama, NIS, kelas, foto, jenis kelamin, tanggal lahir)
3. **Status Tagihan** — daftar tagihan dengan status (Lunas/Belum/Sebagian), filter periode
4. **Riwayat Pembayaran** — histori semua pembayaran + download bukti (PDF/struk)
5. **Notifikasi** — daftar notifikasi (tagihan baru, pembayaran berhasil, pengumuman, jatuh tempo)
6. **Profil** — data wali murid + ubah kata sandi + logout

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

### Fase 1 — Fondasi Wali Murid App ✅ (Sedang dikerjakan)
- [x] ROADMAP.md (dokumen ini)
- [ ] `wali-auth.ts` — lib auth terpisah (JWT `wali_session`)
- [ ] `/app` login page (mobile-first, PWA feel)
- [ ] `/app/dashboard` layout — mobile shell + bottom navigation (6 menu)
- [ ] API wali: `/api/wali/auth/login`, `/api/wali/auth/logout`, `/api/wali/me`
- [ ] Update landing page: tombol "Unduh Aplikasi Wali Murid" → `/app`

### Fase 2 — Halaman Inti Wali Murid
- [ ] Dashboard wali — kartu total tagihan, tunggakan, pembayaran terbaru
- [ ] Status Tagihan — daftar tagihan anak, filter status/periode, progress bayar
- [ ] Riwayat Pembayaran — histori transaksi + download bukti (struk PDF)
- [ ] Profil Anak — data lengkap siswa
- [ ] Notifikasi — daftar notifikasi (realtime via Supabase)
- [ ] Profil Wali — data wali + ubah kata sandi + logout

### Fase 3 — PWA Enhancement
- [ ] Service worker untuk offline cache
- [ ] Install prompt (beforeinstallprompt)
- [ ] Push notification via FCM (Firebase Cloud Messaging)
- [ ] Splash screen optimization
- [ ] App shortcut (Android TWA)

### Fase 4 — Realtime & Notifikasi
- [ ] Realtime: admin input pembayaran → dashboard wali update otomatis
- [ ] Realtime: admin generate tagihan → notifikasi wali muncul
- [ ] Push notification: tagihan baru, pembayaran berhasil, jatuh tempo
- [ ] Email notification (opsional, via Resend/SendGrid)

### Fase 5 — Android TWA
- [ ] Bubblewrap init dari URL Vercel
- [ ] Build AAB → upload ke Play Store
- [ ] Asset Links (digital asset links verification)
- [ ] Play Store listing

### Fase 6 — Pengembangan Lanjutan
- [ ] Multi-anak per wali (saat ini 1 wali : 1 siswa)
- [ ] Pembayaran online (Midtrans/Xendit integration)
- [ ] QR code pembayaran
- [ ] Export laporan wali (PDF bulanan)
- [ ] Chat wali ↔ admin

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
