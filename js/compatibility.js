/* =========================================================
   GAMING HOOD COMPATIBILITY SYSTEM
========================================================= */

let games = [];

let selectedGame = null;

let detectedDevice = null;


/* =========================================================
   HELPERS
========================================================= */

const $ = selector =>
  document.querySelector(selector);


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
   GET GAME ID
========================================================= */

function getGameId() {

  const params =
    new URLSearchParams(
      location.search
    );

  return params.get("game");

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

    minRam:
      Number(
        game.min_ram || 0
      ),

    recommendedRam:
      Number(
        game.recommended_ram || 0
      ),

    gpu:
      game.gpu ||
      "",

    android:
      game.android_support ||
      "",

    vulkan:
      game.vulkan_required === true,

    fpsLow:
      game.fps_low ||
      "",

    fpsMid:
      game.fps_mid ||
      "",

    fpsHigh:
      game.fps_high ||
      ""

  };

}


/* =========================================================
   GPU DETECTION
========================================================= */

function detectGPU() {

  try {

    const canvas =
      document.createElement(
        "canvas"
      );

    const gl =
      canvas.getContext(
        "webgl"
      ) ||
      canvas.getContext(
        "experimental-webgl"
      );

    if (!gl) {

      return "Unknown GPU";

    }


    const debugInfo =
      gl.getExtension(
        "WEBGL_debug_renderer_info"
      );


    if (debugInfo) {

      const renderer =
        gl.getParameter(
          debugInfo.UNMASKED_RENDERER_WEBGL
        );

      if (renderer) {

        return renderer;

      }

    }


    return String(
      gl.getParameter(
        gl.RENDERER
      ) ||
      "Unknown GPU"
    );

  }

  catch {

    return "Unknown GPU";

  }

}


/* =========================================================
   ANDROID VERSION
========================================================= */

function detectAndroidVersion() {

  const ua =
    navigator.userAgent;

  const match =
    ua.match(
      /Android\s([0-9.]+)/i
    );

  return match
    ? match[1]
    : "Unknown";

}


/* =========================================================
   DEVICE MODEL
========================================================= */

function detectDeviceName() {

  const ua =
    navigator.userAgent;


  /*
   * Android Chrome normally exposes
   * the model in the User-Agent.
   */

  const match =
    ua.match(
      /Android[^;]*;\s*(?:[a-z]{2,3}(?:-[A-Z]{2})?;\s*)?([^;)]+?)(?:\s+Build\/[^;)]+)?[);]/i
    );


  if (
    match &&
    match[1]
  ) {

    const model =
      match[1].trim();

    if (
      model &&
      !/wv/i.test(model) &&
      !/Mobile/i.test(model)
    ) {

      return model;

    }

  }


  /*
   * Samsung-specific fallback.
   */

  if (
    /SM-G960/i.test(ua)
  ) {

    return "Samsung Galaxy S9";

  }


  if (
    /SM-G965/i.test(ua)
  ) {

    return "Samsung Galaxy S9+";

  }


  return "Android Device";

}


/* =========================================================
   RAM
========================================================= */

function detectRAM() {

  /*
   * navigator.deviceMemory is available
   * on many Chromium Android browsers.
   */

  if (
    navigator.deviceMemory
  ) {

    return Number(
      navigator.deviceMemory
    );

  }


  return null;

}


/* =========================================================
   DEVICE DETECTION
========================================================= */

function detectDevice() {

  return {

    name:
      detectDeviceName(),

    ram:
      detectRAM(),

    gpu:
      detectGPU(),

    android:
      detectAndroidVersion(),

    userAgent:
      navigator.userAgent

  };

}


/* =========================================================
   GPU NORMALIZATION
========================================================= */

function normalizeGPUName(
  gpu = ""
) {

  return gpu
    .toLowerCase()
    .replace(/\(tm\)/g, "")
    .replace(/\(r\)/g, "")
    .replace(/\s+/g, " ")
    .trim();

}


/* =========================================================
   GPU SCORE
========================================================= */

