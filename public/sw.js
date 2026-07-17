/**
 * Service Worker — SIK MI Miftahul Ulum 01
 *
 * Strategi caching (mobile-safe, minimal):
 * - Navigasi (HTML): Network-first → cache → fallback offline (Response manual)
 * - Static assets: Stale-while-revalidate
 * - API & cross-origin: Tidak di-cache
 *
 * Safety: SEMUA path punya fallback Response valid (tidak pernah respondWith(undefined))
 * Tidak pakai navigation preload (compatibility issue di beberapa mobile browser)
 */

const CACHE_VERSION = 'v3'
const STATIC_CACHE = `sik-static-${CACHE_VERSION}`
const RUNTIME_CACHE = `sik-runtime-${CACHE_VERSION}`
const OFFLINE_URL = '/offline.html'

// Hanya precache file statis yang pasti 200
const PRECACHE_URLS = [
  OFFLINE_URL,
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/favicon-32.png',
]

// HTML offline fallback manual (selalu tersedia, tidak bergantung cache)
function getOfflineResponse() {
  const body =
    '<!DOCTYPE html><html lang="id"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' +
    '<title>Offline — SIK MI Miftahul Ulum 01</title>' +
    '<meta name="theme-color" content="#0d9488">' +
    '<style>' +
    '*{margin:0;padding:0;box-sizing:border-box}' +
    'body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;' +
    'background:linear-gradient(135deg,#f0fdf4,#ecfdf5);color:#064e3b;' +
    'min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem}' +
    '.c{max-width:28rem;text-align:center;background:rgba(255,255,255,.8);' +
    'backdrop-filter:blur(16px);border-radius:1.5rem;padding:2.5rem 2rem;' +
    'box-shadow:0 20px 50px -12px rgba(13,148,136,.15);border:1px solid rgba(13,148,136,.1)}' +
    '.i{width:5rem;height:5rem;margin:0 auto 1.5rem;background:linear-gradient(135deg,#10b981,#0d9488);' +
    'border-radius:1.25rem;display:flex;align-items:center;justify-content:center;' +
    'box-shadow:0 10px 25px -5px rgba(13,148,136,.3)}' +
    'h1{font-size:1.5rem;font-weight:700;margin-bottom:.5rem}' +
    'p{font-size:.95rem;color:#047857;line-height:1.6;margin-bottom:1.5rem}' +
    '.b{display:inline-flex;align-items:center;gap:.5rem;background:linear-gradient(135deg,#10b981,#0d9488);' +
    'color:#fff;border:none;padding:.875rem 1.75rem;border-radius:.875rem;font-size:.95rem;' +
    'font-weight:600;cursor:pointer;box-shadow:0 4px 12px -2px rgba(13,148,136,.4)}' +
    '@media(prefers-color-scheme:dark){body{background:linear-gradient(135deg,#022c22,#064e3b);color:#d1fae5}' +
    '.c{background:rgba(6,78,59,.6);border-color:rgba(16,185,129,.2)}' +
    'h1{color:#ecfdf5}p{color:#a7f3d0}}' +
    '</style></head><body><div class="c">' +
    '<div class="i"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">' +
    '<path stroke-linecap="round" stroke-linejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 18.894c3.807-3.808 9.98-3.808 13.788 0M1.924 19.771c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z"/></svg></div>' +
    '<h1>Anda Sedang Offline</h1>' +
    '<p>Tidak ada koneksi internet. Beberapa data mungkin tidak tersedia. Silakan periksa koneksi Anda lalu coba lagi.</p>' +
    '<button class="b" onclick="location.reload()">Coba Lagi</button>' +
    '</div></body></html>'

  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

// Cek apakah request adalah navigasi (HTML page)
function isNavigationRequest(request) {
  return (
    request.mode === 'navigate' ||
    request.destination === 'document' ||
    (request.method === 'GET' &&
      request.headers.get('accept') &&
      request.headers.get('accept').indexOf('text/html') !== -1)
  )
}

// ============ INSTALL: precache static files ============
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
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
      .catch(() => self.clients.claim())
  )
})

// ============ FETCH: strategi per tipe request ============
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Hanya handle GET
  if (request.method !== 'GET') return

  // Skip cross-origin
  if (url.origin !== self.location.origin) return

  // Skip API routes
  if (url.pathname.startsWith('/api/')) return

  // === Navigasi: Network-first dengan offline fallback aman ===
  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache response valid
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy)).catch(() => {})
          }
          return response
        })
        .catch(() =>
          caches.match(request).then((cached) => {
            if (cached) return cached
            // Fallback: coba offline page dari cache
            return caches.match(OFFLINE_URL).then((offline) => {
              if (offline) return offline
              // Fallback terakhir: manual response (selalu valid)
              return getOfflineResponse()
            })
          })
        )
    )
    return
  }

  // === Static assets: Stale-while-revalidate ===
  var isStaticAsset =
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.indexOf('/_next/') === 0 ||
    /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)$/.test(url.pathname)

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response && response.status === 200 && response.type === 'basic') {
              const copy = response.clone()
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy)).catch(() => {})
            }
            return response
          })
          .catch(() => null)

        return cached || fetchPromise.then((r) => r || new Response('', { status: 504 }))
      })
    )
    return
  }
})

// ============ MESSAGE: handle update ============
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
