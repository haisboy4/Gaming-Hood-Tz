const state = {
  games: [],
  filtered: []
};

const $ = selector => document.querySelector(selector);


/* =========================================================
   SECURITY
========================================================= */

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {
  const toast = $("#toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}


/* =========================================================
   LOADING SKELETON
========================================================= */

function skeletons(target, count = 4) {
  if (!target) return;

  target.innerHTML = Array.from(
    { length: count },
    () => `
      <article class="game-card">
        <div class="skeleton skeleton-cover"></div>
        <div class="skeleton skeleton-info"></div>
      </article>
    `
  ).join("");
}


/* =========================================================
   NORMALIZE DECАP DATABASE
========================================================= */

function normalizeGames(data) {

  return data.map((game, index) => {

    /*
     * Decap CMS uses snake_case.
     * This function converts everything into one
     * consistent format for the website.
     */

    const genre = Array.isArray(game.genre)
      ? game.genre.filter(Boolean)
      : [];

    const tags = Array.isArray(game.tags)
      ? game.tags.filter(Boolean)
      : [];

    /*
     * Combine genre + tags for searching.
     */

    const allTags = [
      ...genre,
      ...tags
    ]
      .map(value => String(value).trim())
      .filter(Boolean);


    return {

      id: game.id || game.slug || `game-${index + 1}`,

      title: game.title || "Untitled Game",

      slug: game.slug || game.id || "",

      platform: game.platform || "Other",

      emulator: game.emulator || "",

      genre,

      tags,

      allTags,

      image: game.image || "",

      description: game.description || "",

      size: game.size_gb || game.size || "",

      build: game.build || "",

      releaseYear:
        game.release_year ||
        game.releaseYear ||
        "",

      minRam:
        game.min_ram ||
        "",

      recommendedRam:
        game.recommended_ram ||
        "",

      gpu:
        game.gpu ||
        "",

      android:
        game.android_support ||
        "",

      offline:
        typeof game.offline === "boolean"
          ? game.offline
          : null,

      controller:
        typeof game.controller_support === "boolean"
          ? game.controller_support
          : null,

      multiplayer:
        typeof game.multiplayer === "boolean"
          ? game.multiplayer
          : null,

      vulkan:
        typeof game.vulkan_required === "boolean"
          ? game.vulkan_required
          : null,

      fpsLow: game.fps_low || "",

      fpsMid: game.fps_mid || "",

      fpsHigh: game.fps_high || "",

      download:
        game.download_link ||
        game.download ||
        "",

      emulatorLink:
        game.emulator_link ||
        "",

      views:
        Number(game.views || 0),

      added:
        game.added || new Date().toISOString()

    };

  });

}


/* =========================================================
   GAME CARD
========================================================= */

function gameCard(game) {

  const title = escapeHTML(game.title);

  const platform =
    escapeHTML(game.platform || "Game");

  const emulator =
    game.emulator
      ? escapeHTML(game.emulator)
      : "";

  const build =
    game.build
      ? escapeHTML(game.build)
      : "";

  /*
   * Prefer genres, then tags.
   */

  const cardTags = (
    game.genre.length
      ? game.genre
      : game.tags
  ).slice(0, 2);


  const cover = game.image

    ? `
      <img
        src="${escapeHTML(game.image)}"
        alt="${title}"
        loading="lazy"
      >
    `

    : `
      <div class="cover-placeholder">
        ${title}
      </div>
    `;


  return `

    <article class="game-card">

      <a
        href="game.html?id=${encodeURIComponent(game.id)}"
        aria-label="Open ${title}"
      >

        <div class="cover">

          ${cover}

          <span class="platform-badge">
            ${platform}
          </span>

          ${
            build
              ? `
                <span class="build-badge">
                  ${build}
                </span>
              `
              : ""
          }

        </div>


        <div class="card-info">

          <h3 class="card-title">
            ${title}
          </h3>


          <p class="card-meta">

            ${
              emulator ||
              platform
            }

            ${
              game.size
                ? ` • ${escapeHTML(game.size)}`
                : ""
            }

          </p>


          ${
            cardTags.length

              ? `
                <div class="card-tags">

                  ${
                    cardTags
                      .map(
                        tag => `
                          <span class="tag">
                            ${escapeHTML(
                              String(tag).trim()
                            )}
                          </span>
                        `
                      )
                      .join("")
                  }

                </div>
              `

              : ""
          }

        </div>

      </a>

    </article>

  `;
}


/* =========================================================
   GRID
========================================================= */

function renderGrid(target, games) {

  if (!target) return;

  target.innerHTML = games.length
    ? games.map(gameCard).join("")
    : "";
}


/* =========================================================
   HOME PAGE
========================================================= */

function renderHome() {

  const newest = [...state.games]

    .sort(
      (a, b) =>
        new Date(b.added || 0) -
        new Date(a.added || 0)
    )

    .slice(0, 8);


  const top = [...state.games]

    .sort(
      (a, b) =>
        b.views - a.views
    )

    .slice(0, 8);


  renderGrid(
    $("#recentGrid"),
    newest
  );


  renderGrid(
    $("#topGrid"),
    top
  );


  renderGrid(
    $("#allGrid"),
    state.filtered
  );


  updateResults();

}


/* =========================================================
   RESULTS
========================================================= */

function updateResults() {

  const count = state.filtered.length;

  const resultCount =
    $("#resultCount");

  const emptyState =
    $("#emptyState");


  if (resultCount) {

    resultCount.textContent =
      `${count} game${count === 1 ? "" : "s"}`;

  }


  if (emptyState) {

    emptyState.hidden =
      count !== 0;

  }

}


/* =========================================================
   SEARCH
========================================================= */

function filterGames(query) {

  const q =
    String(query || "")
      .trim()
      .toLowerCase();


  state.filtered = !q

    ? [...state.games]

    : state.games.filter(game => {

        const haystack = [

          game.title,

          game.slug,

          game.platform,

          game.emulator,

          game.description,

          game.size,

          game.build,

          game.gpu,

          game.android,

          ...game.genre,

          ...game.tags

        ]

          .join(" ")

          .toLowerCase();


        return haystack.includes(q);

      });


  renderGrid(
    $("#allGrid"),
    state.filtered
  );


  updateResults();


  document
    .querySelector("#games")
    ?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

}


/* =========================================================
   DRAWER
========================================================= */

function openDrawer() {

  $("#drawer")?.classList.add("open");

  $("#drawerBackdrop")
    ?.classList.add("open");

  $("#drawer")
    ?.setAttribute(
      "aria-hidden",
      "false"
    );

  $("#menuBtn")
    ?.setAttribute(
      "aria-expanded",
      "true"
    );

}


function closeDrawer() {

  $("#drawer")
    ?.classList.remove("open");

  $("#drawerBackdrop")
    ?.classList.remove("open");

  $("#drawer")
    ?.setAttribute(
      "aria-hidden",
      "true"
    );

  $("#menuBtn")
    ?.setAttribute(
      "aria-expanded",
      "false"
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

  $("#menuBtn")
    ?.addEventListener(
      "click",
      openDrawer
    );


  $("#closeDrawer")
    ?.addEventListener(
      "click",
      closeDrawer
    );


  $("#drawerBackdrop")
    ?.addEventListener(
      "click",
      closeDrawer
    );


  document
    .querySelectorAll(".nav-drop")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const target =
            document.getElementById(
              button.dataset.target
            );

          if (!target) return;


          target.classList.toggle(
            "open"
          );


          const arrow =
            button.querySelector(
              "span"
            );


          if (arrow) {

            arrow.textContent =
              target.classList.contains("open")
                ? "⌃"
                : "⌄";

          }

        }
      );

    });


  document
    .querySelectorAll(".drawer a")
    .forEach(link => {

      link.addEventListener(
        "click",
        () => {

          if (
            !link.classList.contains(
              "nav-drop"
            )
          ) {

            closeDrawer();

          }

        }
      );

    });


  $("#searchBtn")
    ?.addEventListener(
      "click",
      () => {

        $("#heroSearchInput")
          ?.focus();

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

      }
    );


  $("#randomBtn")
    ?.addEventListener(
      "click",
      () => {

        if (!state.games.length)
          return;


        const game =
          state.games[
            Math.floor(
              Math.random() *
              state.games.length
            )
          ];


        location.href =
          `game.html?id=${encodeURIComponent(
            game.id
          )}`;

      }
    );


  $("#heroSearchBtn")
    ?.addEventListener(
      "click",
      () => {

        filterGames(
          $("#heroSearchInput")
            ?.value || ""
        );

      }
    );


  $("#heroSearchInput")
    ?.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Enter"
        ) {

          filterGames(
            event.target.value
          );

        }

      }
    );


  $("#librarySearchInput")
    ?.addEventListener(
      "input",
      event => {

        filterGames(
          event.target.value
        );

      }
    );


  $("#drawerSearchForm")
    ?.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        closeDrawer();

        filterGames(
          $("#drawerSearchInput")
            ?.value || ""
        );

      }
    );

}