function getGPUScore(
  gpu = ""
) {

  const name =
    normalizeGPUName(
      gpu
    );


  /*
   * Adreno
   */

  const adreno =
    name.match(
      /adreno[^0-9]*(\d{3,4})/i
    );


  if (adreno) {

    const number =
      Number(
        adreno[1]
      );

    const scores = {

      205: 1,
      220: 2,
      225: 2,
      302: 3,
      305: 3,
      306: 3,
      308: 3,
      320: 4,
      330: 5,
      405: 5,
      418: 6,
      420: 6,
      430: 7,
      505: 7,
      506: 7,
      508: 7,
      509: 7,
      512: 8,
      530: 8,
      540: 9,
      610: 9,
      612: 9,
      616: 9,
      618: 9,
      620: 10,
      630: 10,
      640: 11,
      650: 11,
      660: 12,
      662: 12,
      680: 13,
      685: 14,
      690: 14,
      695: 14,
      710: 15,
      720: 16,
      725: 16,
      730: 17,
      740: 18,
      750: 18,
      755: 19,
      765: 19,
      730: 17,
      740: 18,
      750: 18,
      830: 20,
      840: 21,
      850: 22,
      860: 23,
      865: 24,
      870: 25,
      650: 11
    };


    return (
      scores[number] ||
      estimateAdrenoScore(
        number
      )
    );

  }


  /*
   * Mali
   */

  if (
    name.includes("mali")
  ) {

    if (
      /g720|g715|g710/i.test(name)
    ) return 18;

    if (
      /g78/i.test(name)
    ) return 15;

    if (
      /g77/i.test(name)
    ) return 14;

    if (
      /g76/i.test(name)
    ) return 12;

    if (
      /g57/i.test(name)
    ) return 10;

    if (
      /g52/i.test(name)
    ) return 8;

    if (
      /g51/i.test(name)
    ) return 7;

    if (
      /t880/i.test(name)
    ) return 6;

    return 5;

  }


  /*
   * PowerVR
   */

  if (
    name.includes("powervr")
  ) {

    return 7;

  }


  /*
   * Apple GPU
   */

  if (
    name.includes("apple")
  ) {

    return 20;

  }


  /*
   * Unknown GPU
   */

  return null;

}


function estimateAdrenoScore(
  number
) {

  if (
    number >= 800
  ) return 20;

  if (
    number >= 700
  ) return 17;

  if (
    number >= 600
  ) return 10;

  if (
    number >= 500
  ) return 7;

  if (
    number >= 400
  ) return 5;

  if (
    number >= 300
  ) return 3;

  return 1;

}


/* =========================================================
   GPU REQUIREMENT SCORE
========================================================= */

function getRequiredGPUScore(
  requirement
) {

  if (!requirement)
    return null;


  /*
   * A game can say:
   *
   * Adreno 630
   * Adreno 6xx
   * Mali-G76
   * Adreno 630 or equivalent
   */

  const text =
    requirement
      .toLowerCase();


  const adreno =
    text.match(
      /adreno[^0-9]*(\d{3,4})/i
    );


  if (adreno) {

    return getGPUScore(
      `Adreno ${adreno[1]}`
    );

  }


  const mali =
    text.match(
      /mali[^a-z0-9]*(g\d{2,3}|t\d{3,4})/i
    );


  if (mali) {

    return getGPUScore(
      `Mali ${mali[1]}`
    );

  }


  return null;

}


/* =========================================================
   GPU COMPARISON
========================================================= */

function compareGPU(
  deviceGPU,
  requiredGPU
) {

  if (
    !requiredGPU
  ) {

    return {
      status: "unknown",
      message: "No GPU requirement specified."
    };

  }


  const deviceScore =
    getGPUScore(
      deviceGPU
    );


  const requiredScore =
    getRequiredGPUScore(
      requiredGPU
    );


  if (
    deviceScore === null ||
    requiredScore === null
  ) {

    /*
     * Direct text match fallback.
     */

    const device =
      normalizeGPUName(
        deviceGPU
      );

    const required =
      normalizeGPUName(
        requiredGPU
      );


    if (
      device.includes(
        required
      ) ||
      required.includes(
        device
      )
    ) {

      return {
        status: "pass",
        message: "GPU appears compatible."
      };

    }


    return {
      status: "unknown",
      message:
        "GPU could not be compared automatically."
    };

  }


  if (
    deviceScore >=
    requiredScore
  ) {

    return {
      status: "pass",
      message: "GPU meets the requirement."
    };

  }


  return {
    status: "fail",
    message: "GPU is below the recommended level."
  };

}


