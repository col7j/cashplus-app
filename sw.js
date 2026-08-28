const CACHE_NAME = 'cashplus-finance-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/fonts.css',
  './css/design-system.css',
  './css/layout.css',
  './css/components.css',
  './css/animations.css',
  './assets/logo-icon.svg',
  './js/app.js',
  './js/icons.js',
  './js/engine/db.js',
  './js/engine/firebase.js',
  './js/engine/financialEngine.js',
  './js/engine/smsParser.js',
  './js/engine/insightsEngine.js',
  './js/views/dashboardView.js',
  './js/views/transactionsView.js',
  './js/views/accountsView.js',
  './js/views/budgetsView.js',
  './js/views/savingsView.js',
  './js/views/investmentsView.js',
  './js/views/obligationsView.js',
  './js/views/debtsView.js',
  './js/views/purchasesView.js',
  './js/views/analyticsView.js',
  './js/views/settingsView.js',
  './js/views/landingView.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch background update
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Return cached index.html for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
