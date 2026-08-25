const CACHE_NAME = "gaming-hood-v4";

const APP_SHELL = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./games.json",
  "./manifest.json",
  "./game.html",
  "./js/game-page.js"
];


/*
|--------------------------------------------------------------------------
| INSTALL
|--------------------------------------------------------------------------
*/

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())

  );

});


/*
|--------------------------------------------------------------------------
| ACTIVATE
|--------------------------------------------------------------------------
*/

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(keys => {

        return Promise.all(

          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))

        );

      })
      .then(() => self.clients.claim())

  );

});


/*
|--------------------------------------------------------------------------
| FETCH
|--------------------------------------------------------------------------
*/

self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") {
    return;
  }


  const url = new URL(event.request.url);


  /*
  |--------------------------------------------------------------------------
  | games.json
  |
  | ALWAYS try the network first.
  | This means new games added through Decap CMS
  | appear without waiting for an old cache.
  |--------------------------------------------------------------------------
  */

  if (
    url.pathname.endsWith("/games.json")
  ) {

    event.respondWith(

      fetch(event.request, {
        cache: "no-store"
      })

      .then(response => {

        if (
          response &&
          response.ok
        ) {

          const copy =
            response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {

              cache.put(
                event.request,
                copy
              );

            });

        }

        return response;

      })

      .catch(() => {

        return caches.match(
          event.request
        );

      })

    );

    return;
  }


  /*
  |--------------------------------------------------------------------------
  | STATIC FILES
  |
  | Cache first for CSS, JS, images, etc.
  |--------------------------------------------------------------------------
  */

  event.respondWith(

    caches.match(
      event.request
    )

    .then(cached => {

      if (cached) {
        return cached;
      }


      return fetch(
        event.request
      )

      .then(response => {

        if (
          !response ||
          response.status !== 200 ||
          response.type === "opaque"
        ) {

          return response;

        }


        const copy =
          response.clone();


        caches.open(CACHE_NAME)
          .then(cache => {

            cache.put(
              event.request,
              copy
            );

          });


        return response;

      })

      .catch(() => {

        return caches.match(
          "./index.html"
        );

      });

    })

  );

});
