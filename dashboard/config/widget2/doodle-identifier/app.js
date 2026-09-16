/* ================================================================== */
/* Benchmarking (optional, for comparing backends)                     */
/* ================================================================== */

const benchmark = {
  trainStart: null,
  trainEnd: null,
  predictTimes: [],
  log: () => {
    if (benchmark.trainStart && benchmark.trainEnd) {
      console.log(
        `Training time: ${(benchmark.trainEnd - benchmark.trainStart).toFixed(0)} ms`,
      );
    }
    if (benchmark.predictTimes.length > 0) {
      const avg =
        benchmark.predictTimes.reduce((a, b) => a + b, 0) /
        benchmark.predictTimes.length;
      console.log(
        `Avg predict latency: ${avg.toFixed(2)} ms (${benchmark.predictTimes.length} samples)`,
      );
      console.log(
        `Memory: ${((performance.memory?.usedJSHeapSize || 0) / 1e6) | 0} MB`,
      );
    }
  },
};

// Wrap training timing:
const origTrain = window.train || train;
async function benchedTrain() {
  benchmark.trainStart = performance.now();
  await origTrain.call(this);
  benchmark.trainEnd = performance.now();
  benchmark.log();
}
train = benchedTrain;

// Wrap prediction timing:
const origSchedulePredict = schedulePredict;
function benchedSchedulePredict(force) {
  const t0 = performance.now();
  origSchedulePredict.call(this, force);
  if (state.lastPredictedId !== null) {
    benchmark.predictTimes.push(performance.now() - t0);
  }
}
schedulePredict = benchedSchedulePredict;

/**
 * app.js — Doodle Identifier
 *
 * Wires the page together: drawing, saving up to five example doodles per
 * category, training a model, and predicting in real time. All of the
 * neural-network specifics live behind createClassifier() in classifier.js,
 * so this file never mentions TensorFlow or ConvNetJS.
 */

/* ---------- Tunables ---------- */

const IMG_SIZE = 24; // what the network "sees": a 28x28 grayscale image
const INK_THRESHOLD = 0.15; // how dark a pixel must be to count as ink
const BRUSH = 8; // stroke width in canvas pixels
const MIN_DOODLES = 4; // required per category before training
const MAX_DOODLES = 6; // most a category will hold
const AUG_PER_SAMPLE = 8; // extra jittered copies made of each doodle
const PREDICT_THROTTLE_MS = 120; // limit how often we re-predict while drawing
const DEFAULT_CATEGORIES = ["Category 1", "Category 2"];

/* ---------- State ---------- */

const state = {
  categories: [], // [{ id, name, doodles: [Float32Array], dom }]
  nextId: 1,
  classifier: null,
  modelReady: false,
  isTraining: false,
  lastPredictedId: null,
  dataChangedSinceTrain: false, // training data edited after the last train
};

/* Briefly shake an element to signal "nothing happened". */
function nudge(el) {
  el.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-5px)" },
      { transform: "translateX(5px)" },
      { transform: "translateX(0)" },
    ],
    { duration: 220, easing: "ease-in-out" },
  );
}

/* ================================================================== */
/* Drawing surface — reusable behavior for any <canvas>                */
/* ================================================================== */

/**
 * Make a canvas drawable. Returns { clear, snapshot, isEmpty }.
 * onStroke is called as the user draws and when they finish a stroke.
 */
function attachDrawing(canvas, { onStroke, enabled = true } = {}) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  let drawing = false;
  let isEnabled = enabled;
  let points = [];

  function reset() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1e1971";
    ctx.fillStyle = "#1e1971";
    ctx.lineWidth = BRUSH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }
  reset();

  function pos(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  canvas.addEventListener("pointerdown", (event) => {
    if (!isEnabled) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    drawing = true;
    points = [pos(event)];
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, BRUSH / 2, 0, Math.PI * 2);
    ctx.fill();
    onStroke?.({ done: false });
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!drawing) return;
    event.preventDefault();
    const p = pos(event);
    points.push(p);
    // Smooth the line by drawing a quadratic curve through midpoints.
    if (points.length >= 3) {
      const a = points[points.length - 3];
      const b = points[points.length - 2];
      const c = points[points.length - 1];
      const start = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const end = { x: (b.x + c.x) / 2, y: (b.y + c.y) / 2 };
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.quadraticCurveTo(b.x, b.y, end.x, end.y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    onStroke?.({ done: false });
  });

  function end() {
    if (!drawing) return;
    drawing = false;
    onStroke?.({ done: true });
  }
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  canvas.addEventListener("pointerleave", end);

  return {
    clear() {
      reset();
      onStroke?.({ done: true });
    },
    snapshot() {
      return preprocess(canvas);
    },
    isEmpty() {
      return preprocess(canvas) === null;
    },
    setEnabled(value) {
      isEnabled = value;
      if (!value) end(); // abandon any stroke in progress
    },
  };
}

