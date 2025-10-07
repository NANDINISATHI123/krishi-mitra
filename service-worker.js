// --- Service Worker for Krishi Mitra ---

const CACHE_NAME = 'krishi-mitra-static-v10'; // INCREMENTED VERSION TO FORCE UPDATE
const DYNAMIC_CACHE_NAME = 'krishi-mitra-dynamic-v10'; // INCREMENTED VERSION

// App Shell: All the essential files for the app to run.
// Using relative paths for robustness on deployed environments.
const APP_SHELL_FILES = [
  'index.html',
  'manifest.json',
  'logo.svg',
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
    
    // --- FIX: Exclude Netlify functions from interception ---
    if (url.pathname.startsWith('/.netlify/functions/')) {
        return; // Let the browser handle this network request normally.
    }

    // --- STRATEGY 1A: Fix MIME type for direct TSX/TS requests ---
    // Handles index.tsx from index.html and any other direct .ts(x) requests.
    if (url.origin === self.location.origin && (url.pathname.endsWith('.tsx') || url.pathname.endsWith('.ts'))) {
        event.respondWith(
            fetch(request).then(response => {
                if (response.ok) {
                    return response.text().then(code => {
                        return new Response(code, {
                            headers: { 'Content-Type': 'application/javascript' }
                        });
                    });
                }
                return response;
            }).catch(err => {
                 console.error('[SW] Fetch failed for TS(X) file, trying cache.', err);
                 return caches.match(request);
            })
        );
        return;
    }

    // --- IMPROVED: STRATEGY 1B: TSX/TS to JS rewrite for module imports with Caching ---
    if (url.origin === self.location.origin && url.pathname.endsWith('.js')) {
        event.respondWith(
            caches.match(request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                const fetchAndCache = async (path) => {
                    try {
                        const response = await fetch(path);
                        if (response.ok) {
                            const code = await response.text();
                            const jsResponse = new Response(code, { headers: { 'Content-Type': 'application/javascript' } });
                            
                            const cache = await caches.open(DYNAMIC_CACHE_NAME);
                            cache.put(request, jsResponse.clone());

                            return jsResponse;
                        }
                    } catch (e) { /* Ignore fetch errors */ }
                    return null;
                };
                
                return (async () => {
                    const tsxPath = url.pathname.replace(/\.js$/, '.tsx');
                    const tsPath = url.pathname.replace(/\.js$/, '.ts');

                    const tsxResult = await fetchAndCache(tsxPath);
                    if (tsxResult) return tsxResult;

                    const tsResult = await fetchAndCache(tsPath);
                    if (tsResult) return tsResult;
                    
                    // Fallback for real .js files (e.g., from importmap)
                    return fetch(request);
                })();
            })
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