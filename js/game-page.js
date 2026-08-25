const $ = selector =>
  document.querySelector(selector);

let games = [];


function escapeHTML(value = "") {

  return String(value).replace(
    /[&<>"']/g,
    char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char])
  );

}


function showToast(message) {

  const toast = $("#toast");

  if (!toast) return;

  toast.textContent =
    message;

  toast.classList.add("show");

  clearTimeout(
    showToast.timer
  );

  showToast.timer =
    setTimeout(
      () =>
        toast.classList.remove(
          "show"
        ),
      2200
    );

}


function getGameId() {

  return new URLSearchParams(
    location.search
  ).get("id");

}


function placeholderImage(
  title,
  wide = false
) {

  return `
    <div class="${
      wide
        ? "game-cover-placeholder wide"
        : "cover-placeholder"
    }">
      ${escapeHTML(title)}
    </div>
  `;

}


function gameImage(
  game,
  wide = false
) {

  if (!game.image)
    return placeholderImage(
      game.title,
      wide
    );

  return `
    <img
      src="${escapeHTML(game.image)}"
      alt="${escapeHTML(game.title)}"
      loading="eager"
    >
  `;

}


function infoRow(
  label,
  value
) {

  if (
    !value &&
    value !== 0
  ) {

    return "";

  }

  return `
    <div class="info-row">
      <span>${escapeHTML(label)}</span>
      <strong>${escapeHTML(value)}</strong>
    </div>
  `;

}


function tags(game) {

  const values =
    Array.isArray(game.tags)
      ? game.tags
      : [];

  return values
    .map(
      tag =>
        `<span class="game-tag">
          ${escapeHTML(tag)}
        </span>`
    )
    .join("");

}


/*
|--------------------------------------------------------------------------
| Convert Decap CMS format
|--------------------------------------------------------------------------
*/

function normalizeGame(game) {

  return {

    ...game,

    id:
      game.slug ||
      game.id,

    size:
      game.size_gb ||
      game.size ||
      "",

    download:
      game.download_link ||
      game.download ||
      "",

    emulatorLink:
      game.emulator_link ||
      "",

    releaseYear:
      game.release_year ||
      game.releaseYear ||
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

    }

  };

}


