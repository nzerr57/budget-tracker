//Files to cache for offline use
const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./index.js",
    "./styles.css",
    "./icons/icon-192x192.png",
    "./icons/icon-512x512.png",
    "./manifest.webmanifest.json",
    "./db.js",
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
  ];
  
  const CACHE_NAME = 'static-cache-v1';
const DATA_CACHE_NAME = 'data-cache-v1';

// install service worker
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Files were pre-cached successfully!');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// fetch information from cache
self.addEventListener('fetch', (e) => {
    if (e.request.url.includes('/api/')) {
        console.log('[Service Worker] Fetch(data)', e.request.url);
        e.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                    return fetch(e.request)
                        .then(res => {
                            // stores into cache if successful
                            if (res.status === 200) {
                                cache.put(e.request.url, res.clone());
                            }

                            return res;
                        }).catch(err => cache.match(e.request));
                }).catch(err => console.log(err))
        );
        return;
    }
    e.respondWith(
        caches.match(e.request)
            .then(res => res || fetch(e.request))
    );
});

// activate service worker
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log('Removing old cache data', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});