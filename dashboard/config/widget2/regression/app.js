/* Regression — students plot (temperature, customers) points on a coordinate
   plane; a least-squares line predicts ice-cream-shop attendance for a queried
   temperature. */

/* ---------- Scales ---------- */

const X_MIN = 50,
  X_MAX = 100; // outdoor temperature, °F
const Y_MIN = 0,
  Y_MAX = 100; // customers
const X_MAJOR = 10,
  X_MINOR = 5;
const Y_MAJOR = 20,
  Y_MINOR = 10;

const VIEW = 400; // SVG user-unit square
const M = { top: 20, right: 20, bottom: 50, left: 60 };
const PLOT = {
  x0: M.left, // left edge (temp = X_MIN)
  x1: VIEW - M.right, // right edge (temp = X_MAX)
  y0: VIEW - M.bottom, // bottom edge (customers = Y_MIN)
  y1: M.top, // top edge (customers = Y_MAX)
};
const plotW = PLOT.x1 - PLOT.x0;
const plotH = PLOT.y0 - PLOT.y1;

// data -> pixel mappings
const tx = (t) => PLOT.x0 + ((t - X_MIN) / (X_MAX - X_MIN)) * plotW;
const ty = (c) => PLOT.y0 - ((c - Y_MIN) / (Y_MAX - Y_MIN)) * plotH;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const SVG_NS = "http://www.w3.org/2000/svg";

/* ---------- State ---------- */

// Seeded with a few representative days so a prediction can be made right away.
const state = {
  points: [
    { t: 50, c: 0 },
    { t: 55, c: 2 },
    { t: 60, c: 10 },
    { t: 65, c: 5 },
    { t: 70, c: 75 },
    { t: 80, c: 20 },
    { t: 80, c: 43 },
    { t: 90, c: 60 },
    { t: 95, c: 80 },
  ],
};

/* ---------- DOM ---------- */

const dataContainer = document.querySelector(".data-container");
const predictionEl = document.getElementById("prediction");
const temperatureInput = document.getElementById("temperature-input");
const tempDownBtn = document.getElementById("temp-down");
const tempUpBtn = document.getElementById("temp-up");
const errorEl = document.getElementById("temp-error");

const svg = document.createElementNS(SVG_NS, "svg");
svg.setAttribute("viewBox", `0 0 ${VIEW} ${VIEW}`);
svg.setAttribute("role", "img");
// Text alternative for the chart. The full point list also lives in the
// "View the plotted data as a table" disclosure below the plot (1.1.1, 1.3.1).
svg.setAttribute(
  "aria-label",
  `Scatter plot of temperature in degrees Fahrenheit (horizontal, 50 to 100) ` +
    `against number of customers (vertical, 0 to 100). ${state.points.length} ` +
    `days are plotted. See the data table below the plot for exact values.`,
);
dataContainer.appendChild(svg);

/* ---------- SVG helper ---------- */

function el(name, attrs = {}, parent) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue;
    node.setAttribute(k, v);
  }
  if (parent) parent.appendChild(node);
  return node;
}

/* ---------- Static layer (axes, ticks, labels) ---------- */

let dynamic; // group rebuilt on every render

