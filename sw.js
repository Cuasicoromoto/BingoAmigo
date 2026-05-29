const CACHE_NAME = 'bingo-amigo-v1.3';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './html5-qrcode.js',
    './qr-bingo.png',
    './icon-192.png',
    './icon-512.png',
    './icon-512-maskable.png'
];

// Instalación: Guardar archivos
self.addEventListener('install', (event) => {
    // Forzar que el SW se instale sin esperar
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Activación: Limpiar versiones viejas
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Mensaje para forzar actualización
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});

// Estrategia Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                    });
                }
                return networkResponse;
            }).catch(() => { });
            return cachedResponse || fetchPromise;
        })
    );
});