/* =========================================================
   LOAD DATABASE
========================================================= */

async function loadGames() {

  const recent =
    $("#recentGrid");

  const top =
    $("#topGrid");

  const all =
    $("#allGrid");


  skeletons(
    recent,
    4
  );

  skeletons(
    top,
    4
  );

  skeletons(
    all,
    8
  );


  try {

    const response =
      await fetch(
        "./games.json",
        {
          cache: "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        "Could not load games.json"
      );

    }


    const data =
      await response.json();


    state.games =
      normalizeGames(
        Array.isArray(data.games)
          ? data.games
          : []
      );


    state.filtered =
      [...state.games];


    renderHome();


  } catch (error) {

    console.error(error);


    if (recent)
      recent.innerHTML = "";


    if (top)
      top.innerHTML = "";


    if (all) {

      all.innerHTML = `
        <p class="empty-state">
          The game database could not be loaded.
        </p>
      `;

    }


    showToast(
      "Could not load the game database"
    );

  }

}


/* =========================================================
   PWA
========================================================= */

function setupPWA() {

  if (
    "serviceWorker" in navigator
  ) {

    window.addEventListener(
      "load",
      () => {

        navigator
          .serviceWorker
          .register(
            "./service-worker.js"
          )

          .catch(
            error =>
              console.warn(
                "Service worker:",
                error
              )
          );

      }
    );

  }

}


/* =========================================================
   START
========================================================= */

const year =
  $("#year");

if (year) {

  year.textContent =
    new Date().getFullYear();

}


setupNavigation();

setupPWA();

loadGames();
