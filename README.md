# Sistem Informasi Keuangan MI Miftahul Ulum 01

Aplikasi keuangan sekolah modern untuk MI Miftahul Ulum 01. Premium SaaS design dengan tema Hijau Islami Emerald, PWA-ready, dan fully responsive (mobile-first) — siap dikonversi menjadi Android Trusted Web Activity (TWA).

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8) ![PWA](https://img.shields.io/badge/PWA-Ready-5a0fc8)

## Fitur Utama

### Landing Page Publik (`/`)
- Hero, Tentang, Fitur, Keunggulan, Screenshot, FAQ, Kontak, Footer
- Sepenuhnya dalam Bahasa Indonesia
- Hanya menampilkan tombol **"Unduh Aplikasi Wali Murid"** (tidak mengungkap keberadaan dashboard admin)

### Dashboard Admin (URL tersembunyi `/admin`)
- Login aman dengan JWT cookie session
- 13 modul lengkap:
  - Dashboard (statistik, chart arus keuangan, status tagihan)
  - Data Siswa, Wali Murid, Data Kelas
  - Jenis Pembayaran, Tagihan (+ generate massal), Pembayaran
  - Pengeluaran, Laporan (export CSV), Tahun Ajaran
  - Notifikasi, Activity Log, Pengaturan
- Realtime update via Socket.io (pembayaran, tagihan, notifikasi langsung tersinkron)
- Soft delete, audit trail, role-based access

### PWA Ready
- Manifest, service worker manifest, app icons (192/512/1024px)
- Installable, splash screen, offline-ready
- Siap Bubblewrap TWA

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript 5
- **Styling**: Tailwind CSS v4 + shadcn/ui (New York)
- **Animasi**: Framer Motion
- **Form**: React Hook Form + Zod
- **State**: TanStack Query + Zustand
- **Database**: Prisma ORM (SQLite lokal untuk development)
- **Realtime**: Socket.io (mini-service terpisah di port 3003)
- **Auth**: JWT cookie session + bcryptjs
- **Icons**: Lucide React

## Quick Start (Development)

```bash
# Install dependencies
bun install

# Setup environment
cp .env.example .env
# Edit .env: DATABASE_URL=file:./db/custom.db dan JWT_SECRET=...

# Push schema ke database
bun run db:push

# Seed data demo
bun run prisma/seed.ts

# Jalankan realtime service (di terminal terpisah)
cd mini-services/realtime-service && bun install && bun run dev

# Jalankan aplikasi
bun run dev
```

Buka `http://localhost:3000`.

### Akun Demo Admin

```
URL:     http://localhost:3000/admin
Email:   admin@miftahululum01.sch.id
Sandi:   admin123
```

## Deploy ke Vercel

### 1. Persiapan Environment Variables

Di Vercel Dashboard → Settings → Environment Variables, tambahkan:

| Key | Value | Keterangan |
|-----|-------|------------|
| `DATABASE_URL` | `file:./db/custom.db` | Path DB SQLite (lihat catatan di bawah) |
| `JWT_SECRET` | `<random-string-32-char>` | Secret untuk JWT session |

> **Catatan penting tentang database:** Aplikasi ini menggunakan Prisma + SQLite untuk development. Vercel serverless memiliki filesystem ephemeral, sehingga SQLite **tidak persisten** di Vercel. Untuk production, disarankan migrasi ke PostgreSQL/MySQL (Supabase, Neon, PlanetScale, dll). Cukup ubah `provider` di `prisma/schema.prisma` dan `DATABASE_URL`. Struktur schema sudah mendukung migrasi tanpa perubahan model.

### 2. Import dari GitHub

1. Buka [vercel.com/new](https://vercel.com/new)
2. Import repository `mimu01/sik-mi-miftahul-ulum-01`
3. Framework Preset: **Next.js** (terdeteksi otomatis)
4. Root Directory: `./` (default)
5. Build Command: `next build` (default)
6. Install Command: `bun install` (atau `npm install`)
7. Klik **Deploy**

### 3. Post-Deploy

- Set environment variables (lihat langkah 1)
- Jalankan Prisma migrate/db push pada build: tambahkan `bun run db:push` ke build command jika perlu, atau gunakan Vercel Post-build hook
- Redeploy setelah konfigurasi

### 4. Konversi ke Android TWA (Bubblewrap)

```bash
# Install Bubblewrap CLI
npm i -g @bubblewrap/cli

# Inisialisasi TWA dari URL Vercel
bubblewrap init --manifest https://your-app.vercel.app/manifest.json

# Build APK/AAB
bubblewrap build
```

## Struktur Project

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page publik
│   ├── admin/             # Dashboard admin (/admin)
│   │   ├── page.tsx       # Login admin
│   │   └── dashboard/     # Semua modul admin
│   └── api/               # API routes (REST)
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── admin/             # Komponen khusus admin
│   └── landing/           # Komponen landing page
├── hooks/                 # Custom hooks (useRealtime, dll)
├── lib/                   # Utils, auth, db, types
mini-services/
└── realtime-service/      # Socket.io service (port 3003)
prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Seed data demo
public/
├── manifest.json          # PWA manifest
└── icons/                 # App icons
```

## Bahasa

Seluruh aplikasi menggunakan **Bahasa Indonesia** formal — menu, tombol, form, validasi, alert, toast, dashboard, notifikasi, dan landing page.

## Keamanan

- JWT cookie session (httpOnly, secure di production)
- Password hashing dengan bcryptjs
- Soft delete pada semua entitas
- Audit trail (Activity Log)
- Protected routes via server-side session check
- Role-based access (ADMIN / WALI_MURID)

## Lisensi

© MI Miftahul Ulum 01. Semua hak cipta dilindungi.
