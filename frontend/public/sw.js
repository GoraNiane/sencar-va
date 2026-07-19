const CACHE_NAME = 'auto-elite-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/index.css',
  '/src/api.js',
  '/src/components/Header.jsx',
  '/src/components/Footer.jsx',
  '/src/components/Hero.jsx',
  '/src/components/SearchCard.jsx',
  '/src/components/VehicleGrid.jsx',
  '/src/components/VehicleCard.jsx',
  '/src/components/VehicleGallery.jsx',
  '/src/components/TrustStrip.jsx',
  '/src/components/StartupSplash.jsx',
  '/src/components/Icons.jsx',
  '/src/pages/PublicSite.jsx',
  '/src/pages/VehicleDetail.jsx',
  '/src/pages/AdminPage.jsx'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return networkResponse;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
