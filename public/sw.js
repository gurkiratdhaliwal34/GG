/* ==========================================================================
   Summit Tire & Wheels — service worker

   The point of this is the phone number. Someone with a flat on Highway 97
   likely has one bar of signal, so the pages, the stylesheet and the logo are
   precached and served without waiting on the network.

   Bump CACHE when any precached file changes, or visitors keep the old copy.
   ========================================================================== */

'use strict';

var CACHE = 'summit-v5';

/* The shell: everything needed to read the site and find the number.
   BG1.png is deliberately absent — it's 1.6MB, and precaching it would mean a
   slow first install on the same weak connection this exists to work around.
   It gets cached on first view instead, by the fetch handler below. */
var SHELL = [
  './',
  './services/',
  './quotes/',
  './about/',
  './styles.css',
  './site.js',
  './logo-mark.png',
  './favicon-192x192.png',
  './manifest.webmanifest',
  './Logo1.svg',
  './Logo2.svg',
  './Logo3.svg',
  './Logo4.svg',
  './Logo5.svg',
  './Logo6.svg',
  './Logo7.svg',
  './Logo8.svg',
  './Logo9.svg'
];

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      /* Individual puts rather than cache.addAll: addAll rejects as a unit, so
         one missing file would throw away the whole install. */
      return Promise.all(SHELL.map(function (url) {
        return cache.add(new Request(url, { cache: 'reload' }))['catch'](function () {
          /* Ignore — a missing asset shouldn't block the rest. */
        });
      }));
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.map(function (name) {
        return name === CACHE ? null : caches['delete'](name);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;

  if (req.method !== 'GET') return;

  var url = new URL(req.url);

  /* Leave other origins alone. Google Fonts responses are opaque, so caching
     them is guesswork; the stylesheet already falls back to system-ui. */
  if (url.origin !== self.location.origin) return;

  /* Pages: network first, so edits reach people who already installed the app.
     Fall back to the cached page, then to the home page. */
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      })['catch'](function () {
        return caches.match(req).then(function (hit) {
          return hit || caches.match('./');
        });
      })
    );
    return;
  }

  /* Everything else is versioned by hand and rarely changes: serve from cache
     and top the cache up in the background. */
  event.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
