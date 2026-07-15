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
- **Database**: Prisma ORM + Supabase PostgreSQL
- **Realtime**: Supabase Realtime (postgres_changes)
- **Auth**: JWT cookie session + bcryptjs
- **Icons**: Lucide React

## Quick Start (Development)

```bash
# Install dependencies
bun install

# Setup environment
cp .env.example .env
# Edit .env: isi DATABASE_URL (Supabase), JWT_SECRET, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

# Push schema ke database Supabase
bun run db:push

# Enable Supabase Realtime (sekali saja)
bun run prisma/enable-realtime.ts

# Seed data demo
bun run prisma/seed.ts

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
| `DATABASE_URL` | `postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres` | Connection string Supabase (session pooler, port 5432) |
| `JWT_SECRET` | `<random-string-32-char>` | Secret untuk JWT session (generate: `openssl rand -base64 32`) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[REF].supabase.co` | URL project Supabase (untuk Realtime) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Anon public key dari Supabase Dashboard > Settings > API |

> **Ambil Supabase URL & Anon Key:** Dashboard Supabase → Settings → API → Project URL & Project API keys (anon public).

### 2. Pastikan Database Sudah Dimigrasi

Database Supabase sudah berisi semua tabel + data demo (sudah di-migrate & seed). Jika perlu ulang:

```bash
bun run db:push          # buat tabel
bun run prisma/enable-realtime.ts  # aktifkan realtime
bun run prisma/seed.ts   # isi data demo
```

### 3. Import dari GitHub

1. Buka [vercel.com/new](https://vercel.com/new)
2. Import repository `mimu01/system-keuangan`
3. Framework Preset: **Next.js** (terdeteksi otomatis)
4. Install Command: `bun install` (atau `npm install`)
5. Klik **Deploy**

### 4. Post-Deploy

- Set semua 4 environment variables di atas
- Redeploy agar env variables terbaca
- Akses `/admin` untuk login (admin@miftahululum01.sch.id / admin123)

### 5. Konversi ke Android TWA (Bubblewrap)

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
