// controls.js
// Midpoint mapping:
// - Slider midpoint = BAD baseline (Level 1)
// - Left of midpoint = WORSE
// - Right of midpoint = BETTER (improved, not "perfect")
//
// Visual-only controls: no filters, no hidden logic.
// Refactor: updates are scheduled with requestAnimationFrame for snappier sliders.

const $ = (id) => document.getElementById(id);

const app = document.querySelector(".app");
const nav = document.querySelector(".app nav");
const backItem = document.querySelector(".app .nav-back");

if (!app || !nav) console.error("Missing .app or .app nav in HTML.");

/* -----------------------
   RAF scheduler (snappy)
----------------------- */
let rafId = 0;
const pending = new Map();

function schedule(key, fn) {
  pending.set(key, fn);
  if (rafId) return;

  rafId = requestAnimationFrame(() => {
    rafId = 0;
    for (const [, job] of pending) job();
    pending.clear();
  });
}

/* -----------------------
   Helpers
----------------------- */
function setVar(name, value) {
  if (!app) return;
  app.style.setProperty(name, value);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// returns t in [-1, +1] where 0 = midpoint
function signedT(value, min, max) {
  const minN = Number(min);
  const maxN = Number(max);
  const mid = (minN + maxN) / 2;
  const v = Number(value);

  if (v === mid) return 0;
  if (v < mid) return -((mid - v) / (mid - minN));
  return (v - mid) / (maxN - mid);
}

function rgb(arr) {
  return `rgb(${arr[0]}, ${arr[1]}, ${arr[2]})`;
}

function mixRGB(from, to, t) {
  return [
    Math.round(lerp(from[0], to[0], t)),
    Math.round(lerp(from[1], to[1], t)),
    Math.round(lerp(from[2], to[2], t)),
  ];
}

/* -----------------------
   Nav positioning (visual only)
----------------------- */
const navPlaceholder = document.createComment("nav-placeholder");
if (nav && nav.parentNode) nav.parentNode.insertBefore(navPlaceholder, nav);

function moveNavToTop() {
  if (!app || !nav) return;
  const header = app.querySelector("header");
  if (header) header.after(nav);
}

function moveNavToBottom() {
  if (!navPlaceholder || !nav) return;
  navPlaceholder.parentNode.insertBefore(nav, navPlaceholder);
}

function setNavPosition(position) {
  if (!nav) return;

  nav.classList.remove("nav-top", "nav-bottom");

  if (position === "top") {
    moveNavToTop();
    nav.classList.add("nav-top");
    app?.classList.add("nav-is-top");
  } else {
    moveNavToBottom();
    nav.classList.add("nav-bottom");
    app?.classList.remove("nav-is-top");
  }
}

function setBackVisibility(isVisible) {
  if (!backItem) return;
  backItem.style.display = isVisible ? "" : "none";
}

/* -----------------------
   BAD baseline values (midpoint maps here)
----------------------- */
const BASE_BAD = {
  cardTextPx: 10,
  cardLineHeight: 1.05,
  gapPx: 2,

  navFontPx: 9,
  navIconPx: 16,

  // NEW: tap targets baseline (BAD)
  tapPadPx: 1,
  tapFontPx: 10,

  palette: {
    bg: [246, 246, 246],
    text: [207, 207, 207],
    muted: [215, 215, 215],
    btnBg: [233, 233, 233],
    btnText: [216, 216, 216],
  },
};

// WORSE and BETTER targets (BETTER is intentionally not "perfect")
const TARGETS = {
  cardTextPx: { worse: 8, better: 16 },
  cardLineHeight: { worse: 1.0, better: 1.45 },
  gapPx: { worse: 0, better: 14 },

  navFontPx: { worse: 7, better: 13 },
  navIconPx: { worse: 12, better: 24 },

  // Tap targets (worse -> better)
  tapPadPx: { worse: 0, better: 10 },
  tapFontPx: { worse: 9, better: 12 },

  paletteWorse: {
    bg: [242, 242, 242],
    text: [225, 225, 225],
    muted: [232, 232, 232],
    btnBg: [238, 238, 238],
    btnText: [228, 228, 228],
  },

  paletteBetter: {
    bg: [255, 255, 255],
    text: [55, 55, 55],
    muted: [95, 95, 95],
    btnBg: [45, 45, 45],
    btnText: [245, 245, 245],
  },
};

/* -----------------------
   Apply functions (midpoint = bad baseline)
----------------------- */
function applyTapSize() {
  const el = $("tapSize");
  if (!el) return;

  const t = signedT(el.value, el.min, el.max);

  let pad, font;
  if (t < 0) {
    pad = lerp(BASE_BAD.tapPadPx, TARGETS.tapPadPx.worse, -t);
    font = lerp(BASE_BAD.tapFontPx, TARGETS.tapFontPx.worse, -t);
  } else {
    pad = lerp(BASE_BAD.tapPadPx, TARGETS.tapPadPx.better, t);
    font = lerp(BASE_BAD.tapFontPx, TARGETS.tapFontPx.better, t);
  }

  setVar("--tap-pad", `${pad.toFixed(0)}px`);
  setVar("--tap-font", `${font.toFixed(0)}px`);
}

function applyTextSize() {
  const el = $("textSize");
  if (!el) return;

  const t = signedT(el.value, el.min, el.max);

  const px =
    t < 0
      ? lerp(BASE_BAD.cardTextPx, TARGETS.cardTextPx.worse, -t)
      : lerp(BASE_BAD.cardTextPx, TARGETS.cardTextPx.better, t);

  setVar("--card-text", `${px.toFixed(0)}px`);
}

function applyLineHeight() {
  const el = $("lineHeight");
  if (!el) return;

  const t = signedT(el.value, el.min, el.max);

  const lh =
    t < 0
      ? lerp(BASE_BAD.cardLineHeight, TARGETS.cardLineHeight.worse, -t)
      : lerp(BASE_BAD.cardLineHeight, TARGETS.cardLineHeight.better, t);

  setVar("--card-lh", lh.toFixed(2));
}

function applySpacing() {
  const el = $("spacing");
  if (!el) return;

  const t = signedT(el.value, el.min, el.max);

  const gap =
    t < 0
      ? lerp(BASE_BAD.gapPx, TARGETS.gapPx.worse, -t)
      : lerp(BASE_BAD.gapPx, TARGETS.gapPx.better, t);

  setVar("--gap", `${gap.toFixed(0)}px`);
}

function applyNavSize() {
  const el = $("navSize");
  if (!el) return;

  const t = signedT(el.value, el.min, el.max);

  let fontPx, iconPx;
  if (t < 0) {
    fontPx = lerp(BASE_BAD.navFontPx, TARGETS.navFontPx.worse, -t);
    iconPx = lerp(BASE_BAD.navIconPx, TARGETS.navIconPx.worse, -t);
  } else {
    fontPx = lerp(BASE_BAD.navFontPx, TARGETS.navFontPx.better, t);
    iconPx = lerp(BASE_BAD.navIconPx, TARGETS.navIconPx.better, t);
  }

  setVar("--nav-font", `${fontPx.toFixed(0)}px`);
  setVar("--nav-icon", `${iconPx.toFixed(0)}px`);
}

function applyContrast() {
  const el = $("contrast");
  if (!el) return;

  const t = signedT(el.value, el.min, el.max);

  const base = BASE_BAD.palette;
  const worse = TARGETS.paletteWorse;
  const better = TARGETS.paletteBetter;

  const blendToward = (baseArr, targetArr, amt) => mixRGB(baseArr, targetArr, amt);

  const bg = t < 0 ? blendToward(base.bg, worse.bg, -t) : blendToward(base.bg, better.bg, t);
  const text = t < 0 ? blendToward(base.text, worse.text, -t) : blendToward(base.text, better.text, t);
  const muted = t < 0 ? blendToward(base.muted, worse.muted, -t) : blendToward(base.muted, better.muted, t);
  const btnBg = t < 0 ? blendToward(base.btnBg, worse.btnBg, -t) : blendToward(base.btnBg, better.btnBg, t);
  const btnText = t < 0 ? blendToward(base.btnText, worse.btnText, -t) : blendToward(base.btnText, better.btnText, t);

  setVar("--bg", rgb(bg));
  setVar("--text", rgb(text));
  setVar("--muted", rgb(muted));
  setVar("--btn-bg", rgb(btnBg));
  setVar("--btn-text", rgb(btnText));
}

function applyAll() {
  applyTextSize();
  applyLineHeight();
  applySpacing();
  applyContrast();
  applyNavSize();
  applyTapSize();

  if ($("navPosition")) setNavPosition($("navPosition").value);
  if ($("showBack")) setBackVisibility($("showBack").checked);
}

/* -----------------------
   Reset + initialization
----------------------- */
function setSlidersToMidpoints() {
  const ids = ["textSize", "lineHeight", "spacing", "contrast", "navSize", "tapSize"];
  for (const id of ids) {
    const el = $(id);
    if (!el) continue;
    const min = Number(el.min);
    const max = Number(el.max);
    el.value = String((min + max) / 2);
  }
}

function applyBadBaseline() {
  setVar("--card-text", `${BASE_BAD.cardTextPx}px`);
  setVar("--card-lh", BASE_BAD.cardLineHeight.toFixed(2));
  setVar("--gap", `${BASE_BAD.gapPx}px`);

  setVar("--nav-font", `${BASE_BAD.navFontPx}px`);
  setVar("--nav-icon", `${BASE_BAD.navIconPx}px`);

  // NEW: tap baseline vars
  setVar("--tap-pad", `${BASE_BAD.tapPadPx}px`);
  setVar("--tap-font", `${BASE_BAD.tapFontPx}px`);

  setVar("--bg", rgb(BASE_BAD.palette.bg));
  setVar("--text", rgb(BASE_BAD.palette.text));
  setVar("--muted", rgb(BASE_BAD.palette.muted));
  setVar("--btn-bg", rgb(BASE_BAD.palette.btnBg));
  setVar("--btn-text", rgb(BASE_BAD.palette.btnText));

  if ($("navPosition")) $("navPosition").value = "bottom";
  setNavPosition("bottom");

  if ($("showBack")) $("showBack").checked = true;
  setBackVisibility(true);
}

function wireControls() {
  const onInput = (id, fn) => {
    const el = $(id);
    if (!el) return;
    el.addEventListener("input", () => schedule(id, fn));
  };

  onInput("textSize", applyTextSize);
  onInput("lineHeight", applyLineHeight);
  onInput("spacing", applySpacing);
  onInput("contrast", applyContrast);
  onInput("navSize", applyNavSize);
  onInput("tapSize", applyTapSize); // NEW

  const navPos = $("navPosition");
  if (navPos) navPos.addEventListener("change", (e) => setNavPosition(e.target.value));

  const showBack = $("showBack");
  if (showBack) showBack.addEventListener("change", (e) => setBackVisibility(e.target.checked));

  const resetBtn = $("reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      setSlidersToMidpoints();
      applyBadBaseline();
      schedule("reset", applyAll);
    });
  }
}

wireControls();
setSlidersToMidpoints();
applyBadBaseline();
applyAll();