// Bandlist Service Worker — auto-update
var CACHE = 'bandlist-v' + Date.now();

self.addEventListener('install', function(e){
  // Skip waiting — activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  // Take control of all clients immediately
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    }).then(function(){
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e){
  // Network first — always try to get fresh content.
  // cache:'no-store' forces a real network round-trip and bypasses
  // the browser's own HTTP cache, which could otherwise return a
  // stale response even though this handler is "network first".
  e.respondWith(
    fetch(e.request, {cache: 'no-store'}).then(function(response){
      // Cache the fresh response
      if(response && response.status === 200){
        var copy = response.clone();
        caches.open(CACHE).then(function(cache){
          cache.put(e.request, copy);
        });
      }
      return response;
    }).catch(function(){
      // Fallback to cache if offline
      return caches.match(e.request);
    })
  );
});
