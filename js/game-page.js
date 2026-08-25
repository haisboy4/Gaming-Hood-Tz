const $ = selector =>
  document.querySelector(selector);

let games = [];


/* =========================================================
   SECURITY
========================================================= */

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


/* =========================================================
   TOAST
========================================================= */

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


/* =========================================================
   GET GAME ID
========================================================= */

function getGameId() {

  return new URLSearchParams(
    location.search
  ).get("id");

}


/* =========================================================
   PLACEHOLDER IMAGE
========================================================= */

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


/* =========================================================
   IMAGE
========================================================= */

function gameImage(
  game,
  wide = false
) {

  if (!game.image) {

    return placeholderImage(
      game.title,
      wide
    );

  }


  return `
    <img
      src="${escapeHTML(game.image)}"
      alt="${escapeHTML(game.title)}"
      loading="eager"
    >
  `;

}


/* =========================================================
   INFO ROW
========================================================= */

function infoRow(
  label,
  value
) {

  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {

    return "";

  }


  return `
    <div class="info-row">

      <span>
        ${escapeHTML(label)}
      </span>

      <strong>
        ${escapeHTML(value)}
      </strong>

    </div>
  `;

}


/* =========================================================
   TAGS / GENRES
========================================================= */

function tags(game) {

  /*
   * Genre is the main category.
   * Tags are secondary labels.
   */

  const values = [

    ...(Array.isArray(game.genre)
      ? game.genre
      : []),

    ...(Array.isArray(game.tags)
      ? game.tags
      : [])

  ]

    .map(
      value =>
        String(value).trim()
    )

    .filter(Boolean);


  /*
   * Remove duplicates.
   */

  const unique =
    [...new Set(values)];


  return unique

    .map(
      tag => `
        <span class="game-tag">
          ${escapeHTML(tag)}
        </span>
      `
    )

    .join("");

}


/* =========================================================
   NORMALIZE GAME
========================================================= */

function normalizeGame(game) {

  return {

    ...game,

    id:
      game.id ||
      game.slug ||
      "",

    title:
      game.title ||
      "Untitled Game",

    platform:
      game.platform ||
      "Other",

    emulator:
      game.emulator ||
      "",

    genre:
      Array.isArray(game.genre)
        ? game.genre
        : [],

    tags:
      Array.isArray(game.tags)
        ? game.tags
        : [],

    image:
      game.image ||
      "",

    description:
      game.description ||
      "",

    size:
      game.size_gb ||
      game.size ||
      "",

    build:
      game.build ||
      "",

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

    fpsLow:
      game.fps_low ||
      "",

    fpsMid:
      game.fps_mid ||
      "",

    fpsHigh:
      game.fps_high ||
      "",

    download:
      game.download_link ||
      game.download ||
      "",

    emulatorLink:
      game.emulator_link ||
      "",

    views:
      Number(
        game.views || 0
      ),

    added:
      game.added ||
      ""

  };

}


/* =========================================================
   RENDER GAME
========================================================= */

