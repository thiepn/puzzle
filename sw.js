/* Puzzle Arcade 1.14.0: QoL release shell; refreshed for full regression repair. */
const APP_VERSION = '1.14.0';
const CACHE_VERSION = 'v33';
const SCOPE = new URL(self.registration.scope);
const CACHE_FAMILY = 'puzzle-arcade-core-';
const CACHE_PREFIX = `${CACHE_FAMILY}${encodeURIComponent(SCOPE.pathname)}-`;
const CACHE = `${CACHE_PREFIX}${CACHE_VERSION}`;
const APP_SHELL = new URL('./index.html', SCOPE).href;
const CORE = [
  './index.html', './styles.css', './word-dictionary.js', './word-content.js', './app.js',
  './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png'
].map(path => new URL(path, SCOPE).href);
const CORE_SET = new Set(CORE);
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try {
      await cache.addAll(CORE.map(url => new Request(url, {cache: 'reload'})));
    } catch (error) {
      await caches.delete(CACHE);
      throw error;
    }
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type !== 'SKIP_WAITING') return;
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== SCOPE.origin || !url.pathname.startsWith(SCOPE.pathname)) return;
  const isShellNavigation = request.mode === 'navigate' && (url.pathname === SCOPE.pathname || url.href.split(/[?#]/)[0] === APP_SHELL);
  const canonical = isShellNavigation ? APP_SHELL : new URL(url.pathname, SCOPE.origin).href;
  if (!isShellNavigation && (request.mode === 'navigate' || !CORE_SET.has(canonical))) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(canonical);
    return cached || fetch(request);
  })());
});