function renderGame(game) {

  document.title =
    `${game.title} — Gaming Hood`;


  const requirements =
    game.requirements || {};

  const features =
    game.features || {};


  $("#gameContent").innerHTML = `

    <nav class="breadcrumbs">

      <a href="./">
        Home
      </a>

      <span>»</span>

      <a href="category.html?platform=${encodeURIComponent(
        game.platform || "Other"
      )}">
        ${escapeHTML(
          game.platform || "Other"
        )}
      </a>

      <span>»</span>

      <strong>
        ${escapeHTML(game.title)}
      </strong>

    </nav>


    <div class="game-tags">
      ${tags(game)}
    </div>


    <h1 class="game-title">
      ${escapeHTML(game.title)}
    </h1>


    <div class="game-meta">

      <span>
        Gaming Hood
      </span>

      <span>•</span>

      <span>
        ${
          game.added
            ? escapeHTML(
                new Date(
                  game.added
                ).toLocaleDateString()
              )
            : "Recently updated"
        }
      </span>

      ${
        game.views
          ? `
            <span>•</span>
            <span>
              ${escapeHTML(
                Number(
                  game.views
                ).toLocaleString()
              )}
              views
            </span>
          `
          : ""
      }

    </div>


    <div class="game-hero-image">

      ${gameImage(
        game,
        true
      )}

    </div>


    <section class="game-card-section">

      <h2>
        About the Game
      </h2>

      <p class="game-description">
        ${escapeHTML(
          game.description ||
          "Game information will be added soon."
        )}
      </p>

    </section>


    <section class="game-card-section">

      <h2>
        Game Information
      </h2>

      <div class="info-grid">

        ${infoRow(
          "Platform",
          game.platform
        )}

        ${infoRow(
          "Emulator",
          game.emulator ||
          "Not required"
        )}

        ${infoRow(
          "Game Size",
          game.size
        )}

        ${infoRow(
          "Build",
          game.build
        )}

        ${infoRow(
          "Release Year",
          game.releaseYear
        )}

        ${infoRow(
          "Offline",
          features.offline
            ? "Yes"
            : "No"
        )}

        ${infoRow(
          "Controller",
          features.controller
            ? "Supported"
            : "Not specified"
        )}

        ${infoRow(
          "Multiplayer",
          features.multiplayer
            ? "Supported"
            : "Not supported"
        )}

      </div>

    </section>


    <section class="compat-card">

      <div>

        <p class="section-kicker">
          BEFORE YOU DOWNLOAD
        </p>

        <h2>
          Can your device run it?
        </h2>

        <p>
          Compare this game's requirements
          with your Android device using
          the Gaming Hood compatibility checker.
        </p>

      </div>

      <a
        class="primary-btn"
        href="compatibility.html?game=${encodeURIComponent(
          game.id
        )}"
      >
        Check compatibility
      </a>

    </section>


    <section class="game-card-section">

      <h2>
        Requirements
      </h2>

      <div class="requirements">

        ${infoRow(
          "Minimum RAM",
          requirements.minRam
            ? `${requirements.minRam} GB`
            : ""
        )}

        ${infoRow(
          "Recommended RAM",
          requirements.recommendedRam
            ? `${requirements.recommendedRam} GB`
            : ""
        )}

        ${infoRow(
          "GPU",
          requirements.gpu
        )}

        ${infoRow(
          "Android",
          requirements.android
        )}

        ${infoRow(
          "Vulkan",
          game.vulkan_required === true
            ? "Required"
            : "Not required"
        )}

      </div>

    </section>


    <section class="download-card">

      <p class="section-kicker">
        GAME FILE
      </p>

      <h2>
        Download
      </h2>

      <p>
        Use the official Gaming Hood
        download link for this game.
      </p>

      ${
        game.download
          ? `
            <a
              class="download-btn"
              href="${escapeHTML(
                game.download
              )}"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Game
            </a>
          `
          : `
            <button
              class="download-btn disabled"
              disabled
            >
              Download link coming soon
            </button>
          `
      }

    </section>


    <section class="game-card-section">

      <h2>
        Installation Guide
      </h2>

      <ol class="install-list">

        <li>
          Download the game file.
        </li>

        <li>
          Extract the archive if it is compressed.
        </li>

        <li>
          Install or configure the required
          emulator when applicable.
        </li>

        <li>
          Follow the game's platform-specific
          setup instructions.
        </li>

        <li>
          Launch the game and adjust settings
          if necessary.
        </li>

      </ol>

    </section>


    <section class="game-card-section share-section">

      <h2>
        Share this game
      </h2>

      <div class="share-buttons">

        <button data-share="native">
          Share
        </button>

        <button data-share="whatsapp">
          WhatsApp
        </button>

        <button data-share="telegram">
          Telegram
        </button>

        <button data-share="facebook">
          Facebook
        </button>

        <button data-share="copy">
          Copy Link
        </button>

      </div>

    </section>


    <section class="game-card-section">

      <div class="section-heading">

        <div>

          <p class="section-kicker">
            MORE TO PLAY
          </p>

          <h2>
            Related Games
          </h2>

        </div>

      </div>

      <div
        class="game-grid related-grid"
        id="relatedGrid"
      ></div>

    </section>

  `;


  renderRelated(game);

  setupSharing(game);

}


function renderRelated(current) {

  const related =
    games

      .filter(
        g =>
          g.id !== current.id
      )

      .map(g => ({

        game: g,

        score:

          (
            g.platform ===
            current.platform
              ? 3
              : 0
          )

          +

          (
            g.emulator &&
            g.emulator ===
            current.emulator
              ? 2
              : 0
          )

          +

          (
            (g.tags || [])
              .some(
                t =>
                  (current.tags || [])
                    .includes(t)
              )
              ? 1
              : 0
          )

      }))

      .sort(
        (a, b) =>
          b.score - a.score
      )

      .slice(0, 4)

      .map(
        x => x.game
      );


  $("#relatedGrid").innerHTML =

    related

      .map(g => `

        <article class="game-card">

          <a href="game.html?id=${encodeURIComponent(g.id)}">

            <div class="cover">

              ${
                g.image
                  ? `
                    <img
                      src="${escapeHTML(g.image)}"
                      alt="${escapeHTML(g.title)}"
                      loading="lazy"
                    >
                  `
                  : placeholderImage(
                      g.title
                    )
              }

              <span class="platform-badge">
                ${escapeHTML(
                  g.platform ||
                  "Game"
                )}
              </span>

            </div>

            <div class="card-info">

              <h3 class="card-title">
                ${escapeHTML(
                  g.title
                )}
              </h3>

              <p class="card-meta">
                ${escapeHTML(
                  g.emulator ||
                  g.platform ||
                  ""
                )}
              </p>

            </div>

          </a>

        </article>

      `)

      .join("");

}