/* =========================================================
   ANDROID VERSION COMPARISON
========================================================= */

function parseAndroidVersion(
  value
) {

  if (!value)
    return null;


  const match =
    String(value).match(
      /(\d+(?:\.\d+)?)/
    );


  return match
    ? Number(match[1])
    : null;

}


function compareAndroid(
  deviceAndroid,
  requiredAndroid
) {

  if (
    !requiredAndroid
  ) {

    return {
      status: "unknown",
      message: "No Android requirement."
    };

  }


  const device =
    parseAndroidVersion(
      deviceAndroid
    );


  const required =
    parseAndroidVersion(
      requiredAndroid
    );


  if (
    device === null ||
    required === null
  ) {

    return {
      status: "unknown",
      message: "Android version could not be compared."
    };

  }


  if (
    device >= required
  ) {

    return {
      status: "pass",
      message: "Android version is sufficient."
    };

  }


  return {
    status: "fail",
    message: "Android version is too old."
  };

}


/* =========================================================
   RAM COMPARISON
========================================================= */

function compareRAM(
  deviceRAM,
  game
) {

  if (
    !game.minRam
  ) {

    return {
      status: "unknown",
      message: "No minimum RAM specified."
    };

  }


  if (
    deviceRAM === null
  ) {

    return {
      status: "unknown",
      message: "RAM could not be detected."
    };

  }


  if (
    deviceRAM >=
    game.recommendedRam
  ) {

    return {
      status: "pass",
      message:
        `${deviceRAM} GB RAM meets the recommended requirement.`
    };

  }


  if (
    deviceRAM >=
    game.minRam
  ) {

    return {
      status: "warning",
      message:
        `${deviceRAM} GB RAM meets the minimum requirement.`
    };

  }


  return {
    status: "fail",
    message:
      `${deviceRAM} GB RAM is below the minimum requirement.`
  };

}


/* =========================================================
   OVERALL RESULT
========================================================= */

function calculateResult(
  ramResult,
  gpuResult,
  androidResult
) {

  const results = [
    ramResult,
    gpuResult,
    androidResult
  ];


  const failures =
    results.filter(
      result =>
        result.status === "fail"
    ).length;


  const warnings =
    results.filter(
      result =>
        result.status === "warning"
    ).length;


  const passes =
    results.filter(
      result =>
        result.status === "pass"
    ).length;


  if (
    failures >= 2
  ) {

    return {
      type: "bad",
      icon: "✕",
      title: "Not Recommended",
      message:
        "Your device does not meet several important requirements for this game."
    };

  }


  if (
    failures === 1
  ) {

    return {
      type: "warning",
      icon: "!",
      title: "May Not Run Well",
      message:
        "Your device falls below at least one important requirement."
    };

  }


  if (
    warnings >= 1
  ) {

    return {
      type: "playable",
      icon: "✓",
      title: "Playable",
      message:
        "Your device meets the minimum requirements, but lower settings may be needed."
    };

  }


  if (
    passes >= 1
  ) {

    return {
      type: "good",
      icon: "✓",
      title: "Should Run",
      message:
        "Your device appears to meet the requirements for this game."
    };

  }


  return {
    type: "playable",
    icon: "?",
    title: "Unable to Determine",
    message:
      "There is not enough information to make a reliable compatibility decision."
  };

}


/* =========================================================
   RENDER DEVICE
========================================================= */