function renderGame(game) {

  document.title =
    `${game.title} — Gaming Hood`;


  $("#gameContent").innerHTML = `

    <!-- BREADCRUMBS -->

    <nav class="breadcrumbs">

      <a href="./">
        Home
      </a>

      <span>»</span>

      <a
        href="category.html?platform=${encodeURIComponent(
          game.platform
        )}"
      >
        ${escapeHTML(
          game.platform
        )}
      </a>

      <span>»</span>

      <strong>
        ${escapeHTML(
          game.title
        )}
      </strong>

    </nav>


    <!-- TAGS -->

    <div class="game-tags">
      ${tags(game)}
    </div>


    <!-- TITLE -->

    <h1 class="game-title">
      ${escapeHTML(
        game.title
      )}
    </h1>


    <!-- META -->

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
              🔥
              ${escapeHTML(
                game.views.toLocaleString()
              )}
              views
            </span>
          `

          : ""
      }

    </div>


    <!-- HERO IMAGE -->

    <div class="game-hero-image">
      ${gameImage(
        game,
        true
      )}
    </div>


    <!-- ABOUT -->

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


    <!-- GAME INFORMATION -->

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
          game.offline === true
            ? "Yes"
            : game.offline === false
              ? "No"
              : "Not specified"
        )}

        ${infoRow(
          "Controller",
          game.controller === true
            ? "Supported"
            : game.controller === false
              ? "Not supported"
              : "Not specified"
        )}

        ${infoRow(
          "Multiplayer",
          game.multiplayer === true
            ? "Supported"
            : game.multiplayer === false
              ? "Not supported"
              : "Not specified"
        )}

      </div>

    </section>


    <!-- COMPATIBILITY -->

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


    <!-- REQUIREMENTS -->

    <section class="game-card-section">

      <h2>
        Requirements
      </h2>


      <div class="requirements">

        ${infoRow(
          "Minimum RAM",
          game.minRam
            ? `${game.minRam} GB`
            : ""
        )}

        ${infoRow(
          "Recommended RAM",
          game.recommendedRam
            ? `${game.recommendedRam} GB`
            : ""
        )}

        ${infoRow(
          "GPU",
          game.gpu
        )}

        ${infoRow(
          "Android",
          game.android
        )}

        ${infoRow(
          "Vulkan",
          game.vulkan === true
            ? "Required"
            : game.vulkan === false
              ? "Not required"
              : "Not specified"
        )}

      </div>


      ${
        !game.minRam &&
        !game.recommendedRam &&
        !game.gpu &&
        !game.android &&
        game.vulkan === null

          ? `
            <p class="muted">
              Requirements have not been added
              for this game yet.
            </p>
          `

          : ""
      }

    </section>


    <!-- FPS -->

    ${
      game.fpsLow ||
      game.fpsMid ||
      game.fpsHigh

        ? `

          <section class="game-card-section">

            <h2>
              Expected Performance
            </h2>

            <div class="requirements">

              ${infoRow(
                "Low Settings",
                game.fpsLow
              )}

              ${infoRow(
                "Medium Settings",
                game.fpsMid
              )}

              ${infoRow(
                "High Settings",
                game.fpsHigh
              )}

            </div>

          </section>

        `

        : ""
    }


    <!-- DOWNLOAD -->

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


      ${
        game.emulatorLink

          ? `
            <a
              class="download-btn"
              href="${escapeHTML(
                game.emulatorLink
              )}"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Emulator
            </a>
          `

          : ""
      }

    </section>


    <!-- INSTALLATION -->

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
          Follow the game's
          platform-specific setup instructions.
        </li>

        <li>
          Launch the game and adjust
          settings if necessary.
        </li>

      </ol>

    </section>


    <!-- SHARE -->

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


    <!-- RELATED -->

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


/* =========================================================
   RELATED GAMES
========================================================= */

function renderRelated(current) {

  const related = games

    .filter(
      game =>
        game.id !== current.id
    )

    .map(game => {

      const samePlatform =
        game.platform ===
        current.platform
          ? 3
          : 0;


      const sameEmulator =
        game.emulator &&
        current.emulator &&
        game.emulator ===
        current.emulator
          ? 2
          : 0;


      const currentGenres = [
        ...(current.genre || []),
        ...(current.tags || [])
      ];


      const sharedGenre =
        [
          ...(game.genre || []),
          ...(game.tags || [])
        ]

          .some(tag =>
            currentGenres.includes(
              tag
            )
          )
          ? 1
          : 0;


      return {

        game,

        score:
          samePlatform +
          sameEmulator +
          sharedGenre

      };

    })

    .sort(
      (a, b) =>
        b.score - a.score
    )

    .slice(0, 4)

    .map(
      item => item.game
    );


  const grid =
    $("#relatedGrid");


  if (!grid) return;


  grid.innerHTML =
    related.length

      ? related.map(game => `

          <article class="game-card">

            <a
              href="game.html?id=${encodeURIComponent(
                game.id
              )}"
            >

              <div class="cover">

                ${
                  game.image

                    ? `
                      <img
                        src="${escapeHTML(
                          game.image
                        )}"
                        alt="${escapeHTML(
                          game.title
                        )}"
                        loading="lazy"
                      >
                    `

                    : placeholderImage(
                        game.title
                      )
                }


                <span class="platform-badge">
                  ${escapeHTML(
                    game.platform ||
                    "Game"
                  )}
                </span>

              </div>


              <div class="card-info">

                <h3 class="card-title">
                  ${escapeHTML(
                    game.title
                  )}
                </h3>


                <p class="card-meta">

                  ${escapeHTML(
                    game.emulator ||
                    game.platform ||
                    ""
                  )}

                </p>

              </div>

            </a>

          </article>

        `).join("")

      : `
        <p class="muted">
          No related games yet.
        </p>
      `;

}


/* =========================================================
   SHARING
========================================================= */

function setupSharing(game) {

  const url =
    location.href;

  const title =
    `${game.title} — Gaming Hood`;

  const text =
    `Check out ${game.title} on Gaming Hood`;


  document
    .querySelectorAll("[data-share]")
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

            }

            else {

              try {

                await navigator
                  .clipboard
                  .writeText(url);

                showToast(
                  "Link copied"
                );

              } catch {}

            }

            return;

          }


          if (
            type === "copy"
          ) {

            try {

              await navigator
                .clipboard
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


/* =========================================================
   NAVIGATION
========================================================= */

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
        
