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
 * Hook realtime berbasis Supabase Realtime.
 *
 * - Jika Supabase terkonfigurasi: subscribe ke postgres_changes (real-time true)
 * - Jika tidak: no-op (TIDAK ada polling yang membebani)
 *
 * Callback menerima (event, payload) — consumer invalidate query cache.
 */
export function useRealtime(
  events?: string[],
  onEvent?: (event: string, payload: unknown) => void
) {
  const [isConnected, setIsConnected] = useState(false)
  const onEventRef = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  })

  useEffect(() => {
    const supabase = getSupabase()

    // No-op jika Supabase belum dikonfigurasi
    if (!supabase || !isSupabaseConfigured) {
      return
    }

    let channel: ReturnType<typeof supabase.channel> | null = null

    try {
      channel = supabase
        .channel('app-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          (payload: { table: string; eventType: string; new: unknown }) => {
            try {
              // Filter: hanya tabel yang relevan
              if (!REALTIME_TABLES.includes(payload.table as typeof REALTIME_TABLES[number])) {
                return
              }
              const event = mapToEvent(payload.table, payload.eventType)
              if (!events || events.length === 0 || events.includes(event)) {
                onEventRef.current?.(event, payload.new)
              }
            } catch (err) {
              console.error('Realtime callback error:', err)
            }
          }
        )
        .subscribe((status: string) => {
          try {
            setIsConnected(status === 'SUBSCRIBED')
          } catch {
            // ignore state update errors
          }
        })
    } catch (err) {
      console.error('Realtime subscription error:', err)
    }

    return () => {
      try {
        if (channel && supabase) {
          supabase.removeChannel(channel)
        }
      } catch {
        // ignore cleanup errors
      }
    }
  }, [])

  return { isConnected }
}
