const state = {
  games: [],
  filtered: []
};

const $ = (selector) => document.querySelector(selector);

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

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

function skeletons(target, count = 4) {
  if (!target) return;

  target.innerHTML = Array.from({ length: count }, () => `
    <article class="game-card">
      <div class="skeleton skeleton-cover"></div>
      <div class="skeleton skeleton-info"></div>
    </article>
  `).join("");
}

function gameCard(game) {
  const title = escapeHTML(game.title);
  const platform = escapeHTML(game.platform || "Game");
  const emulator = game.emulator
    ? escapeHTML(game.emulator)
    : "";

  const build = game.build
    ? escapeHTML(game.build)
    : "";

  const tags = Array.isArray(game.tags)
    ? game.tags.slice(0, 2)
    : [];

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
              ? `<span class="build-badge">${build}</span>`
              : ""
          }

        </div>

        <div class="card-info">

          <h3 class="card-title">
            ${title}
          </h3>

          <p class="card-meta">
            ${emulator || platform}
            ${
              game.size
                ? ` • ${escapeHTML(game.size)}`
                : ""
            }
          </p>

          ${
            tags.length
              ? `
                <div class="card-tags">
                  ${tags.map(tag => `
                    <span class="tag">
                      ${escapeHTML(tag)}
                    </span>
                  `).join("")}
                </div>
              `
              : ""
          }

        </div>

      </a>
    </article>
  `;
}

function renderGrid(target, games) {
  if (!target) return;

  target.innerHTML = games.length
    ? games.map(gameCard).join("")
    : "";
}


/*
|--------------------------------------------------------------------------
| Convert Decap CMS JSON → Website format
|--------------------------------------------------------------------------
*/

function normalizeGames(data) {

  return data.map((game, index) => {

    return {

      id:
        game.slug ||
        game.id ||
        `game-${index + 1}`,

      title:
        game.title ||
        "Untitled Game",

      platform:
        game.platform ||
        "Other",

      emulator:
        game.emulator ||
        "",

      image:
        game.image ||
        "",

      /*
       * Decap:
       * size_gb
       *
       * Website:
       * size
       */
      size:
        game.size_gb ||
        game.size ||
        "",

      build:
        game.build ||
        "",

      description:
        game.description ||
        "",

      tags:
        Array.isArray(game.tags)
          ? game.tags
          : [],

      genre:
        Array.isArray(game.genre)
          ? game.genre
          : [],

      views:
        Number(game.views || 0),

      added:
        game.added ||
        "",

      /*
       * Convert Decap field names
       */

      releaseYear:
        game.release_year ||
        game.releaseYear ||
        "",

      download:
        game.download_link ||
        game.download ||
        "",

      emulatorLink:
        game.emulator_link ||
        game.emulatorLink ||
        "",

      requirements: {

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

        vulkan:
          game.vulkan_required === true

      },

      features: {

        offline:
          game.offline === true,

        controller:
          game.controller_support === true,

        multiplayer:
          game.multiplayer === true

      },

      fps: {

        low:
          game.fps_low ||
          "",

        medium:
          game.fps_mid ||
          "",

        high:
          game.fps_high ||
          ""

      }

    };

  });

}


/*
|--------------------------------------------------------------------------
| Load games
|--------------------------------------------------------------------------
*/

async function loadGames() {

  const recent = $("#recentGrid");
  const top = $("#topGrid");
  const all = $("#allGrid");

  skeletons(recent, 4);
  skeletons(top, 4);
  skeletons(all, 8);

  try {

    /*
     * IMPORTANT:
     * cache-busting prevents an old games.json
     * from being reused.
     */

    const response = await fetch(
      `games.json?v=${Date.now()}`,
      {
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error(
        `Could not load games.json (${response.status})`
      );
    }

    const data = await response.json();

    console.log("Gaming Hood database:", data);

    state.games = normalizeGames(
      Array.isArray(data.games)
        ? data.games
        : []
    );

    state.filtered = [...state.games];

    renderHome();

  } catch (error) {

    console.error(
      "Gaming Hood database error:",
      error
    );

    if (recent) recent.innerHTML = "";
    if (top) top.innerHTML = "";

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


/*
|--------------------------------------------------------------------------
| Homepage
|--------------------------------------------------------------------------
*/

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

  updateResultCount();

}


/*
|--------------------------------------------------------------------------
| Search
|--------------------------------------------------------------------------
*/

function filterGames(query) {

  const q =
    query
      .trim()
      .toLowerCase();

  state.filtered =
    !q
      ? [...state.games]
      : state.games.filter(game => {

          const haystack = [

            game.title,
            game.platform,
            game.emulator,
            game.description,

            ...(game.tags || []),
            ...(game.genre || [])

          ]
          .join(" ")
          .toLowerCase();

          return haystack.includes(q);

        });

  renderGrid(
    $("#allGrid"),
    state.filtered
  );

  updateResultCount();

  document
    .querySelector("#games")
    ?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
}


/*
|--------------------------------------------------------------------------
| Result counter
|--------------------------------------------------------------------------
*/

function updateResultCount() {

  const count =
    state.filtered.length;

  const resultCount =
    $("#resultCount");

  if (resultCount) {

    resultCount.textContent =
      `${count} game${count === 1 ? "" : "s"}`;

  }

  const empty =
    $("#emptyState");

  if (empty) {

    empty.hidden =
      count !== 0;

  }

}


/*
|--------------------------------------------------------------------------
| Navigation
|--------------------------------------------------------------------------
*/

function openDrawer() {

  $("#drawer")
    ?.classList.add("open");

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

          const span =
            button.querySelector("span");

          if (span) {

            span.textContent =
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

        window.location.href =
          `game.html?id=${encodeURIComponent(game.id)}`;

      }
    );


  $("#heroSearchBtn")
    ?.addEventListener(
      "click",
      () => {

        filterGames(
          $("#heroSearchInput")?.value || ""
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


/*
|--------------------------------------------------------------------------
| PWA
|--------------------------------------------------------------------------
*/

function setupPWA() {

  if (
    "serviceWorker" in navigator
  ) {

    window.addEventListener(
      "load",
      () => {

        navigator.serviceWorker
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


/*
|--------------------------------------------------------------------------
| Start
|--------------------------------------------------------------------------
*/

const year =
  $("#year");

if (year) {

  year.textContent =
    new Date().getFullYear();

}

setupNavigation();
setupPWA();
loadGames();
