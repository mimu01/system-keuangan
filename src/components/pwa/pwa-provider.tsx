'use client'

import { ReactNode } from 'react'
import { RegisterSW } from './register-sw'
import { InstallPrompt } from './install-prompt'

/**
 * PWA Provider — menggabungkan:
 * - Registrasi service worker (offline cache + update detection)
 * - Install prompt (Android/desktop) + iOS guide
 */
export function PWAProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <RegisterSW />
      <InstallPrompt />
    </>
  )
}
