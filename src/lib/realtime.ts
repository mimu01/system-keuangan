// Server-side helper untuk broadcast event ke realtime service
const REALTIME_URL = 'http://localhost:3003'
const INTERNAL_SECRET = 'realtime-miftahul-2024'

export async function broadcast(event: string, payload: unknown): Promise<void> {
  try {
    await fetch(`${REALTIME_URL}/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': INTERNAL_SECRET,
      },
      body: JSON.stringify({ event, payload }),
    })
  } catch (error) {
    console.error('Gagal broadcast realtime:', error)
  }
}

export const RealtimeEvents = {
  PEMBAYARAN_CREATED: 'pembayaran:created',
  PEMBAYARAN_UPDATED: 'pembayaran:updated',
  TAGIHAN_CREATED: 'tagihan:created',
  TAGIHAN_UPDATED: 'tagihan:updated',
  NOTIFIKASI_NEW: 'notifikasi:new',
  DASHBOARD_REFRESH: 'dashboard:refresh',
  PENGELUARAN_CREATED: 'pengeluaran:created',
} as const
