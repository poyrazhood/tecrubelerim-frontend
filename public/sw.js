const CACHE_NAME = 'tecrubelerim-v1'
const STATIC_CACHE = 'tecrubelerim-static-v1'
const DYNAMIC_CACHE = 'tecrubelerim-dynamic-v1'

// Core pages to cache on install
const STATIC_ASSETS = [
  '/',
  '/kesfet',
  '/muhtarlar',
  '/offline',
  '/manifest.json',
]

// ── Install: cache static assets ──────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }).then(() => self.skipWaiting())
  )
})

// ── Activate: clean old caches ─────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  )
})

// ── Fetch: network-first with cache fallback ───────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and external requests
  if (request.method !== 'GET') return
  if (!url.origin.includes(self.location.origin) && !url.hostname.includes('fonts.googleapis.com') && !url.hostname.includes('fonts.gstatic.com') && !url.hostname.includes('images.unsplash.com')) return

  // Images: cache-first (they rarely change)
  if (request.destination === 'image' || url.hostname.includes('images.unsplash.com')) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached
        try {
          const response = await fetch(request)
          if (response.ok) cache.put(request, response.clone())
          return response
        } catch {
          return new Response('', { status: 408 })
        }
      })
    )
    return
  }

  // Fonts: cache-first
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached
        const response = await fetch(request)
        cache.put(request, response.clone())
        return response
      })
    )
    return
  }

  // HTML pages: network-first, fallback to cache, then offline page
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone))
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          if (cached) return cached
          return caches.match('/offline') || new Response('Çevrimdışısınız', { status: 503 })
        })
    )
    return
  }

  // JS/CSS: stale-while-revalidate
  event.respondWith(
    caches.open(DYNAMIC_CACHE).then(async (cache) => {
      const cached = await cache.match(request)
      const fetchPromise = fetch(request).then((response) => {
        if (response.ok) cache.put(request, response.clone())
        return response
      }).catch(() => cached)
      return cached || fetchPromise
    })
  )
})

// ── Push notifications ─────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return

  let data = { title: 'Tecrübelerim', body: 'Yeni bildiriminiz var', icon: '/icons/icon-192.png', badge: '/icons/icon-72.png', url: '/bildirimler' }

  try {
    data = { ...data, ...event.data.json() }
  } catch (e) {
    data.body = event.data.text()
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: 'tecrubelerim-notif',
      renotify: true,
      data: { url: data.url },
      actions: [
        { action: 'open', title: 'Aç' },
        { action: 'dismiss', title: 'Kapat' },
      ],
    })
  )
})

// ── Notification click ─────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') return

  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return clients.openWindow(url)
    })
  )
})

// ── Background sync ────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-reviews') {
    event.waitUntil(syncPendingReviews())
  }
})

async function syncPendingReviews() {
  // Placeholder — will sync offline-written reviews when back online
  console.log('[SW] Syncing pending reviews...')
}
