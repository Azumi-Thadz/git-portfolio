if ("serviceWorker" in navigator) {
  navigator
   .serviceWorker   
   .register("service-worker.js")          
   .then(function(reg) {            
     console.log("Registred with scope: ",reg.scope);          
   })          
   .catch(function(err) {
     console.log("ServiceWorker registration failed: ", err);               });
}

let cacheName = "myappCache";
var filesToCache = [
  "index.html",
  "js/site.js",
  "css/style.css",
  "images/favicon.png",
  "images/desktop-bg.jpg",
  "images/mobile-bg-copy.jpg",
  "images/og-image.jpg"
];
self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(
        keyList.map(function(key) {
          if (key !== cacheName) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener("fetch", function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        return response;
      } else {
        return fetch(event.request)
          .then(function(res) {
            return caches.open(cacheName).then(function(cache) {
              cache.put(event.request.url, res.clone());
              return res;
            });
          })
          .catch(function(err) {
            return caches.open(cacheName).then(function(cache) {
              return cache.match("/offline.html");
            });
          });
      }
    })
  );
});

