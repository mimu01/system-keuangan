/**
 * Service Worker — SIK MI Miftahul Ulum 01
 *
 * VERSI SELF-UNREGISTER — hapus SEMUA service worker dari browser.
 *
 * Alasan:
 * - SW lama (v1-v5) masih terdaftar di HP user, intercept request
 * - SW lama serve cached HTML → chunk 404 → ChunkLoadError → app crash
 * - SW v6 (passthrough) butuh waktu untuk replace SW lama
 * - Selama transisi, app tetap crash di HP lama
 *
 * Solusi: SW v7 langsung unregister SEMUA SW (termasuk dirinya sendiri).
 * Aplikasi jalan sebagai website biasa (paling stabil, paling kompatibel).
 * PWA install tetap bisa karena manifest.json cukup (SW tidak wajib untuk install).
 *
 * Setelah app stabil di semua device, bisa daftar ulang SW dengan caching yang proper.
 */

const SW_VERSION = 'v7-self-unregister'

// INSTALL — langsung unregister semua SW
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        // Unregister semua SW (termasuk dirinya sendiri)
        const registrations = await self.registration.unregister()
        console.log('SW unregistered:', registrations)

        // Hapus SEMUA cache
        const keys = await caches.keys()
        await Promise.all(keys.map((key) => caches.delete(key)))

        // Beritahu semua client untuk reload (tanpa SW)
        const clients = await self.clients.matchAll({ type: 'window' })
        clients.forEach((client) => {
          client.postMessage({ type: 'SW_UNREGISTERED' })
        })
      } catch (e) {
        // ignore
      }
    })()
  )
})

// ACTIVATE — unregister + claim
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        await self.registration.unregister()
        const keys = await caches.keys()
        await Promise.all(keys.map((key) => caches.delete(key)))
        await self.clients.claim()
        const clients = await self.clients.matchAll({ type: 'window' })
        clients.forEach((client) => {
          client.postMessage({ type: 'SW_UNREGISTERED' })
        })
      } catch (e) {
        // ignore
      }
    })()
  )
})

// TIDAK ADA fetch handler — tidak intercept apa pun

// MESSAGE
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
