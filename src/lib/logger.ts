import { db } from './db'
import { headers } from 'next/headers'

// Catat aktivitas admin
export async function logActivity(params: {
  adminId?: string
  aksi: string
  modul: string
  deskripsi: string
  entitasId?: string
}) {
  try {
    const headerList = await headers()
    const ip = headerList.get('x-forwarded-for') || headerList.get('x-real-ip') || 'unknown'
    const userAgent = headerList.get('user-agent') || 'unknown'

    await db.activityLog.create({
      data: {
        adminId: params.adminId || null,
        aksi: params.aksi,
        modul: params.modul,
        deskripsi: params.deskripsi,
        entitasId: params.entitasId || null,
        ip,
        userAgent,
      },
    })
  } catch (error) {
    console.error('Gagal mencatat aktivitas:', error)
  }
}
