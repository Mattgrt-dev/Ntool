/* NTOOL : hors ligne + mise à jour automatique. Version 20261026-084350 */
var CACHE = 'ntool-20261026-084350';
var SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }));
  self.skipWaiting();
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }));
  self.clients.claim();
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var u = new URL(e.request.url);
  if (u.origin === location.origin) {
    /* l'app : réseau d'abord (récupère les mises à jour), cache si hors ligne */
    e.respondWith(fetch(e.request).then(function (r) { var cp = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, cp); }); return r; })
      .catch(function () { return caches.match(e.request).then(function (r) { return r || caches.match('./index.html'); }); }));
  } else {
    /* bibliothèques et polices : cache d'abord */
    e.respondWith(caches.match(e.request).then(function (r) { return r || fetch(e.request).then(function (res) { var cp = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, cp); }); return res; }); }));
  }
});