/* ================================================================== */
/* Preprocessing — turn a drawing into a 28x28 array the model sees    */
/* ================================================================== */

/**
 * Crop to the drawn ink, center it in a square, shrink to 28x28, and return
 * a Float32Array where each value is the ink amount (0 blank .. 1 solid).
 * Returns null when the canvas is blank.
 */
function preprocess(srcCanvas) {
  const w = srcCanvas.width;
  const h = srcCanvas.height;
  const sctx = srcCanvas.getContext("2d", { willReadFrequently: true });
  const data = sctx.getImageData(0, 0, w, h).data;

  let minX = w,
    minY = h,
    maxX = -1,
    maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const ink = 1 - (data[i] + data[i + 1] + data[i + 2]) / (3 * 255);
      if (ink > INK_THRESHOLD) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null; // nothing drawn

  const boxW = maxX - minX + 1;
  const boxH = maxY - minY + 1;
  const side = Math.max(boxW, boxH);
  const pad = Math.ceil(side * 0.15);
  const boxSide = side + pad * 2;
  const boxX = minX - (boxSide - boxW) / 2;
  const boxY = minY - (boxSide - boxH) / 2;

  // Copy the cropped, centered drawing into a square scratch canvas...
  const square = document.createElement("canvas");
  square.width = square.height = boxSide;
  const qctx = square.getContext("2d");
  qctx.fillStyle = "#ffffff";
  qctx.fillRect(0, 0, boxSide, boxSide);
  qctx.drawImage(srcCanvas, -boxX, -boxY);

  // ...then shrink that to 28x28.
  const small = document.createElement("canvas");
  small.width = small.height = IMG_SIZE;
  const mctx = small.getContext("2d");
  mctx.imageSmoothingEnabled = true;
  mctx.imageSmoothingQuality = "high";
  mctx.fillStyle = "#ffffff";
  mctx.fillRect(0, 0, IMG_SIZE, IMG_SIZE);
  mctx.drawImage(square, 0, 0, IMG_SIZE, IMG_SIZE);

  const px = mctx.getImageData(0, 0, IMG_SIZE, IMG_SIZE).data;
  const out = new Float32Array(IMG_SIZE * IMG_SIZE);
  for (let i = 0; i < out.length; i++) {
    const r = px[i * 4];
    const g = px[i * 4 + 1];
    const b = px[i * 4 + 2];
    out[i] = 1 - (r + g + b) / (3 * 255);
  }
  return out;
}

/* Paint a 28x28 sample into a (usually larger) display canvas. */
function renderSample(sample, targetCanvas) {
  const tctx = targetCanvas.getContext("2d");
  tctx.fillStyle = "#ffffff";
  tctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
  if (!sample) return;
  const mini = document.createElement("canvas");
  mini.width = mini.height = IMG_SIZE;
  const ictx = mini.getContext("2d");
  const imageData = ictx.createImageData(IMG_SIZE, IMG_SIZE);
  for (let p = 0; p < sample.length; p++) {
    const v = Math.round((1 - sample[p]) * 255);
    imageData.data[p * 4] = v;
    imageData.data[p * 4 + 1] = v;
    imageData.data[p * 4 + 2] = v;
    imageData.data[p * 4 + 3] = 255;
  }
  ictx.putImageData(imageData, 0, 0);
  tctx.imageSmoothingEnabled = false;
  tctx.drawImage(mini, 0, 0, targetCanvas.width, targetCanvas.height);
}

/* ================================================================== */
/* Augmentation — cheap extra training data from each doodle           */
/* ================================================================== */