function renderDeviceCard(
  device
) {

  return `

    <section class="device-card">

      <h2>
        Your Device
      </h2>

      <div class="device-grid">

        <div class="device-item">
          <span>Device</span>
          <strong>
            ${escapeHTML(
              device.name
            )}
          </strong>
        </div>

        <div class="device-item">
          <span>RAM</span>
          <strong>
            ${
              device.ram !== null
                ? `${device.ram} GB`
                : "Not detected"
            }
          </strong>
        </div>

        <div class="device-item">
          <span>GPU</span>
          <strong>
            ${escapeHTML(
              device.gpu
            )}
          </strong>
        </div>

        <div class="device-item">
          <span>Android</span>
          <strong>
            ${escapeHTML(
              device.android
            )}
          </strong>
        </div>

      </div>

    </section>

  `;

}


/* =========================================================
   RENDER REQUIREMENTS
========================================================= */

function renderRequirements(
  game
) {

  return `

    <section class="game-requirement-card">

      <h2>
        ${escapeHTML(
          game.title
        )}
      </h2>

      <div class="comparison-list">

        <div class="comparison-row">
          <span>Platform</span>
          <strong>
            ${escapeHTML(
              game.platform
            )}
          </strong>
        </div>

        ${
          game.minRam
            ? `
              <div class="comparison-row">
                <span>Minimum RAM</span>
                <strong>
                  ${game.minRam} GB
                </strong>
              </div>
            `
            : ""
        }

        ${
          game.recommendedRam
            ? `
              <div class="comparison-row">
                <span>Recommended RAM</span>
                <strong>
                  ${game.recommendedRam} GB
                </strong>
              </div>
            `
            : ""
        }

        ${
          game.gpu
            ? `
              <div class="comparison-row">
                <span>GPU</span>
                <strong>
                  ${escapeHTML(
                    game.gpu
                  )}
                </strong>
              </div>
            `
            : ""
        }

        ${
          game.android
            ? `
              <div class="comparison-row">
                <span>Android</span>
                <strong>
                  ${escapeHTML(
                    game.android
                  )}
                </strong>
              </div>
            `
            : ""
        }

        <div class="comparison-row">
          <span>Vulkan</span>
          <strong>
            ${
              game.vulkan
                ? "Required"
                : "Not required"
            }
          </strong>
        </div>

      </div>

    </section>

  `;

}


/* =========================================================
   RENDER COMPARISON
========================================================= */

function renderComparison(
  game,
  device
) {

  const ram =
    compareRAM(
      device.ram,
      game
    );


  const gpu =
    compareGPU(
      device.gpu,
      game.gpu
    );


  const android =
    compareAndroid(
      device.android,
      game.android
    );


  const result =
    calculateResult(
      ram,
      gpu,
      android
    );


  return `

    <section
      class="result-card result-${result.type}"
    >

      <div class="result-icon">
        ${result.icon}
      </div>

      <div class="result-title">
        ${result.title}
      </div>

      <p class="result-message">
        ${result.message}
      </p>

    </section>


    <section class="game-requirement-card">

      <h2>
        Compatibility Details
      </h2>

      <div class="comparison-list">

        <div class="comparison-row">

          <span>
            RAM
          </span>

          <strong
            class="${ram.status}"
          >
            ${
              ram.status === "pass"
                ? "✓ "
                : ram.status === "fail"
                  ? "✕ "
                  : ram.status === "warning"
                    ? "! "
                    : ""
            }

            ${escapeHTML(
              ram.message
            )}
          </strong>

        </div>


        <div class="comparison-row">

          <span>
            GPU
          </span>

          <strong
            class="${gpu.status}"
          >
            ${
              gpu.status === "pass"
                ? "✓ "
                : gpu.status === "fail"
                  ? "✕ "
                  : ""
            }

            ${escapeHTML(
              gpu.message
            )}
          </strong>

        </div>


        <div class="comparison-row">

          <span>
            Android
          </span>

          <strong
            class="${android.status}"
          >
            ${
              android.status === "pass"
                ? "✓ "
                : android.status === "fail"
                  ? "✕ "
                  : ""
            }

            ${escapeHTML(
              android.message
            )}
          </strong>

        </div>

      </div>

    </section>

  `;

}


/* =========================================================
   MANUAL FALLBACK
========================================================= */

