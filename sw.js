/* GK-001 service worker.
   Network-first: always try the live network, so content is never stale.
   Cache is the fallback, so the site keeps running when the network doesn't. */

const CACHE = 'gk-001-v8';
const CORE = ['./', './index.html', './styles.css', './app.js', './log.css', './aegis.html', './profile.jpg',
  './fonts/archivo-var.woff2', './fonts/plexmono-400.woff2',
  './fonts/plexmono-500.woff2', './fonts/plexmono-600.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(CORE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Only ever cache this site's own assets over http(s).
  // Never touch cross-origin responses: they are opaque, unverifiable,
  // and caching them would let a third party persist content under our origin.
  if (url.origin !== self.location.origin) return;
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return;

  e.respondWith(
    fetch(req)
      .then(res => {
        // only cache clean, same-origin, successful responses
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then(hit => hit || caches.match('./index.html'))
      )
  );
});