function augment(src) {
  const size = IMG_SIZE;
  const out = new Float32Array(size * size);
  const cx = size / 2;
  const cy = size / 2;
  const angle = (Math.random() - 0.5) * (Math.PI / 180) * 30;
  const scale = 0.9 + Math.random() * 0.2;
  const tx = (Math.random() - 0.5) * 4;
  const ty = (Math.random() - 0.5) * 4;
  const cos = Math.cos(-angle) / scale;
  const sin = Math.sin(-angle) / scale;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx - tx;
      const dy = y - cy - ty;
      const sx = cos * dx + sin * dy + cx;
      const sy = -sin * dx + cos * dy + cy;
      const ix = Math.floor(sx);
      const iy = Math.floor(sy);
      const fx = sx - ix;
      const fy = sy - iy;
      let v = 0;
      for (let ny = 0; ny <= 1; ny++) {
        for (let nx = 0; nx <= 1; nx++) {
          const px = ix + nx;
          const py = iy + ny;
          if (px >= 0 && px < size && py >= 0 && py < size) {
            const weight = (nx ? fx : 1 - fx) * (ny ? fy : 1 - fy);
            v += weight * src[py * size + px];
          }
        }
      }
      out[y * size + x] = v;
    }
  }
  return out;
}

/* ================================================================== */
/* Categories                                                          */
/* ================================================================== */

const categoriesEl = document.getElementById("categories");

function displayName(category) {
  return category.name.trim() || `Category ${category.id}`;
}

function addCategory(name) {
  const id = state.nextId++;
  const category = {
    id,
    name: name || `Category ${id}`,
    doodles: [],
    dom: null,
  };
  state.categories.push(category);
  categoriesEl.appendChild(buildCategoryCard(category));
  updateCategoryUI(category);
  updateTrainButton();
}

function buildCategoryCard(category) {
  const card = document.createElement("section");
  card.className = "class-container";
  card.setAttribute("role", "group");

  const titleId = `category-${category.id}-title`;
  card.setAttribute("aria-labelledby", titleId);

  // Editable category name.
  const title = document.createElement("input");
  title.id = titleId;
  title.type = "text";
  title.value = category.name;
  title.placeholder = "Category title";
  title.setAttribute("aria-label", "Category name");
  title.addEventListener("input", () => {
    category.name = title.value;
    refreshLabels(category);
  });

  const content = document.createElement("div");
  content.className = "class-content-container";

  // Drawing area + saved doodles side by side.
  const drawData = document.createElement("div");
  drawData.className = "draw-data-container";

  const canvas = document.createElement("canvas");
  canvas.className = "draw-canvas";
  canvas.width = canvas.height = 280;
  canvas.setAttribute("role", "img");
  canvas.setAttribute(
    "aria-label",
    `Drawing area for ${displayName(category)}`,
  );

  const dataContainer = document.createElement("div");
  dataContainer.className = "data-container";
  dataContainer.setAttribute("role", "group");
  dataContainer.setAttribute(
    "aria-label",
    `Saved doodles for ${displayName(category)}`,
  );

  drawData.append(canvas, dataContainer);

  // Progress indicator (how many of the required doodles are drawn).
  const indicator = document.createElement("div");
  indicator.className = "doodle-indicator";
  const pips = document.createElement("div");
  pips.className = "pips";
  pips.setAttribute("aria-hidden", "true");
  for (let i = 0; i < MAX_DOODLES; i++) {
    const pip = document.createElement("span");
    pip.className = "pip" + (i < MIN_DOODLES ? " required" : "");
    pips.appendChild(pip);
  }
  const caption = document.createElement("p");
  caption.className = "indicator-caption";
  caption.setAttribute("role", "status");
  caption.setAttribute("aria-live", "polite");
  indicator.append(pips, caption);

  // Buttons.
  const buttons = document.createElement("div");
  buttons.className = "button-container";
  const addButton = document.createElement("button");
  addButton.className = "button-semantic button-primary add-button";
  addButton.textContent = "Add";
  const clearButton = document.createElement("button");
  clearButton.className = "button-semantic button-secondary clear-button";
  clearButton.textContent = "Clear";
  buttons.append(addButton, clearButton);

  content.append(drawData, indicator, buttons);
  card.append(title, content);

  // Behavior (attach after the canvas is in the DOM).
  const surface = attachDrawing(canvas);
  addButton.addEventListener("click", () => {
    if (category.doodles.length >= MAX_DOODLES) return;
    const sample = surface.snapshot();
    if (!sample) {
      nudge(addButton); // nothing drawn yet
      category.dom.caption.textContent = "Draw a doodle first, then add it.";
      return;
    }
    category.doodles.push(sample);
    surface.clear();
    invalidateModel(); // the data changed, so any trained model is now stale
    updateCategoryUI(category);
    updateTrainButton();
  });
  clearButton.addEventListener("click", () => surface.clear());

  category.dom = {
    card,
    title,
    canvas,
    dataContainer,
    pips,
    caption,
    addButton,
  };
  return card;
}

