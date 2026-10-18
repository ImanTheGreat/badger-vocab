/* Badger Vocab. Copyright (c) 2026 Iman Lloyd. PolyForm Noncommercial License 1.0.0 (see LICENSE.md).
   Required Notice: Copyright (c) 2026 Iman Lloyd. Badger Vocab was made by Iman Lloyd as a gift to the University of Wisconsin-Madison Language Department. */
/* Offline support for the hosted web app.
   The first visit saves every file below on the device; after that the app opens with no internet.
   When you change any file, bump VERSION so devices download the new copy. */
const VERSION = "badger-vocab-v5";
const FILES = ["./", "index.html", "style.css", "app.js", "free.js", "break.js", "data/chess-puzzles.js",
  "manifest.webmanifest", "icons/icon.svg", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)
    // The Arabic word list is optional (left out of the public GitHub copy), so a missing file is fine.
    .then(() => c.add("data/arabic-words.js").catch(() => {})))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // e.g. Google voice: straight to the network
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request)));
});
