/* =========================================================
   GAMING HOOD COMPATIBILITY SYSTEM
   Version 2
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
   GAME ID
========================================================= */

function getGameId() {

  return new URLSearchParams(
    location.search
  ).get("game");

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
      Number(game.min_ram) || 0,

    recommendedRam:
      Number(game.recommended_ram) || 0,

    gpu:
      game.gpu ||
      "",

    android:
      game.android_support ||
      "",

    vulkanRequired:
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
   ANDROID VERSION
========================================================= */

function detectAndroidVersion() {

  const ua =
    navigator.userAgent || "";

  const match =
    ua.match(
      /Android\s([0-9.]+)/i
    );

  return match
    ? match[1]
    : "Unknown";

}


/* =========================================================
   DEVICE NAME DETECTION
========================================================= */

function detectDeviceName() {

  const ua =
    navigator.userAgent || "";


  /*
   * Samsung models
   */

  const samsungModels = {

    "SM-G960":
      "Samsung Galaxy S9",

    "SM-G965":
      "Samsung Galaxy S9+",

    "SM-N950":
      "Samsung Galaxy Note 8",

    "SM-N960":
      "Samsung Galaxy Note 9",

    "SM-G950":
      "Samsung Galaxy S8",

    "SM-G955":
      "Samsung Galaxy S8+",

    "SM-G970":
      "Samsung Galaxy S10e",

    "SM-G973":
      "Samsung Galaxy S10",

    "SM-G975":
      "Samsung Galaxy S10+"

  };


  for (
    const model in samsungModels
  ) {

    if (
      new RegExp(model, "i")
        .test(ua)
    ) {

      return samsungModels[model];

    }

  }


  /*
   * Pixel
   */

  const pixel =
    ua.match(
      /;\s*(Pixel[^;)]+?)(?:\s+Build\/|[;)])/i
    );

  if (pixel) {

    return pixel[1].trim();

  }


  /*
   * Xiaomi / Redmi
   */

  const redmi =
    ua.match(
      /;\s*(Redmi[^;)]+?)(?:\s+Build\/|[;)])/i
    );

  if (redmi) {

    return redmi[1].trim();

  }


  const xiaomi =
    ua.match(
      /;\s*(Xiaomi[^;)]+?)(?:\s+Build\/|[;)])/i
    );

  if (xiaomi) {

    return xiaomi[1].trim();

  }


  /*
   * OnePlus
   */

  const oneplus =
    ua.match(
      /;\s*(ONEPLUS[^;)]+?)(?:\s+Build\/|[;)])/i
    );

  if (oneplus) {

    return oneplus[1].trim();

  }


  /*
   * Generic Android model.
   *
   * Avoid returning things like:
   * K
   * wv
   * Mobile
   * Build
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
      match[1]
        .trim();


    if (
      model.length >= 3 &&
      !/^(k|wv|mobile|android)$/i.test(model) &&
      !/^[a-z]$/i.test(model)
    ) {

      return model;

    }

  }


  return "Android Device";

}


/* =========================================================
   RAM DETECTION
========================================================= */

function detectRAM() {

  /*
   * navigator.deviceMemory does NOT necessarily expose
   * the phone's physical RAM. Browsers intentionally
   * round/cap the value.
   */

  if (
    typeof navigator.deviceMemory ===
    "number"
  ) {

    return Number(
      navigator.deviceMemory
    );

  }


  return null;

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


      if (
        renderer &&
        renderer !== "WebKit WebGL"
      ) {

        return cleanGPUName(
          renderer
        );

      }

    }


    const renderer =
      gl.getParameter(
        gl.RENDERER
      );


    return cleanGPUName(
      renderer ||
      "Unknown GPU"
    );

  }

  catch {

    return "Unknown GPU";

  }

}


/* =========================================================
   CLEAN GPU NAME
========================================================= */

