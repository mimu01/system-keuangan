'use client'

import { useEffect, useRef, useState } from 'react'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'

// Tabel yang dipantau untuk realtime
const REALTIME_TABLES = [
  'pembayaran',
  'tagihan',
  'pengeluaran',
  'notifikasi',
  'siswa',
  'wali_murid',
  'kelas',
  'jenis_pembayaran',
  'tahun_ajaran',
  'admins',
  'pengaturan',
] as const

// Mapping tabel+aksi → event name (kompatibel dengan event lama)
function mapToEvent(table: string, eventType: string): string {
  switch (table) {
    case 'pembayaran':
      return eventType === 'INSERT' ? 'pembayaran:created' : 'pembayaran:updated'
    case 'tagihan':
      return eventType === 'INSERT' ? 'tagihan:created' : 'tagihan:updated'
    case 'pengeluaran':
      return 'pengeluaran:created'
    case 'notifikasi':
      return 'notifikasi:new'
    default:
      return 'dashboard:refresh'
  }
}

/**
 * Hook realtime.
 * - Jika Supabase terkonfigurasi: subscribe ke postgres_changes (real-time true)
 * - Jika tidak: fallback ke polling (invalidate setiap 15 detik)
 *
 * Callback menerima (event, payload) — consumer invalidate query cache.
 */
export function useRealtime(
  events?: string[],
  onEvent?: (event: string, payload: unknown) => void
) {
  const [isConnected, setIsConnected] = useState(false)
  const onEventRef = useRef(onEvent)

  // Update ref terbaru di effect (bukan saat render)
  useEffect(() => {
    onEventRef.current = onEvent
  })

  useEffect(() => {
    const supabase = getSupabase()

    if (supabase && isSupabaseConfigured) {
      // ===== Mode Supabase Realtime =====
      const channel = supabase
        .channel('app-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          (payload: any) => {
            const table = payload.table
            const eventType = payload.eventType
            const event = mapToEvent(table, eventType)
            // Filter berdasarkan events yang didengarkan consumer (jika diberikan)
            if (!events || events.length === 0 || events.includes(event)) {
              onEventRef.current?.(event, payload.new)
            }
          }
        )
        .subscribe((status) => {
          setIsConnected(status === 'SUBSCRIBED')
        })

      return () => {
        supabase.removeChannel(channel)
      }
    }

    // ===== Mode Polling Fallback =====
    // Dipakai jika NEXT_PUBLIC_SUPABASE_URL/ANON_KEY belum diset.
    // Invalidate setiap 15 detik agar dashboard tetap update.
    // (isConnected tetap false — default state)
    const interval = setInterval(() => {
      onEventRef.current?.('dashboard:refresh', null)
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  return { isConnected }
}