function setupSharing(game) {

  const url =
    location.href;

  const title =
    `${game.title} — Gaming Hood`;

  const text =
    `Check out ${game.title} on Gaming Hood`;


  document
    .querySelectorAll(
      "[data-share]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        async () => {

          const type =
            button.dataset.share;


          if (
            type === "native"
          ) {

            if (
              navigator.share
            ) {

              try {

                await navigator.share({
                  title,
                  text,
                  url
                });

              } catch {}

            } else {

              await navigator.clipboard
                ?.writeText(url);

              showToast(
                "Link copied"
              );

            }

            return;

          }


          if (
            type === "copy"
          ) {

            try {

              await navigator.clipboard
                .writeText(url);

              showToast(
                "Link copied"
              );

            } catch {

              showToast(
                "Copy failed"
              );

            }

            return;

          }


          const encodedUrl =
            encodeURIComponent(url);

          const encodedText =
            encodeURIComponent(
              `${text}\n${url}`
            );


          const links = {

            whatsapp:
              `https://wa.me/?text=${encodedText}`,

            telegram:
              `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(text)}`,

            facebook:
              `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`

          };


          if (
            links[type]
          ) {

            window.open(
              links[type],
              "_blank",
              "noopener,noreferrer"
            );

          }

        }
      );

    });

}


function setupNavigation() {

  const open = () => {

    $("#drawer")
      ?.classList.add("open");

    $("#drawerBackdrop")
      ?.classList.add("open");

    $("#drawer")
      ?.setAttribute(
        "aria-hidden",
        "false"
      );

  };


  const close = () => {

    $("#drawer")
      ?.classList.remove("open");

    $("#drawerBackdrop")
      ?.classList.remove("open");

    $("#drawer")
      ?.setAttribute(
        "aria-hidden",
        "true"
      );

  };


  $("#menuBtn")
    ?.addEventListener(
      "click",
      open
    );

  $("#closeDrawer")
    ?.addEventListener(
      "click",
      close
    );

  $("#drawerBackdrop")
    ?.addEventListener(
      "click",
      close
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

          if (!target)
            return;

          target.classList.toggle(
            "open"
          );

          const span =
            button.querySelector(
              "span"
            );

          if (span) {

            span.textContent =
              target.classList.contains(
                "open"
              )
                ? "⌃"
                : "⌄";

          }

        }
      );

    });


  $("#drawerSearchForm")
    ?.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        const q =
          $("#drawerSearchInput")
            ?.value
            ?.trim();

        if (q) {

          location.href =
            `./?search=${encodeURIComponent(q)}#games`;

        }

      }
    );


  $("#randomBtn")
    ?.addEventListener(
      "click",
      () => {

        if (!games.length)
          return;

        const random =
          games[
            Math.floor(
              Math.random() *
              games.length
            )
          ];

        location.href =
          `game.html?id=${encodeURIComponent(random.id)}`;

      }
    );

}


async function init() {

  setupNavigation();


  try {

    /*
     * Cache-busting is intentional.
     */

    const response =
      await fetch(
        `games.json?v=${Date.now()}`,
        {
          cache: "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        "Database unavailable"
      );

    }


    const data =
      await response.json();


    games =
      Array.isArray(data.games)
        ? data.games.map(
            normalizeGame
          )
        : [];


    console.log(
      "Gaming Hood games:",
      games
    );


    const id =
      getGameId();


    const game =
      games.find(
        item =>
          item.id === id
      );


    if (!game) {

      $("#gameContent").innerHTML = `

        <div class="not-found">

          <h1>
            Game not found
          </h1>

          <p>
            The game you're looking for
            does not exist in the Gaming Hood
            database.
          </p>

          <a
            class="primary-btn"
            href="./"
          >
            Back to Gaming Hood
          </a>

        </div>

      `;

      return;

    }


    renderGame(game);


  } catch (error) {

    console.error(error);


    $("#gameContent").innerHTML = `

      <div class="not-found">

        <h1>
          Unable to load game
        </h1>

        <p>
          Please check your connection
          and try again.
        </p>

        <a
          class="primary-btn"
          href="./"
        >
          Back to home
        </a>

      </div>

    `;

  }


  if (
    "serviceWorker" in navigator
  ) {

    navigator.serviceWorker
      .register(
        "./service-worker.js"
      )
      .catch(
        console.warn
      );

  }

}


init();