function removeDoodle(category, index) {
  category.doodles.splice(index, 1);
  invalidateModel(); // the data changed, so any trained model is now stale
  updateCategoryUI(category);
  updateTrainButton();
}

/* Refresh the aria-labels that embed a category's name when it is renamed. */
function refreshLabels(category) {
  const { canvas, dataContainer } = category.dom;
  const name = displayName(category);
  canvas.setAttribute("aria-label", `Drawing area for ${name}`);
  dataContainer.setAttribute("aria-label", `Saved doodles for ${name}`);
  // Relabel existing thumbnails in place (no need to redraw their canvases).
  const thumbs = dataContainer.querySelectorAll(".doodle");
  thumbs.forEach((thumb, i) => {
    thumb.setAttribute(
      "aria-label",
      `Remove doodle ${i + 1} of ${thumbs.length} from ${name}`,
    );
  });
  // Reflect the new name in a showing prediction (no re-inference needed).
  if (state.modelReady) showPrediction(state.lastPredictedId);
}

function updateCategoryUI(category) {
  const { pips, caption, addButton } = category.dom;
  const count = category.doodles.length;

  // Fill pips up to the current count.
  [...pips.children].forEach((pip, i) => {
    pip.classList.toggle("filled", i < count);
  });

  // Caption / status text.
  const base = `${count} of ${MIN_DOODLES} required doodles added.`;
  if (count >= MIN_DOODLES) {
    caption.textContent = `${base}`;
    caption.classList.add("ready");
  } else {
    const need = MIN_DOODLES - count;
    caption.textContent = `${base} Add ${need} more.`;
    caption.classList.remove("ready");
  }

  addButton.setAttribute("aria-disabled", String(count >= MAX_DOODLES));
  renderThumbnails(category);
  refreshWires(); // the card's height changed, so re-aim its wire
}

function renderThumbnails(category) {
  const { dataContainer } = category.dom;
  dataContainer.innerHTML = "";
  if (category.doodles.length === 0) {
    const empty = document.createElement("p");
    empty.className = "data-empty";
    empty.textContent = "Your doodles appear here.";
    dataContainer.appendChild(empty);
    return;
  }
  category.doodles.forEach((sample, i) => {
    const thumb = document.createElement("button");
    thumb.className = "doodle";
    thumb.type = "button";
    thumb.setAttribute(
      "aria-label",
      `Remove doodle ${i + 1} of ${category.doodles.length} from ${displayName(category)}`,
    );
    thumb.title = "Click to remove";
    const tcanvas = document.createElement("canvas");
    tcanvas.width = tcanvas.height = IMG_SIZE;
    renderSample(sample, tcanvas);
    const remove = document.createElement("span");
    remove.className = "doodle-remove";
    remove.setAttribute("aria-hidden", "true");
    remove.textContent = "×";
    thumb.append(tcanvas, remove);
    thumb.addEventListener("click", () => removeDoodle(category, i));
    dataContainer.appendChild(thumb);
  });
}

/* ================================================================== */
/* Training                                                            */
/* ================================================================== */

const trainButton = document.getElementById("train-button");
const trainStatus = document.getElementById("train-status");
const trainProgress = document.getElementById("train-progress");
const trainProgressFill = document.getElementById("train-progress-fill");
const trainingContainer = document.querySelector(".training-container");