function renderManualFallback() {

  return `

    <section class="manual-card">

      <h2>
        Manual Device Information
      </h2>

      <p>
        Automatic detection is not available
        for some browsers. You can enter your
        device information manually.
      </p>


      <label>
        Device Name

        <input
          id="manualDevice"
          type="text"
          placeholder="Example: Galaxy S9"
        >

      </label>


      <label>
        RAM (GB)

        <input
          id="manualRam"
          type="number"
          min="1"
          step="0.5"
          placeholder="Example: 4"
        >

      </label>


      <label>
        GPU

        <input
          id="manualGpu"
          type="text"
          placeholder="Example: Adreno 630"
        >

      </label>


      <label>
        Android Version

        <input
          id="manualAndroid"
          type="text"
          placeholder="Example: Android 10"
        >

      </label>


      <button
        class="manual-btn"
        id="manualCheck"
      >
        Check Manually
      </button>

    </section>

  `;

}


/* =========================================================
   MANUAL CHECK
========================================================= */

function setupManualCheck() {

  const button =
    $("#manualCheck");


  if (!button)
    return;


  button.addEventListener(
    "click",
    () => {

      const device = {

        name:
          $("#manualDevice")
            ?.value
            .trim() ||
          "Manual Device",

        ram:
          Number(
            $("#manualRam")
              ?.value
          ) || null,

        gpu:
          $("#manualGpu")
            ?.value
            .trim() ||
          "Unknown GPU",

        android:
          $("#manualAndroid")
            ?.value
            .trim() ||
          "Unknown"

      };


      detectedDevice =
        device;


      renderPage(
        selectedGame,
        device
      );

    }
  );

}


/* =========================================================
   RENDER PAGE
========================================================= */

function renderPage(
  game,
  device
) {

  const content =
    $("#compatibilityContent");


  content.classList.remove(
    "loading"
  );


  content.innerHTML = `

    <div class="compatibility-header">

      <p class="section-kicker">
        GAMING HOOD
      </p>

      <h1>
        Compatibility Checker
      </h1>

      <p>
        Checking whether your Android
        device can run
        <strong>
          ${escapeHTML(
            game.title
          )}
        </strong>.
      </p>

    </div>


    ${renderDeviceCard(
      device
    )}


    ${renderRequirements(
      game
    )}


    ${renderComparison(
      game,
      device
    )}


    ${renderManualFallback()}


    <a
      class="back-btn"
      href="game.html?id=${encodeURIComponent(
        game.id
      )}"
    >
      ← Back to Game
    </a>

  `;


  setupManualCheck();

}


/* =========================================================
   LOAD DATABASE
========================================================= */

async function init() {

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
        "Unable to load games.json"
      );

    }


    const data =
      await response.json();


    games =
      Array.isArray(
        data.games
      )

        ? data.games.map(
            normalizeGame
          )

        : [];


    const gameId =
      getGameId();


    if (!gameId) {

      $("#compatibilityContent")
        .innerHTML = `

          <div class="not-found">

            <h1>
              Select a game
            </h1>

            <p>
              Open the compatibility
              checker from a game's page.
            </p>

            <a
              class="primary-btn"
              href="./"
            >
              Browse Games
            </a>

          </div>

        `;

      return;

    }


    selectedGame =
      games.find(
        game =>
          game.id === gameId
      );


    if (!selectedGame) {

      $("#compatibilityContent")
        .innerHTML = `

          <div class="not-found">

            <h1>
              Game not found
            </h1>

            <p>
              This game could not be found
              in games.json.
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


    detectedDevice =
      detectDevice();


    renderPage(
      selectedGame,
      detectedDevice
    );

  }

  catch (error) {

    console.error(
      error
    );


    $("#compatibilityContent")
      .innerHTML = `

        <div class="not-found">

          <h1>
            Compatibility checker error
          </h1>

          <p>
            ${escapeHTML(
              error.message
            )}
          </p>

          <a
            class="primary-btn"
            href="./"
          >
            Back to Gaming Hood
          </a>

        </div>

      `;

  }

}


init();
