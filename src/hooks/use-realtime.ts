'use client'

import { useEffect, useRef, useState } from 'react'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'

// Mapping tabel → event yang dipancarkan ke consumer
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
 * Jika NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY sudah diset,
 * hook akan subscribe ke postgres_changes pada tabel aplikasi.
 *
 * Jika BELUM diset (mis. env vars lupa dikonfigurasi), hook TIDAK melakukan
 * apa-apa (no-op) — TIDAK ada polling yang membebani. Realtime non-aktif
 * sampai env vars dikonfigurasi. Data tetap bisa dilihat, hanya tidak
 * auto-refresh.
 *
 * Konsumen (dashboard) invalidate query yang relevan saat event diterima.
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

    const channel = supabase
      .channel('app-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload: { table: string; eventType: string; new: unknown }) => {
          const event = mapToEvent(payload.table, payload.eventType)
          if (!events || events.length === 0 || events.includes(event)) {
            onEventRef.current?.(event, payload.new)
          }
        }
      )
      .subscribe((status: string) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { isConnected }
}
