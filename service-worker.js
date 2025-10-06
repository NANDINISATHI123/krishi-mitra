--- START OF FILE service-worker.js ---
// --- Service Worker for Krishi Mitra ---

const CACHE_NAME = 'krishi-mitra-static-v1';
const DYNAMIC_CACHE_NAME = 'krishi-mitra-dynamic-v1';

// App Shell: All the essential files for the app to run.
// Caching only the minimal shell prevents installation errors in environments
// that transpile TSX/JS modules on the fly. Other assets are cached dynamically.
const APP_SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './logo.svg',
];


self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Precaching App Shell...');
      return cache.addAll(APP_SHELL_FILES);
    })
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
          console.log('[SW] Removing old cache:', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // --- STRATEGY 1: Network-Only for Cross-Origin ---
    // If the request is for a different origin (e.g., Supabase API, Google Fonts, CDNs),
    // always fetch from the network. This prevents CORS errors when the service worker
    // tries to cache resources from third-party domains.
    if (url.origin !== self.location.origin) {
        event.respondWith(fetch(request));
        return;
    }

    // --- STRATEGY 2: Cache-First for Local Media ---
    // For same-origin media files (like downloaded videos), serve from cache first for speed.
    // Fall back to network if not in cache.
    if (url.pathname.match(/\.(mp4|jpg|png|jpeg|svg|gif)$/)) {
        event.respondWith(
            caches.match(request).then(response => {
                return response || fetch(request).then(fetchRes => {
                    return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                        cache.put(request.url, fetchRes.clone());
                        return fetchRes;
                    });
                });
            })
        );
    // --- STRATEGY 3: Stale-While-Revalidate for App Assets ---
    // For the app shell and other same-origin assets (HTML, JS), serve from cache immediately
    // for a fast perceived load, and then update the cache with a fresh version from the network.
    } else {
        event.respondWith(
            caches.match(request).then(response => {
                const fetchPromise = fetch(request).then(networkResponse => {
                    caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                        cache.put(request, networkResponse.clone());
                    });
                    return networkResponse;
                }).catch(err => {
                     console.warn('[SW] Fetch failed, serving from cache if available.', err);
                });
                return response || fetchPromise;
            })
        );
    }
});
--- END OF FILE service-worker.js ---