function trainingReady() {
  return (
    state.categories.length >= 2 &&
    state.categories.every((c) => c.doodles.length >= MIN_DOODLES)
  );
}

function updateTrainButton() {
  if (state.isTraining) return;
  const ready = trainingReady();
  trainButton.setAttribute("aria-disabled", String(!ready));
  // Give the central node a dormant look while training isn't possible.
  trainingContainer.classList.toggle("not-ready", !ready);
  updateWireStates();
  if (ready) {
    if (state.modelReady) {
      trainStatus.textContent = "Trained! Draw on the right, or train again.";
    } else if (state.dataChangedSinceTrain) {
      trainStatus.textContent = "Training data changed. Train again to test.";
    } else {
      trainStatus.textContent = "Ready to train.";
    }
  } else {
    const missing = state.categories.filter(
      (c) => c.doodles.length < MIN_DOODLES,
    ).length;
    trainStatus.textContent = `Add at least ${MIN_DOODLES} doodles to ${
      missing === 1 ? "the remaining category" : "each category"
    }.`;
  }
}

async function train() {
  if (!trainingReady() || state.isTraining) return;

  state.isTraining = true;
  // Clear the stale flag now so we can tell if the data is edited mid-training.
  state.dataChangedSinceTrain = false;
  setTrainingFlow(true); // flash the category -> training wires
  trainButton.setAttribute("aria-disabled", "true");
  trainButton.classList.add("is-training");
  trainButton.textContent = "TRAINING";
  trainProgress.hidden = false;
  trainProgress.setAttribute("aria-busy", "true");
  setProgress(0);
  trainStatus.textContent = "Training the model…";

  // Build the training set: every doodle plus a few jittered copies.
  const labels = state.categories.map((c) => String(c.id));
  const examples = [];
  state.categories.forEach((category) => {
    const label = String(category.id);
    category.doodles.forEach((pixels) => {
      examples.push({ label, pixels });
      for (let a = 0; a < AUG_PER_SAMPLE; a++) {
        examples.push({ label, pixels: augment(pixels) });
      }
    });
  });

  let failure = null;
  try {
    if (state.classifier) state.classifier.dispose();
    state.classifier = await createClassifier();
    await state.classifier.train(examples, labels, {
      onProgress: ({ progress }) => setProgress(progress),
    });
    setProgress(1);
    state.modelReady = true;
  } catch (error) {
    console.error(error);
    failure = error;
    state.modelReady = false;
    if (state.classifier) {
      state.classifier.dispose();
      state.classifier = null;
    }
  } finally {
    state.isTraining = false;
    setTrainingFlow(false);
    trainButton.classList.remove("is-training");
    trainButton.textContent = "TRAIN";
    trainProgress.setAttribute("aria-busy", "false");
    setTimeout(() => {
      trainProgress.hidden = true;
    }, 600);
    updateTrainButton();
    // Unlock the prediction interface only once a model is ready (and re-lock
    // it if training failed).
    setPredictionEnabled(state.modelReady);
    if (failure) {
      // updateTrainButton() rewrites the status, so restore the error after it.
      trainStatus.textContent = `Training failed: ${failure.message}`;
      showPrediction(null); // reverts to the "train a model" prompt
    } else if (state.dataChangedSinceTrain) {
      // The data was edited while we trained, so this fresh model is already
      // stale. Drop it and ask the user to train again.
      invalidateModel();
      updateTrainButton();
    } else {
      // isTraining is now false, so a queued prediction can run.
      schedulePredict(true);
    }
  }
}

function setProgress(fraction) {
  const percent = Math.round(fraction * 100);
  trainProgressFill.style.width = `${percent}%`;
  trainProgress.setAttribute("aria-valuenow", String(percent));
}

trainButton.addEventListener("click", train);

/* ================================================================== */
/* Prediction                                                          */
/* ================================================================== */

const predictCanvas = document.getElementById("predict-canvas");
const predictClear = document.getElementById("predict-clear");
const predictionEl = document.getElementById("prediction");
const predictionContainer = predictCanvas.closest(".prediction-container");

let lastPredictAt = 0;
let lastShown; // avoids re-announcing the same prediction to screen readers

const predictSurface = attachDrawing(predictCanvas, {
  enabled: false, // locked until a model is trained
  onStroke: ({ done }) => schedulePredict(done),
});