function cleanGPUName(
  gpu = ""
) {

  let name =
    String(gpu)
      .trim();


  /*
   * Common Android ANGLE strings
   */

  name =
    name.replace(
      /^ANGLE\s*\(/i,
      ""
    );


  name =
    name.replace(
      /\)\s*$/,
      ""
    );


  /*
   * Qualcomm prefixes
   */

  name =
    name.replace(
      /qualcomm[^a-z0-9]*/i,
      ""
    );


  /*
   * Google/ANGLE suffixes are not useful
   * for the compatibility comparison.
   */

  name =
    name.replace(
      /\s+OpenGL ES.*$/i,
      ""
    );


  return name ||
    "Unknown GPU";

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
      navigator.userAgent || ""

  };

}


/* =========================================================
   NORMALIZE GPU
========================================================= */

function normalizeGPUName(
  gpu = ""
) {

  return String(gpu)
    .toLowerCase()
    .replace(/\(tm\)/g, "")
    .replace(/\(r\)/g, "")
    .replace(/graphics/g, "")
    .replace(/gpu/g, "")
    .replace(/\s+/g, " ")
    .trim();

}


/* =========================================================
   GPU FAMILY
========================================================= */

function getGPUFamily(
  gpu = ""
) {

  const name =
    normalizeGPUName(gpu);


  if (
    name.includes("adreno")
  ) {

    return "adreno";

  }


  if (
    name.includes("mali")
  ) {

    return "mali";

  }


  if (
    name.includes("powervr")
  ) {

    return "powervr";

  }


  if (
    name.includes("apple")
  ) {

    return "apple";

  }


  if (
    name.includes("xclipse")
  ) {

    return "xclipse";

  }


  return "unknown";

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
   * ADRENO
   *
   * Approximate generation score.
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
      615: 9,
      616: 9,
      618: 9,
      620: 10,

      630: 11,
      640: 12,

      650: 12,
      660: 13,
      662: 13,

      680: 14,
      685: 15,
      690: 15,
      695: 15,

      710: 16,
      720: 17,
      725: 17,
      730: 18,
      732: 18,
      740: 19,
      750: 19,
      755: 20,

      760: 20,
      765: 20,
      768: 20,

      810: 21,
      820: 22,
      830: 22,
      835: 23,
      840: 23,
      845: 23,
      850: 24,
      855: 25,
      860: 25,
      865: 26,
      870: 27,
      8gen1: 28

    };


    if (
      scores[number] !== undefined
    ) {

      return scores[number];

    }


    return estimateAdrenoScore(
      number
    );

  }


  /*
   * MALI
   */

  if (
    name.includes("mali")
  ) {

    if (
      /g720|g715/i.test(name)
    ) {

      return 21;

    }


    if (
      /g710/i.test(name)
    ) {

      return 20;

    }


    if (
      /g78/i.test(name)
    ) {

      return 17;

    }


    if (
      /g77/i.test(name)
    ) {

      return 16;

    }


    if (
      /g76/i.test(name)
    ) {

      return 14;

    }


    if (
      /g57/i.test(name)
    ) {

      return 11;

    }


    if (
      /g52/i.test(name)
    ) {

      return 9;

    }


    if (
      /g51/i.test(name)
    ) {

      return 8;

    }


    if (
      /g72/i.test(name)
    ) {

      return 7;

    }


    if (
      /g71/i.test(name)
    ) {

      return 7;

    }


    if (
      /t880/i.test(name)
    ) {

      return 6;

    }


    if (
      /t760/i.test(name)
    ) {

      return 7;

    }


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
   * Apple
   */

  if (
    name.includes("apple")
  ) {

    return 22;

  }


  /*
   * Xclipse
   */

  if (
    name.includes("xclipse")
  ) {

    if (
      /940/i.test(name)
    ) return 22;

    if (
      /920/i.test(name)
    ) return 20;

    if (
      /730/i.test(name)
    ) return 17;

    return 15;

  }


  return null;

}


/* =========================================================
   ADRENO ESTIMATION
========================================================= */