function buildStatic() {
  const g = el("g", {}, svg);

  // major gridlines
  for (let t = X_MIN; t <= X_MAX; t += X_MAJOR) {
    el(
      "line",
      { class: "grid", x1: tx(t), y1: PLOT.y1, x2: tx(t), y2: PLOT.y0 },
      g,
    );
  }
  for (let c = Y_MIN; c <= Y_MAX; c += Y_MAJOR) {
    el(
      "line",
      { class: "grid", x1: PLOT.x0, y1: ty(c), x2: PLOT.x1, y2: ty(c) },
      g,
    );
  }

  // axes
  el(
    "line",
    { class: "axis", x1: PLOT.x0, y1: PLOT.y0, x2: PLOT.x1, y2: PLOT.y0 },
    g,
  );
  el(
    "line",
    { class: "axis", x1: PLOT.x0, y1: PLOT.y0, x2: PLOT.x0, y2: PLOT.y1 },
    g,
  );

  // x ticks + labels
  for (let t = X_MIN; t <= X_MAX; t += X_MINOR) {
    const major = (t - X_MIN) % X_MAJOR === 0;
    el(
      "line",
      {
        class: major ? "tick" : "tick-minor",
        x1: tx(t),
        y1: PLOT.y0,
        x2: tx(t),
        y2: PLOT.y0 + (major ? 8 : 4),
      },
      g,
    );
    if (major) {
      el(
        "text",
        {
          class: "tick-label",
          x: tx(t),
          y: PLOT.y0 + 12,
          "text-anchor": "middle",
          "dominant-baseline": "hanging",
        },
        g,
      ).textContent = t;
    }
  }

  // y ticks + labels
  for (let c = Y_MIN; c <= Y_MAX; c += Y_MINOR) {
    const major = c % Y_MAJOR === 0;
    el(
      "line",
      {
        class: major ? "tick" : "tick-minor",
        x1: PLOT.x0,
        y1: ty(c),
        x2: PLOT.x0 - (major ? 8 : 4),
        y2: ty(c),
      },
      g,
    );
    if (major) {
      el(
        "text",
        {
          class: "tick-label",
          x: PLOT.x0 - 11,
          y: ty(c),
          "text-anchor": "end",
          "dominant-baseline": "central",
        },
        g,
      ).textContent = c;
    }
  }

  // axis titles
  el(
    "text",
    {
      class: "axis-title",
      x: (PLOT.x0 + PLOT.x1) / 2,
      y: VIEW - 8,
      "text-anchor": "middle",
    },
    g,
  ).textContent = "Temperature (°F)";

  const cy = (PLOT.y0 + PLOT.y1) / 2;
  el(
    "text",
    {
      class: "axis-title",
      x: 14,
      y: cy,
      "text-anchor": "middle",
      transform: `rotate(-90 14 ${cy})`,
    },
    g,
  ).textContent = "Customers";

  dynamic = el("g", {}, svg);
}

/* ---------- Regression ---------- */

// Ordinary least-squares line through the plotted points.
function fit(points) {
  const n = points.length;
  if (n < 2) return null;
  let sx = 0,
    sy = 0,
    sxx = 0,
    sxy = 0;
  for (const p of points) {
    sx += p.t;
    sy += p.c;
    sxx += p.t * p.t;
    sxy += p.t * p.c;
  }
  const denom = n * sxx - sx * sx;
  if (denom === 0) return null; // all points share one temperature
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  return { slope, intercept };
}

/* ---------- Interaction ---------- */

// The plot is read-only: points are seeded and displayed but cannot be added
// or removed. Users read the plotted values from the plot itself or from the
// data table below it.

// Returns true if the value actually changed (false once a bound is reached).
function stepTemperature(delta) {
  const current = parseFloat(temperatureInput.value);
  const base = Number.isNaN(current) ? X_MIN : current;
  const next = clamp(Math.round(base + delta), X_MIN, X_MAX);
  if (!Number.isNaN(current) && next === base) return false;
  temperatureInput.value = next;
  render();
  return true;
}

temperatureInput.addEventListener("input", render);

// Press-and-hold to cycle the temperature quickly.
const HOLD_DELAY_MS = 300; // pause before auto-repeat starts
const REPEAT_MS = 60; // step interval while held

function attachHold(button, delta) {
  let timeoutId = null;
  let intervalId = null;
  let armed = false; // pointer is currently pressed on this button
  let repeated = false; // an auto-repeat step has already fired

  function stopRepeat() {
    clearTimeout(timeoutId);
    clearInterval(intervalId);
    timeoutId = null;
    intervalId = null;
  }

  function cancel() {
    stopRepeat();
    armed = false;
  }

  function repeat() {
    repeated = true;
    if (!stepTemperature(delta)) stopRepeat(); // hit a bound — quit
  }

  button.addEventListener("pointerdown", (e) => {
    if (e.button > 0) return; // primary button / touch only
    e.preventDefault();
    // No pointer capture: leaving the button fires pointerleave and aborts,
    // so a press can be cancelled by dragging off before release (2.5.2).
    armed = true;
    repeated = false;
    stopRepeat();
    timeoutId = setTimeout(() => {
      // Held long enough — begin auto-repeat.
      if (stepTemperature(delta)) intervalId = setInterval(repeat, REPEAT_MS);
      repeated = true;
    }, HOLD_DELAY_MS);
  });

  // Commit a single discrete step only on release over the button, and only if
  // the press did not turn into a hold. Moving off the button cancels instead.
  button.addEventListener("pointerup", () => {
    if (armed && !repeated) stepTemperature(delta);
    cancel();
  });

  button.addEventListener("pointerleave", cancel);
  button.addEventListener("pointercancel", cancel);

  // Keyboard activation (Enter / Space) fires a click with detail 0.
  button.addEventListener("click", (e) => {
    if (e.detail === 0) stepTemperature(delta);
  });
}

