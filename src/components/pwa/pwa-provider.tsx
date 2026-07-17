'use client'

import { ReactNode } from 'react'
import { RegisterSW } from './register-sw'
import { InstallPrompt } from './install-prompt'
import { ColorMixPolyfill } from './color-mix-polyfill'

/**
 * PWA Provider — menggabungkan:
 * - ColorMixPolyfill: fallback color-mix() untuk browser lama (Chrome < 111)
 * - Registrasi service worker (offline cache + update detection)
 * - Install prompt (Android/desktop) + iOS guide
 */
export function PWAProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ColorMixPolyfill />
      <RegisterSW />
      <InstallPrompt />
    </>
  )
}