function estimateAdrenoScore(
  number
) {

  if (
    number >= 800
  ) return 28;

  if (
    number >= 700
  ) return 17;

  if (
    number >= 600
  ) return 9;

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
   REQUIRED GPU SCORE
========================================================= */

function getRequiredGPUScore(
  requirement
) {

  if (!requirement)
    return null;


  const text =
    String(requirement)
      .toLowerCase();


  /*
   * Adreno
   */

  const adreno =
    text.match(
      /adreno[^0-9]*(\d{3,4})/i
    );


  if (adreno) {

    return getGPUScore(
      `Adreno ${adreno[1]}`
    );

  }


  /*
   * Mali
   */

  const mali =
    text.match(
      /mali[^a-z0-9]*(g\d{2,3}|t\d{3,4})/i
    );


  if (mali) {

    return getGPUScore(
      `Mali ${mali[1]}`
    );

  }


  /*
   * PowerVR
   */

  if (
    /powervr/i.test(text)
  ) {

    return 7;

  }


  /*
   * Apple
   */

  if (
    /apple/i.test(text)
  ) {

    return 20;

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

      status:
        "unknown",

      message:
        "No GPU requirement specified."

    };

  }


  if (
    !deviceGPU ||
    /unknown/i.test(
      deviceGPU
    )
  ) {

    return {

      status:
        "unknown",

      message:
        "GPU could not be detected."

    };

  }


  const deviceFamily =
    getGPUFamily(
      deviceGPU
    );


  const requiredFamily =
    getGPUFamily(
      requiredGPU
    );


  const deviceScore =
    getGPUScore(
      deviceGPU
    );


  const requiredScore =
    getRequiredGPUScore(
      requiredGPU
    );


  /*
   * Exact / same-family comparison.
   */

  if (
    deviceScore !== null &&
    requiredScore !== null &&
    deviceFamily === requiredFamily
  ) {

    if (
      deviceScore >=
      requiredScore
    ) {

      return {

        status:
          "pass",

        message:
          "GPU meets or exceeds the requirement."

      };

    }


    return {

      status:
        "fail",

      message:
        "GPU is below the required level."

    };

  }


  /*
   * Cross-vendor GPU comparison.
   *
   * This is approximate, so don't call it
   * a guaranteed pass.
   */

  if (
    deviceScore !== null &&
    requiredScore !== null
  ) {

    if (
      deviceScore >=
      requiredScore + 2
    ) {

      return {

        status:
          "pass",

        message:
          "GPU performance appears sufficient."

      };

    }


    if (
      deviceScore >=
      requiredScore
    ) {

      return {

        status:
          "warning",

        message:
          "GPU appears close to the requirement."

      };

    }


    return {

      status:
        "fail",

      message:
        "GPU performance appears below the requirement."

    };

  }


  /*
   * Text fallback.
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
    device.includes(required) ||
    required.includes(device)
  ) {

    return {

      status:
        "pass",

      message:
        "GPU appears compatible."

    };

  }


  return {

    status:
      "unknown",

    message:
      "GPU could not be compared automatically."

  };

}


/* =========================================================
   ANDROID VERSION
========================================================= */

function parseAndroidVersion(
  value
) {

  if (!value)
    return null;


  const match =
    String(value)
      .match(
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

      status:
        "unknown",

      message:
        "No Android requirement specified."

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

      status:
        "unknown",

      message:
        "Android version could not be compared."

    };

  }


  if (
    device >= required
  ) {

    return {

      status:
        "pass",

      message:
        "Android version is sufficient."

    };

  }


  return {

    status:
      "fail",

    message:
      "Android version is too old."

  };

}


/* =========================================================
   RAM
========================================================= */

