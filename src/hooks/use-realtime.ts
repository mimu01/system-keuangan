'use client'

import { useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'

const REALTIME_PORT = 3003

export function useRealtime(
  events?: string[],
  onEvent?: (event: string, payload: unknown) => void
) {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Simpan callback terbaru di ref agar event listener selalu memanggil versi terbaru
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent

  useEffect(() => {
    const socket = io('/?XTransformPort=' + REALTIME_PORT, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    })

    socketRef.current = socket

    socket.on('connect', () => setIsConnected(true))
    socket.on('disconnect', () => setIsConnected(false))

    if (events && events.length > 0) {
      events.forEach((event) => {
        socket.on(event, (payload: unknown) => {
          onEventRef.current?.(event, payload)
        })
      })
    }

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  return { isConnected }
}
