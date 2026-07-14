'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

const REALTIME_PORT = 3003

export function useRealtime(events?: string[], onEvent?: (event: string, payload: any) => void) {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

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

    if (events && onEvent) {
      events.forEach((event) => {
        socket.on(event, (payload: any) => onEvent(event, payload))
      })
    }

    return () => {
      socket.disconnect()
    }
  }, [])

  return { socket: socketRef.current, isConnected }
}
