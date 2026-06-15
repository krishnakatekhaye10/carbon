const CACHE_NAME = 'climatora-cache-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Network-first for HTML, cache-first for assets
  const request = event.request;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return res;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For assets, try cache then network
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      return res;
    })).catch(() => cached)
  );
});
