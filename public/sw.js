/**
 * Service Worker — SIK MI Miftahul Ulum 01
 *
 * Strategi caching:
 * - App shell (HTML navigasi): Network-first → fallback cache → fallback offline page
 * - Static assets (JS, CSS, images, fonts): Stale-while-revalidate
 * - API routes: TIDAK di-cache (biarkan fail, app handle error state)
 * - Cross-origin (Supabase, dll): TIDAK di-cache
 */

const CACHE_VERSION = 'v1'
const STATIC_CACHE = `sik-static-${CACHE_VERSION}`
const RUNTIME_CACHE = `sik-runtime-${CACHE_VERSION}`
const OFFLINE_URL = '/offline.html'

// App shell — precache saat install (halaman utama + login + offline)
const PRECACHE_URLS = [
  '/',
  '/app',
  '/admin',
  OFFLINE_URL,
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/favicon-32.png',
]

// ============ INSTALL: precache app shell ============
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        Promise.allSettled(
          PRECACHE_URLS.map((url) =>
            cache.add(url).catch(() => {
              /* ignore individual failures */
            })
          )
        )
      )
      .then(() => self.skipWaiting())
  )
})

// ============ ACTIVATE: hapus cache lama ============
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE].includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

// ============ FETCH: strategi per tipe request ============
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Hanya cache GET request
  if (request.method !== 'GET') return

  // Skip cross-origin (Supabase API, Google Fonts, dll)
  if (url.origin !== self.location.origin) return

  // JANGAN cache API routes — biarkan fail offline (app handle error)
  if (url.pathname.startsWith('/api/')) return

  // === Navigasi (HTML pages): Network-first dengan offline fallback ===
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Simpan ke runtime cache
          const copy = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy))
          return response
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL))
        )
    )
    return
  }

  // === Static assets: Stale-while-revalidate ===
  const isStaticAsset =
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)$/)

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            // Simpan ke runtime cache
            const copy = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy))
            return response
          })
          .catch(() => cached)
        return cached || fetchPromise
      })
    )
    return
  }
})

// ============ MESSAGE: handle update dari client ============
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