function compareRAM(
  deviceRAM,
  game
) {

  if (
    !game.minRam &&
    !game.recommendedRam
  ) {

    return {

      status:
        "unknown",

      message:
        "No RAM requirement specified."

    };

  }


  if (
    deviceRAM === null
  ) {

    return {

      status:
        "unknown",

      message:
        "RAM could not be detected."

    };

  }


  const minimum =
    game.minRam ||
    game.recommendedRam;


  const recommended =
    game.recommendedRam ||
    minimum;


  if (
    deviceRAM >=
    recommended
  ) {

    return {

      status:
        "pass",

      message:
        `${deviceRAM} GB RAM meets the recommended requirement.`

    };

  }


  if (
    deviceRAM >=
    minimum
  ) {

    return {

      status:
        "warning",

      message:
        `${deviceRAM} GB RAM meets the minimum requirement.`

    };

  }


  return {

    status:
      "fail",

    message:
      `${deviceRAM} GB RAM is below the minimum requirement.`

  };

}


/* =========================================================
   VULKAN
========================================================= */

function detectVulkanSupport() {

  try {

    const canvas =
      document.createElement(
        "canvas"
      );


    const gl =
      canvas.getContext(
        "webgl2"
      );


    /*
     * WebGL2 does NOT prove Android Vulkan
     * support, so don't claim it does.
     *
     * This function intentionally returns
     * unknown unless the browser exposes
     * a useful signal.
     */

    if (!gl) {

      return null;

    }


    return null;

  }

  catch {

    return null;

  }

}


/* =========================================================
   VULKAN COMPARISON
========================================================= */

function compareVulkan(
  device,
  game
) {

  if (
    !game.vulkanRequired
  ) {

    return {

      status:
        "pass",

      message:
        "Vulkan is not required."

    };

  }


  /*
   * Browser JavaScript cannot reliably determine
   * Android Vulkan support.
   *
   * Therefore we do not pretend to know.
   */

  return {

    status:
      "unknown",

    message:
      "Vulkan is required. Verify that your device supports Vulkan."

  };

}


/* =========================================================
   OVERALL RESULT
========================================================= */

function calculateResult(
  results
) {

  const failures =
    results.filter(
      item =>
        item.status === "fail"
    ).length;


  const warnings =
    results.filter(
      item =>
        item.status === "warning"
    ).length;


  const unknowns =
    results.filter(
      item =>
        item.status === "unknown"
    ).length;


  const passes =
    results.filter(
      item =>
        item.status === "pass"
    ).length;


  /*
   * Two or more hard failures.
   */

  if (
    failures >= 2
  ) {

    return {

      type:
        "bad",

      icon:
        "✕",

      title:
        "Not Recommended",

      message:
        "Your device falls below several important requirements for this game."

    };

  }


  /*
   * One hard failure.
   */

  if (
    failures === 1
  ) {

    return {

      type:
        "warning",

      icon:
        "!",

      title:
        "May Struggle",

      message:
        "Your device falls below at least one important requirement."

    };

  }


  /*
   * No failures, but warnings.
   */

  if (
    warnings > 0
  ) {

    return {

      type:
        "playable",

      icon:
        "✓",

      title:
        "Playable",

      message:
        "Your device appears capable of running this game, but some settings or performance limitations may apply."

    };

  }


  /*
   * Everything known passes.
   */

  if (
    passes > 0 &&
    unknowns === 0
  ) {

    return {

      type:
        "good",

      icon:
        "✓",

      title:
        "Should Run",

      message:
        "Your device appears to meet the known requirements for this game."

    };

  }


  /*
   * Some requirements cannot be verified.
   */

  if (
    passes > 0 &&
    unknowns > 0
  ) {

    return {

      type:
        "playable",

      icon:
        "✓",

      title:
        "Likely Playable",

      message:
        "Your device meets the requirements we could verify, but some information could not be detected automatically."

    };

  }


  return {

    type:
      "playable",

    icon:
      "?",

    title:
      "Unable to Determine",

    message:
      "There is not enough reliable information to make a compatibility decision."

  };

}


