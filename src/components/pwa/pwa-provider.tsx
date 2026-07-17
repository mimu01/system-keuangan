'use client'

import { ReactNode } from 'react'
import { ChunkErrorHandler } from './chunk-error-handler'
import { RegisterSW } from './register-sw'
import { InstallPrompt } from './install-prompt'
import { ColorMixPolyfill } from './color-mix-polyfill'

/**
 * PWA Provider — menggabungkan:
 * - ChunkErrorHandler: auto-reload saat chunk load error (Vercel deploy baru)
 * - ColorMixPolyfill: fallback color-mix() untuk browser lama (Chrome < 111)
 * - RegisterSW: registrasi service worker (pure passthrough, no caching)
 * - InstallPrompt: install prompt (Android/desktop) + iOS guide
 */
export function PWAProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ChunkErrorHandler />
      <ColorMixPolyfill />
      <RegisterSW />
      <InstallPrompt />
    </>
  )
}
