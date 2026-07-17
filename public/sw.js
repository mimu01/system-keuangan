/**
 * Service Worker — SIK MI Miftahul Ulum 01
 *
 * VERSI PURE PASSTHROUGH — tidak intercept APA PUN.
 *
 * Penyebab ChunkLoadError sebelumnya:
 * - SW intercept navigasi → return cached/offline HTML
 * - Vercel deploy baru → chunk hash berubah (mis. __be98784e → __ce98784f)
 * - HTML lama (dari cache browser/SW) reference chunk lama yang sudah tidak ada
 * - Browser load chunk → 404 → ChunkLoadError → app blank/crash
 *
 * Fix: SW TIDAK intercept fetch apa pun. Browser handle semua request
 * secara normal (seperti web biasa). SW hanya terdaftar untuk PWA installability.
 * Offline support: halaman offline.html bisa diakses manual jika diperlukan.
 *
 * Keuntungan:
 * - Tidak ada stale cache (chunk hash selalu fresh dari server)
 * - Tidak ada ChunkLoadError (browser selalu fetch HTML+chunk terbaru)
 * - PWA tetap installable (manifest + SW registration cukup)
 * - Paling stabil untuk Vercel (auto-deploy sering ganti chunk hash)
 */

const SW_VERSION = 'v6-passthrough'

// INSTALL — langsung skipWaiting (tidak precache apa-apa)
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

// ACTIVATE — hapus SEMUA cache lama + claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
      .then(() => {
        // Beritahu semua client untuk reload (dapat SW baru + HTML fresh)
        return self.clients.matchAll({ type: 'window' })
      })
      .then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SW_UPDATED', version: SW_VERSION })
        })
      })
      .catch(() => {})
  )
})

// TIDAK ADA fetch handler — browser handle semua request normal
// (ini kunci: tidak ada stale cache yang bisa cause ChunkLoadError)

// MESSAGE — handle dari client
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
