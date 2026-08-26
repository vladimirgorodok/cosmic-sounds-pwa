// Service Worker для Космической Станции — Звуки Космоса
const CACHE_NAME = 'cosmic-sounds-v1';
const STATIC_ASSETS = [
  '/cosmic-sounds-pwa/',
  '/cosmic-sounds-pwa/index.html',
  '/cosmic-sounds-pwa/css/style.css',
  '/cosmic-sounds-pwa/js/app.js',
  '/cosmic-sounds-pwa/js/data.js',
  '/cosmic-sounds-pwa/manifest.json',
  '/cosmic-sounds-pwa/icons/favicon.svg',
  '/cosmic-sounds-pwa/icons/icon-72x72.svg',
  '/cosmic-sounds-pwa/icons/icon-96x96.svg',
  '/cosmic-sounds-pwa/icons/icon-128x128.svg',
  '/cosmic-sounds-pwa/icons/icon-144x144.svg',
  '/cosmic-sounds-pwa/icons/icon-192x192.svg',
  '/cosmic-sounds-pwa/icons/icon-512x512.svg',
  '/cosmic-sounds-pwa/images/hero-bg.jpg',
  '/cosmic-sounds-pwa/images/meditation.jpg',
  '/cosmic-sounds-pwa/images/energy-body.jpg',
  '/cosmic-sounds-pwa/images/space-station.jpg'
];

// Установка — кэшируем статические ресурсы
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Кэширование статических ресурсов');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((err) => {
        console.warn('[SW] Некоторые ресурсы не закэшированы:', err);
      })
  );
  self.skipWaiting();
});

// Активация — очистка старых кэшей
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Удаление старого кэша:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch — стратегия Cache First, затем Network
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Пропускаем не-GET запросы
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Возвращаем из кэша и обновляем в фоне
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, networkResponse.clone());
                });
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        // Если нет в кэше — идём в сеть
        return fetch(request)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // Кэшируем новые ресурсы
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });

            return networkResponse;
          })
          .catch(() => {
            // Оффлайн-заглушка для HTML
            if (request.destination === 'document') {
              return caches.match('/cosmic-sounds-pwa/index.html');
            }
            return new Response('Оффлайн режим', { status: 503 });
          });
      })
  );
});

// Push-уведомления (для напоминаний о практике)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '⭐ Время практики!';
  const options = {
    body: data.body || 'Настало время космических звуков. Потратьте несколько минут на себя.',
    icon: '/cosmic-sounds-pwa/icons/icon-192x192.svg',
    badge: '/cosmic-sounds-pwa/icons/icon-72x72.svg',
    tag: 'cosmic-practice',
    requireInteraction: false,
    actions: [
      { action: 'practice', title: 'Практиковать' },
      { action: 'dismiss', title: 'Отложить' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Клик по уведомлению
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'practice') {
    event.waitUntil(
      clients.openWindow('/cosmic-sounds-pwa/?tab=practice')
    );
  } else {
    event.waitUntil(
      clients.openWindow('/cosmic-sounds-pwa/')
    );
  }
});
