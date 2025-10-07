// --- Service Worker for Krishi Mitra ---

const CACHE_NAME = 'krishi-mitra-static-v7'; // INCREMENTED VERSION TO FORCE UPDATE
const DYNAMIC_CACHE_NAME = 'krishi-mitra-dynamic-v7'; // INCREMENTED VERSION

// App Shell: All the essential files for the app to run.
// Using absolute paths for robustness on deployed environments.
const APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.svg',
];


self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Precaching App Shell...');
      return cache.addAll(APP_SHELL_FILES).then(() => self.skipWaiting()); // Force activation
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
    }).then(() => self.clients.claim()) // Take control of all open clients
  );
});

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle GET requests
    if (request.method !== 'GET') {
        return;
    }

    // --- STRATEGY 1: TSX/TS to JS rewrite for local files ---
    // Intercept requests for '.js' files that are actually '.tsx' or '.ts' files.
    if (url.origin === self.location.origin && url.pathname.endsWith('.js')) {
        event.respondWith(
            (async () => {
                const tsxPath = url.pathname.replace(/\.js$/, '.tsx');
                const tsPath = url.pathname.replace(/\.js$/, '.ts');

                try {
                    // Try fetching the .tsx version first
                    const tsxResponse = await fetch(tsxPath);
                    if (tsxResponse.ok) {
                        const code = await tsxResponse.text();
                        return new Response(code, { headers: { 'Content-Type': 'application/javascript' } });
                    }
                } catch (e) { /* Fall through */ }
                
                try {
                    // If .tsx fails, try the .ts version
                    const tsResponse = await fetch(tsPath);
                    if (tsResponse.ok) {
                        const code = await tsResponse.text();
                        return new Response(code, { headers: { 'Content-Type': 'application/javascript' } });
                    }
                } catch (e) { /* Fall through */ }

                // If neither .tsx nor .ts is found, try fetching the original .js from cache/network
                const cacheResponse = await caches.match(request);
                if (cacheResponse) return cacheResponse;
                return fetch(request);
            })()
        );
        return;
    }


    // --- STRATEGY 2: Network-Only for Cross-Origin ---
    if (url.origin !== self.location.origin) {
        event.respondWith(fetch(request));
        return;
    }

    // --- STRATEGY 3: Cache-First for Local Media ---
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
        return;
    }
    
    // --- STRATEGY 4: Stale-While-Revalidate for App Assets ---
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
});