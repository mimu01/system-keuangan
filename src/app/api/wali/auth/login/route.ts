import { NextRequest, NextResponse } from 'next/server'
import { db, verifyPassword } from '@/lib/db'
import { createWaliSession, setWaliSessionCookie } from '@/lib/wali-auth'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Data tidak valid' },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data

    const wali = await db.waliMurid.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
      include: { siswa: { select: { id: true, nama: true, status: true } } },
    })

    if (!wali || !wali.passwordHash) {
      return NextResponse.json(
        { error: 'Email atau kata sandi salah' },
        { status: 401 }
      )
    }

    const valid = await verifyPassword(password, wali.passwordHash)
    if (!valid) {
      return NextResponse.json(
        { error: 'Email atau kata sandi salah' },
        { status: 401 }
      )
    }

    if (wali.siswa.status === 'NONAKTIF' || wali.siswa.status === 'PINDAH') {
      return NextResponse.json(
        { error: 'Akun anak tidak aktif. Hubungi sekolah.' },
        { status: 403 }
      )
    }

    const token = await createWaliSession({
      waliId: wali.id,
      email: wali.email,
      nama: wali.nama,
      siswaId: wali.siswaId,
      role: 'WALI_MURID',
    })

    await setWaliSessionCookie(token)

    return NextResponse.json({
      wali: {
        id: wali.id,
        nama: wali.nama,
        email: wali.email,
        siswa: { id: wali.siswa.id, nama: wali.siswa.nama },
      },
    })
  } catch (error) {
    console.error('Login wali error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