/* =========================================================
   DEVICE CARD
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

          <span>
            Device
          </span>

          <strong>
            ${escapeHTML(
              device.name
            )}
          </strong>

        </div>


        <div class="device-item">

          <span>
            RAM
          </span>

          <strong>

            ${
              device.ram !== null
                ? `${device.ram} GB`
                : "Not detected"
            }

          </strong>

        </div>


        <div class="device-item">

          <span>
            GPU
          </span>

          <strong>

            ${escapeHTML(
              device.gpu
            )}

          </strong>

        </div>


        <div class="device-item">

          <span>
            Android
          </span>

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
   GAME REQUIREMENTS
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

          <span>
            Platform
          </span>

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

                <span>
                  Minimum RAM
                </span>

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

                <span>
                  Recommended RAM
                </span>

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

                <span>
                  GPU
                </span>

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

                <span>
                  Android
                </span>

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

          <span>
            Vulkan
          </span>

          <strong>

            ${
              game.vulkanRequired
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
   STATUS ICON
========================================================= */

function statusIcon(
  status
) {

  if (
    status === "pass"
  ) return "✓";

  if (
    status === "fail"
  ) return "✕";

  if (
    status === "warning"
  ) return "!";

  return "?";

}


/* =========================================================
   COMPARISON
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


  const vulkan =
    compareVulkan(
      device,
      game
    );


  const results = [
    ram,
    gpu,
    android,
    vulkan
  ];


  const result =
    calculateResult(
      results
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
        ${escapeHTML(
          result.message
        )}
      </p>

    </section>


    <section class="game-requirement-card">

      <h2>
        Compatibility Details
      </h2>


      <div class="comparison-list">


        ${renderComparisonRow(
          "RAM",
          ram
        )}


        ${renderComparisonRow(
          "GPU",
          gpu
        )}


        ${renderComparisonRow(
          "Android",
          android
        )}


        ${renderComparisonRow(
          "Vulkan",
          vulkan
        )}

      </div>

    </section>

  `;

}


/* =========================================================
   COMPARISON ROW
========================================================= */

function renderComparisonRow(
  label,
  result
) {

  return `

    <div class="comparison-row">

      <span>
        ${escapeHTML(
          label
        )}
      </span>


      <strong
        class="${escapeHTML(
          result.status
        )}"
      >

        ${statusIcon(
          result.status
        )}

        ${escapeHTML(
          result.message
        )}

      </strong>

    </div>

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
        Browser detection is not perfect.
        If any device information is incorrect
        or missing, enter it manually below.
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
        type="button"
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


  /*
   * Pre-fill the form with detected values.
   */

  const deviceInput =
    $("#manualDevice");


  const ramInput =
    $("#manualRam");


  const gpuInput =
    $("#manualGpu");


  const androidInput =
    $("#manualAndroid");


  if (
    deviceInput &&
    detectedDevice
  ) {

    deviceInput.value =
      detectedDevice.name !==
      "Android Device"
        ? detectedDevice.name
        : "";

  }


  if (
    ramInput &&
    detectedDevice &&
    detectedDevice.ram !== null
  ) {

    ramInput.value =
      detectedDevice.ram;

  }


  if (
    gpuInput &&
    detectedDevice
  ) {

    gpuInput.value =
      detectedDevice.gpu !==
      "Unknown GPU"
        ? detectedDevice.gpu
        : "";

  }


  if (
    androidInput &&
    detectedDevice
  ) {

    androidInput.value =
      detectedDevice.android !==
      "Unknown"
        ? detectedDevice.android
        : "";

  }


  button.addEventListener(
    "click",
    () => {

      const ramValue =
        Number(
          ramInput?.value
        );


      const device = {

        name:
          deviceInput
            ?.value
            .trim() ||
          "Manual Device",

        ram:
          ramValue > 0
            ? ramValue
            : null,

        gpu:
          gpuInput
            ?.value
            .trim() ||
          "Unknown GPU",

        android:
          androidInput
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


      /*
       * Scroll back to the result.
       */

      setTimeout(
        () => {

          const result =
            document.querySelector(
              ".result-card"
            );


          result?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

        },
        50
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


  if (!content)
    return;


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
          String(game.id) ===
          String(gameId)
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


    /*
     * Detect device.
     */

    detectedDevice =
      detectDevice();


    /*
     * Render.
     */

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


/* =========================================================
   START
========================================================= */

init();
