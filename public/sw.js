// Check First service worker: makes the app work offline after one visit.
//
// - Pages: try the network first (fresh content), fall back to the cached copy.
// - /_next/static files and fonts: have a version hash in their name, so the
//   cached copy is always right (cache first).
// - /api is never cached — we never store users' messages.

const CACHE = "checkfirst-v3";
const PAGES = ["/", "/learn", "/verify", "/help"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PAGES)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Delete caches from older versions of this file.
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// The page sends the files it already loaded, so they work offline right away.
self.addEventListener("message", (event) => {
  if (event.data?.type === "CACHE_URLS") {
    caches.open(CACHE).then((cache) => cache.addAll(event.data.urls).catch(() => {}));
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/__nextjs_font/")) {
    event.respondWith(caches.match(request).then((hit) => hit || fetchAndCache(request)));
    return;
  }

  // Everything else (pages, page data): network first, cache as backup.
  event.respondWith(
    fetchAndCache(request).catch(() =>
      caches.match(request, { ignoreSearch: true }).then((hit) => hit || caches.match("/")),
    ),
  );
});

async function fetchAndCache(request) {
  const response = await fetch(request);
  if (response.ok) {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(request, copy));
  }
  return response;
}