attachHold(tempDownBtn, -1);
attachHold(tempUpBtn, 1);

/* ---------- Validation ---------- */

// Interprets the current field contents. An out-of-range or non-numeric entry
// is reported rather than silently clamped into a prediction (3.3.1, 3.3.3).
function readTemperature() {
  const raw = temperatureInput.value.trim();
  if (raw === "") {
    return { ok: false, message: `Enter a temperature between ${X_MIN} and ${X_MAX} °F.` };
  }
  const value = Number(raw);
  if (Number.isNaN(value)) {
    return { ok: false, message: `Enter a temperature between ${X_MIN} and ${X_MAX} °F.` };
  }
  if (value < X_MIN || value > X_MAX) {
    return { ok: false, message: `Temperature must be between ${X_MIN} and ${X_MAX} °F.` };
  }
  return { ok: true, value };
}

/* ---------- Render ---------- */

function render() {
  const model = fit(state.points);
  const temp = readTemperature();

  updatePrediction(model, temp);

  dynamic.replaceChildren();

  // prediction marker + guide lines (the fitted line itself is hidden)
  if (model && temp.ok) {
    const cRaw = model.slope * temp.value + model.intercept;
    const mx = tx(temp.value);
    const my = ty(clamp(cRaw, Y_MIN, Y_MAX));
    el(
      "line",
      { class: "pred-guide", x1: mx, y1: PLOT.y0, x2: mx, y2: my },
      dynamic,
    );
    el(
      "line",
      { class: "pred-guide", x1: mx, y1: my, x2: PLOT.x0, y2: my },
      dynamic,
    );
    el("circle", { class: "pred-point", cx: mx, cy: my, r: 6 }, dynamic);
  }

  // data points
  for (const p of state.points) {
    const dot = el(
      "circle",
      { class: "data-point", cx: tx(p.t), cy: ty(p.c), r: 5 },
      dynamic,
    );
    el("title", {}, dot).textContent = `${p.t}°F, ${p.c} customers`;
  }

  // reflect range limits on the stepper buttons
  function setBound(btn, atBound) {
    btn.setAttribute("aria-disabled", String(atBound));
  }
  setBound(tempDownBtn, temp.ok && temp.value <= X_MIN);
  setBound(tempUpBtn,   temp.ok && temp.value >= X_MAX);
}

function updatePrediction(model, temp) {
  if (!temp.ok) {
    predictionEl.textContent = "?";
    errorEl.textContent = temp.message;
    temperatureInput.setAttribute("aria-invalid", "true");
    return;
  }
  errorEl.textContent = "";
  temperatureInput.removeAttribute("aria-invalid");
  if (!model) {
    predictionEl.textContent = "?";
    return;
  }
  const customers = Math.max(
    0,
    Math.round(model.slope * temp.value + model.intercept),
  );
  predictionEl.textContent = customers;
}

/* ---------- Data table (text alternative for the plot) ---------- */

function buildDataTable() {
  const container = document.getElementById("data-table");
  if (!container) return;

  const rows = state.points
    .slice()
    .sort((a, b) => a.t - b.t || a.c - b.c)
    .map((p) => `<tr><td>${p.t}</td><td>${p.c}</td></tr>`)
    .join("");

  container.innerHTML =
    `<table>` +
    `<caption>Recorded days, sorted by temperature</caption>` +
    `<thead><tr>` +
    `<th scope="col">Temperature (°F)</th>` +
    `<th scope="col">Customers</th>` +
    `</tr></thead>` +
    `<tbody>${rows}</tbody>` +
    `</table>`;
}

/* ---------- Boot ---------- */

buildStatic();
buildDataTable();
render();
