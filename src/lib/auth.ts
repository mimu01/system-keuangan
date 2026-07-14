import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { db, hashPassword, verifyPassword } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'miftahul-ulum-secret-key-2024'
const SESSION_COOKIE = 'admin_session'
const SESSION_DURATION = 60 * 60 * 24 * 7 // 7 hari

export interface SessionPayload {
  adminId: string
  email: string
  nama: string
  role: string
}

// Buat token JWT
export async function createSession(payload: SessionPayload): Promise<string> {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: SESSION_DURATION,
  })
}

export { hashPassword, verifyPassword }

// Ambil sesi dari cookie (server-side)
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value
    if (!token) return null

    const decoded = jwt.verify(token, JWT_SECRET) as SessionPayload
    return decoded
  } catch {
    return null
  }
}

// Ambil admin yang sedang login
export async function getCurrentAdmin() {
  const session = await getSession()
  if (!session) return null

  const admin = await db.admin.findFirst({
    where: {
      id: session.adminId,
      deletedAt: null,
      aktif: true,
    },
    select: {
      id: true,
      nama: true,
      email: true,
      role: true,
      avatar: true,
      noHp: true,
    },
  })

  return admin
}

// Set cookie sesi
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  })
}

// Hapus cookie sesi
export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export { SESSION_COOKIE, JWT_SECRET }
