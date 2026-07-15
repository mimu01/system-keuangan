import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentWali } from '@/lib/wali-auth'
import { db, verifyPassword, hashPassword } from '@/lib/db'
import { logActivity } from '@/lib/logger'

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Kata sandi saat ini wajib diisi'),
    newPassword: z.string().min(6, 'Kata sandi baru minimal 6 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok',
    path: ['confirmPassword'],
  })

export async function POST(req: NextRequest) {
  try {
    const wali = await getCurrentWali()
    if (!wali) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Data tidak valid' },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = parsed.data

    const fullWali = await db.waliMurid.findUnique({
      where: { id: wali.id },
      select: { passwordHash: true },
    })
    if (!fullWali?.passwordHash) {
      return NextResponse.json({ error: 'Akun tidak valid' }, { status: 400 })
    }

    const valid = await verifyPassword(currentPassword, fullWali.passwordHash)
    if (!valid) {
      return NextResponse.json(
        { error: 'Kata sandi saat ini salah' },
        { status: 400 }
      )
    }

    const newHash = await hashPassword(newPassword)
    await db.waliMurid.update({
      where: { id: wali.id },
      data: { passwordHash: newHash },
    })

    await logActivity({
      aksi: 'UPDATE',
      modul: 'WALI_MURID',
      deskripsi: `Wali murid ${wali.nama} mengubah kata sandi`,
      entitasId: wali.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Change password wali error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
