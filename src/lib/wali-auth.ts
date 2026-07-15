import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { db, hashPassword, verifyPassword } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'miftahul-ulum-secret-key-2024'
const SESSION_COOKIE = 'wali_session'
const SESSION_DURATION = 60 * 60 * 24 * 30 // 30 hari (lebih lama dari admin)

export interface WaliSessionPayload {
  waliId: string
  email: string
  nama: string
  siswaId: string
  role: 'WALI_MURID'
}

// Buat token JWT untuk wali murid
export async function createWaliSession(payload: WaliSessionPayload): Promise<string> {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: SESSION_DURATION,
  })
}

export { hashPassword, verifyPassword }

// Ambil sesi wali dari cookie (server-side)
export async function getWaliSession(): Promise<WaliSessionPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value
    if (!token) return null

    const decoded = jwt.verify(token, JWT_SECRET) as WaliSessionPayload
    return decoded
  } catch {
    return null
  }
}

// Ambil wali murid yang sedang login (lengkap dengan data siswa)
export async function getCurrentWali() {
  const session = await getWaliSession()
  if (!session) return null

  const wali = await db.waliMurid.findFirst({
    where: {
      id: session.waliId,
      deletedAt: null,
      siswaId: session.siswaId,
    },
    select: {
      id: true,
      nama: true,
      email: true,
      noHp: true,
      alamat: true,
      pekerjaan: true,
      hubungan: true,
      foto: true,
      siswaId: true,
      siswa: {
        select: {
          id: true,
          nis: true,
          nisn: true,
          nama: true,
          jenisKelamin: true,
          tempatLahir: true,
          tanggalLahir: true,
          alamat: true,
          foto: true,
          status: true,
          kelas: { select: { id: true, nama: true, tingkat: true, waliKelas: true } },
          tahunAjaran: { select: { id: true, nama: true } },
        },
      },
    },
  })

  return wali
}

// Set cookie sesi wali
export async function setWaliSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  })
}

// Hapus cookie sesi wali
export async function clearWaliSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export { SESSION_COOKIE as WALI_SESSION_COOKIE }