predictClear.addEventListener("click", () => {
  // aria-disabled keeps the button focusable/announced, so it can still be
  // clicked or activated by keyboard — block the action ourselves.
  if (predictClear.getAttribute("aria-disabled") === "true") return;
  predictSurface.clear();
  showPrediction(null);
});

/* Lock or unlock the right-side drawing interface. Until a model exists there
   is nothing to predict against, so drawing there is disabled outright. */
function setPredictionEnabled(enabled) {
  predictSurface.setEnabled(enabled);
  predictClear.setAttribute("aria-disabled", String(!enabled));
  predictCanvas.setAttribute("aria-disabled", String(!enabled));
  predictionContainer.classList.toggle("is-locked", !enabled);
}

/* Editing the training data makes a previously trained model stale: it was fit
   to doodles that no longer match what's on the left. Drop the model so the
   user must retrain before testing again, and re-lock the right-side canvas. */
function invalidateModel() {
  // Nothing has been trained yet (and nothing is training) → nothing to stale.
  if (!state.modelReady && !state.classifier && !state.isTraining) return;
  state.dataChangedSinceTrain = true;
  // Don't tear down a model that's mid-training; train() re-checks this flag
  // when it finishes and invalidates the fresh-but-already-stale result then.
  if (state.isTraining) return;
  state.modelReady = false;
  state.lastPredictedId = null;
  if (state.classifier) {
    state.classifier.dispose();
    state.classifier = null;
  }
  setPredictionEnabled(false);
  predictSurface.clear(); // whatever was drawn no longer has a valid result
  showPrediction(null);
}

function schedulePredict(force) {
  if (!state.modelReady || state.isTraining) return;
  const now = performance.now();
  if (!force && now - lastPredictAt < PREDICT_THROTTLE_MS) return;
  lastPredictAt = now;
  const sample = predictSurface.snapshot();
  if (!sample) {
    state.lastPredictedId = null;
    showPrediction(null);
    return;
  }
  state.lastPredictedId = state.classifier.predict(sample);
  showPrediction(state.lastPredictedId);
  pulsePredictionFlow(); // flash the training -> prediction wire
}

function showPrediction(labelId) {
  // Build a "key" describing what we'd show; skip the DOM update (and the
  // screen-reader re-announcement) when it hasn't actually changed.
  let key;
  let render;
  if (!state.modelReady) {
    if (state.dataChangedSinceTrain) {
      key = "stale";
      render = () => {
        predictionEl.textContent =
          "Training data changed. Train again to test.";
      };
    } else {
      key = "untrained";
      render = () => {
        predictionEl.textContent =
          "Train a model to start identifying doodles.";
      };
    }
  } else if (labelId === null || labelId === undefined) {
    key = "empty";
    render = () => {
      predictionEl.textContent = "Draw a doodle to identify it.";
    };
  } else {
    const category = state.categories.find(
      (c) => String(c.id) === String(labelId),
    );
    const name = category ? displayName(category) : "Unknown";
    key = `result:${name}`;
    render = () => {
      predictionEl.textContent = "";
      const label = document.createElement("span");
      label.className = "prediction-label";
      label.textContent = "This might be";
      const nameEl = document.createElement("span");
      nameEl.className = "prediction-name";
      nameEl.textContent = name; // textContent: safe with arbitrary names
      predictionEl.append(label, nameEl);
    };
  }
  if (key === lastShown) return;
  lastShown = key;
  render();
}

/* ================================================================== */
/* Background wiring                                                    */
/*                                                                     */
/* Curved "wires" behind the cards: one from each category to training */
/* and one from training to prediction. Endpoints are measured from    */
/* the live DOM so the wires stay attached as the layout changes. They */
/* flash to show data flowing in during training and the model being   */
/* used during prediction.                                             */
/* ================================================================== */

const SVG_NS = "http://www.w3.org/2000/svg";
let wiringSvg = null;
const classWires = []; // one { base, flow } per category
let predWire = null; // training -> prediction
let predictionFlowTimer = null;

