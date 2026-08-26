const CACHE_NAME = "gaming-hood-v5";

const APP_SHELL = [
  "./",
  "./index.html",
  "./css/style.css",
  "./css/game.css",
  "./js/app.js",
  "./js/game-page.js",
  "./data/games.json",
  "./manifest.json",
  "./game.html"
];


/*
|--------------------------------------------------------------------------
| INSTALL
|--------------------------------------------------------------------------
*/

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)

      .then(cache => {

        return cache.addAll(APP_SHELL);

      })

      .then(() => {

        return self.skipWaiting();

      })

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

      .then(() => {

        return self.clients.claim();

      })

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


  const url = new URL(
    event.request.url
  );


  /*
  |--------------------------------------------------------------------------
  | GAME DATABASE
  |
  | data/games.json is the ONLY database.
  |
  | Always try the network first so games
  | published through Decap CMS appear quickly.
  |--------------------------------------------------------------------------
  */

  if (
    url.pathname.endsWith("/data/games.json")
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
  | ADMIN / DECAP CMS
  |
  | Do NOT cache the CMS configuration or
  | admin pages. They need to come directly
  | from Netlify/GitHub.
  |--------------------------------------------------------------------------
  */

  if (
    url.pathname.includes("/admin/")
  ) {

    event.respondWith(

      fetch(event.request, {
        cache: "no-store"
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
  | Cache first for CSS, JavaScript,
  | images and other static resources.
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
