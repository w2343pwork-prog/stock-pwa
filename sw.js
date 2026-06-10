const CACHE = 'stockpwa-v1';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // For API calls (Yahoo Finance), always go network
  if (e.request.url.includes('finance.yahoo') || e.request.url.includes('allorigins')) {
    e.respondWith(fetch(e.request).catch(() => new Response('{"error":"offline"}', { headers: {'Content-Type':'application/json'} })));
    return;
  }
  // For app shell, cache-first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }))
  );
});
