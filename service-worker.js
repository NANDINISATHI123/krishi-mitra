// --- Service Worker for Krishi Mitra ---

const CACHE_NAME = 'krishi-mitra-static-v11'; // INCREMENTED VERSION
const DYNAMIC_CACHE_NAME = 'krishi-mitra-dynamic-v11'; // INCREMENTED VERSION

// App Shell: All the essential files for the app to run.
const APP_SHELL_FILES = [
  './',
  'index.html',
  'manifest.json',
  'logo.svg',
];


self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Precaching App Shell...');
      return cache.addAll(APP_SHELL_FILES);
    }).then(() => self.skipWaiting()) // Force the new service worker to activate immediately
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
    }).then(() => self.clients.claim()) // Take control of all open pages
  );
});

// A robust, standard stale-while-revalidate fetch handler
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignore API calls to Netlify functions
    if (url.pathname.startsWith('/.netlify/functions/')) {
        return; 
    }
    
    // Ignore cross-origin requests (e.g., Google Fonts, CDNs)
    if (url.origin !== self.location.origin) {
        return;
    }

    // For navigation requests (the HTML page itself), go network-first.
    // This ensures users get the latest HTML, but falls back to cache if offline.
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => {
                console.log('[SW] Fetch failed for navigation, serving app shell from cache.');
                return caches.match('index.html');
            })
        );
        return;
    }

    // For all other assets (TSX, CSS, images), use Stale-While-Revalidate.
    // This serves the cached version immediately for speed, then updates the cache
    // in the background with a fresh network request.
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            const fetchPromise = fetch(request).then(networkResponse => {
                // If we get a valid response, update the dynamic cache.
                caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                    cache.put(request, networkResponse.clone());
                });
                return networkResponse;
            }).catch(err => {
                console.warn(`[SW] Fetch failed for ${request.url}. Serving from cache if available.`, err);
                // If fetch fails and we have a cached response, it will have already been returned.
            });

            // Return cached response immediately if it exists, otherwise wait for the network.
            return cachedResponse || fetchPromise;
        })
    );
});