// Photosmile offline cache: app shell from cache, refreshed in the background so updates arrive on the next launch
const CACHE = 'photosmile-v1794265531256', SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // never cache Microsoft sign-in or OneDrive traffic
  if (/login\.microsoftonline\.com|graph\.microsoft\.com|login\.live\.com/.test(u.host)) return;
  const same = u.origin === location.origin, font = /fonts\.(googleapis|gstatic)\.com/.test(u.host);
  if (!same && !font) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, {ignoreSearch: same});
    const net = fetch(e.request).then(r => { if (r.ok || r.type === 'opaque') c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