function makeWire() {
  const base = document.createElementNS(SVG_NS, "path");
  base.setAttribute("class", "wire");
  const flow = document.createElementNS(SVG_NS, "path");
  flow.setAttribute("class", "wire-flow");
  flow.setAttribute("pathLength", "1"); // lets the dash use 0..1 fractions
  wiringSvg.append(base, flow);
  return { base, flow };
}

function initWiring() {
  const main = document.querySelector("main");
  if (!main) return;
  wiringSvg = document.createElementNS(SVG_NS, "svg");
  wiringSvg.setAttribute("class", "wiring");
  wiringSvg.setAttribute("aria-hidden", "true");
  main.prepend(wiringSvg);

  state.categories.forEach(() => classWires.push(makeWire()));
  predWire = makeWire();

  drawWires();
  updateWireStates();

  // Redraw whenever the layout might have shifted.
  const schedule = () => requestAnimationFrame(drawWires);
  window.addEventListener("resize", schedule);
  window.addEventListener("load", schedule); // re-measure once fonts settle
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(schedule);
    observer.observe(main);
    document
      .querySelectorAll(
        ".class-container, .training-container, .prediction-container",
      )
      .forEach((el) => observer.observe(el));
  }
}

/* A horizontal cubic Bezier from (ax,ay) to (bx,by). */
function wirePath(ax, ay, bx, by) {
  const handle = Math.max(40, Math.abs(bx - ax) * 0.5);
  return `M ${ax} ${ay} C ${ax + handle} ${ay}, ${bx - handle} ${by}, ${bx} ${by}`;
}

function drawWires() {
  if (!wiringSvg) return;
  const training = document.querySelector(".training-container");
  const prediction = document.querySelector(".prediction-container");
  if (!training || !prediction) return;

  const origin = wiringSvg.getBoundingClientRect();
  const rightMid = (el) => {
    const r = el.getBoundingClientRect();
    return [r.right - origin.left, r.top + r.height / 2 - origin.top];
  };
  const leftMid = (el) => {
    const r = el.getBoundingClientRect();
    return [r.left - origin.left, r.top + r.height / 2 - origin.top];
  };

  // Both category wires converge on the training card's left-middle point.
  const [tInX, tInY] = leftMid(training);
  state.categories.forEach((category, i) => {
    const wire = classWires[i];
    if (!wire) return;
    const [ax, ay] = rightMid(category.dom.card);
    const d = wirePath(ax, ay, tInX, tInY);
    wire.base.setAttribute("d", d);
    wire.flow.setAttribute("d", d);
  });

  // Training right-middle -> prediction left-middle.
  const [tOutX, tOutY] = rightMid(training);
  const [pInX, pInY] = leftMid(prediction);
  const dp = wirePath(tOutX, tOutY, pInX, pInY);
  predWire.base.setAttribute("d", dp);
  predWire.flow.setAttribute("d", dp);
}

/* Redraw if the wiring layer exists (e.g. after adding/removing doodles). */
function refreshWires() {
  if (wiringSvg) requestAnimationFrame(drawWires);
}

/* Dim the wires whose source can't carry data yet: a category wire until that
   category has enough doodles, and the prediction wire until a model exists. */
function updateWireStates() {
  state.categories.forEach((category, i) => {
    const wire = classWires[i];
    if (!wire) return;
    const ready = category.doodles.length >= MIN_DOODLES;
    wire.base.classList.toggle("is-dormant", !ready);
  });
  if (predWire) {
    predWire.base.classList.toggle("is-dormant", !state.modelReady);
  }
}

/* Flow the category -> training wires while the model trains. */
function setTrainingFlow(on) {
  classWires.forEach((wire) => wire.flow.classList.toggle("is-flowing", on));
}

/* Flash the training -> prediction wire each time the model is used. */
function pulsePredictionFlow() {
  if (!predWire) return;
  predWire.flow.classList.add("is-flowing");
  clearTimeout(predictionFlowTimer);
  predictionFlowTimer = setTimeout(() => {
    predWire.flow.classList.remove("is-flowing");
  }, 250);
}

/* ================================================================== */
/* Boot                                                                */
/* ================================================================== */

DEFAULT_CATEGORIES.forEach((name) => addCategory(name));
updateTrainButton();
showPrediction(null);
setPredictionEnabled(false); // stays locked until the first successful train
initWiring();
