const CACHE_NAME = 'health-ai-dashboard-v1';
const APP_SHELL = ['/', '/manifest.webmanifest', '/app-icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/')));
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkResponse = fetch(request).then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }

        return response;
      });

      return cachedResponse || networkResponse;
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || '/?source=notification&view=weekly',
    self.location.origin,
  ).href;

  event.waitUntil(
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clientList) => {
      const visibleClient = clientList.find((client) =>
        client.url.startsWith(self.location.origin),
      );

      if (visibleClient) {
        if ('navigate' in visibleClient) {
          return visibleClient.navigate(targetUrl).then((client) => client?.focus());
        }

        return visibleClient.focus();
      }

      return self.clients.openWindow(targetUrl);
    }),
  );
});
