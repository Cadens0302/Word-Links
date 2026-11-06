'use strict';
// Bump this release whenever any shipped asset changes. Do not activate a new
// release in an open game: its HTML and scripts must remain one coherent set.
const release = 'beacon-wordroom-shell-2026-11-04-2';
const dailyCache = 'beacon-wordroom-daily-v1';
const assets = ["manifest.webmanifest","shared-daily.js","offline-play.js","offline-store.js","crossword.js","index.html","offline.css","app-layout.css","custom-puzzles.css","motion.js","styles.css","presentation.css","age-slider.css","motion.css","action-buttons.css","app-layout.js","mobile-play.js","custom-puzzles.js","mobile-keyboard.js","mobile-polish.css","mobile-play.css","game.js","age-settings.js","clues.js","daily.js","game-directions.js","game-directions.css","levels.js","dictionary-expanded.js","dictionary-extra.js","daily-clock.js","dictionary.js"];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(release).then(cache => cache.addAll(assets)));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if(name.startsWith('beacon-wordroom-shell-') && name !== release) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if(event.request.method !== 'GET' || url.origin !== self.location.origin ||
     !url.href.startsWith(self.registration.scope)) return;
  const relative = url.pathname.slice(new URL(self.registration.scope).pathname.length);
  const asset = relative === '' ? 'index.html' : relative;
  if(relative.startsWith('daily/v1/') && relative.endsWith('.json')) {
    event.respondWith((async () => {
      const cache = await caches.open(dailyCache);
      const cached = await cache.match(event.request);
      try {
        const response = await fetch(event.request);
        if (response.ok) await cache.put(event.request, response.clone());
        return response;
      } catch {
        if (cached) return cached;
        throw new Error('Daily puzzle is not cached for offline use.');
      }
    })());
    return;
  }
  if(!assets.includes(asset)) return;
  event.respondWith((async () => {
    const cache=await caches.open(release);
    return await cache.match(new URL(asset,self.registration.scope).href) || fetch(event.request);
  })());
});
