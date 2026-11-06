/**
 * classifier.js — a tiny, swappable neural-network abstraction.
 *
 * The rest of the app NEVER talks to TensorFlow.js or ConvNetJS directly.
 * It only uses the small "Classifier" contract described below, so the
 * underlying library can be swapped by changing ONE line: CLASSIFIER_BACKEND.
 *
 *   The Classifier contract
 *   -----------------------
 *   await classifier.train(examples, labels, { onProgress })
 *       examples : [{ label, pixels }]
 *                  - label  : a stable key identifying the category
 *                  - pixels : Float32Array of a SQUARE grayscale image,
 *                             values 0..1 where 1 = ink (drawn), 0 = blank
 *       labels   : array of every distinct label, in display order. The index
 *                  of a label in this array is its class index in the network.
 *       onProgress({ progress }) : optional callback, progress is 0..1
 *
 *   classifier.predict(pixels) -> label
 *       Returns ONLY the single most-likely label. By design there is no way
 *       to ask this abstraction for percentages or probabilities.
 *
 *   classifier.dispose()
 *       Frees any resources held by the underlying library.
 *
 * To add a new library: write a class with those three methods and register it
 * in BACKENDS below. Nothing else in the app has to change.
 */

/* Change this one line to swap the neural-network library. */
const CLASSIFIER_BACKEND = "tensorflow"; // "tensorflow" | "convnetjs"

const TRAIN_EPOCHS = 30;

/* ------------------------------------------------------------------ */
/* Small helpers shared by every backend                              */
/* ------------------------------------------------------------------ */

/* Our images are square, so the side length is just sqrt(pixel count). */
function imageSide(pixels) {
  return Math.round(Math.sqrt(pixels.length));
}

/* Load a <script> exactly once; repeat calls share the same promise. */
const scriptPromises = new Map();
function loadScript(src) {
  if (scriptPromises.has(src)) return scriptPromises.get(src);
  const promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () =>
      reject(new Error(`Failed to load ${src}`)),
    );
    document.head.appendChild(script);
  });
  scriptPromises.set(src, promise);
  return promise;
}

/* ------------------------------------------------------------------ */
/* Backend #1 — TensorFlow.js (a small convolutional network)          */
/* ------------------------------------------------------------------ */

class TensorFlowClassifier {
  constructor() {
    this.model = null;
    this.labels = [];
  }

  buildModel(side, numClasses) {
    const model = tf.sequential();
    model.add(
      tf.layers.conv2d({
        inputShape: [side, side, 1],
        filters: 8,
        kernelSize: 3,
        padding: "same",
        activation: "relu",
      }),
    );
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    model.add(
      tf.layers.conv2d({
        filters: 16,
        kernelSize: 3,
        padding: "same",
        activation: "relu",
      }),
    );
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    model.add(tf.layers.flatten());
    model.add(tf.layers.dropout({ rate: 0.25 }));
    model.add(tf.layers.dense({ units: numClasses, activation: "softmax" }));
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: "categoricalCrossentropy",
      metrics: ["accuracy"],
    });
    return model;
  }

  async train(examples, labels, { onProgress } = {}) {
    this.dispose();
    this.labels = labels;

    const side = imageSide(examples[0].pixels);
    const numClasses = labels.length;
    const count = examples.length;

    // Pack every example into one big tensor (xs) and its one-hot label (ys).
    const xBuffer = new Float32Array(count * side * side);
    const yBuffer = new Float32Array(count * numClasses);
    examples.forEach((example, i) => {
      xBuffer.set(example.pixels, i * side * side);
      yBuffer[i * numClasses + labels.indexOf(example.label)] = 1;
    });

    const xs = tf.tensor4d(xBuffer, [count, side, side, 1]);
    const ys = tf.tensor2d(yBuffer, [count, numClasses]);
    this.model = this.buildModel(side, numClasses);

    try {
      await this.model.fit(xs, ys, {
        epochs: TRAIN_EPOCHS,
        batchSize: Math.min(32, Math.max(4, Math.floor(count / 4))),
        shuffle: true,
        callbacks: {
          onEpochEnd: async (epoch) => {
            onProgress?.({ progress: (epoch + 1) / TRAIN_EPOCHS });
            await tf.nextFrame(); // let the UI repaint
          },
        },
      });
    } catch (error) {
      this.dispose(); // don't leak the half-built model's tensors
      throw error;
    } finally {
      xs.dispose();
      ys.dispose();
    }
  }

  predict(pixels) {
    if (!this.model) return null;
    const side = imageSide(pixels);
    const index = tf.tidy(() => {
      const input = tf.tensor4d(pixels, [1, side, side, 1]);
      return this.model.predict(input).argMax(1).dataSync()[0];
    });
    return this.labels[index];
  }

  dispose() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
  }
}

/* ------------------------------------------------------------------ */
/* Backend #2 — ConvNetJS (a tiny convolutional network, pure JS)      */
/* ------------------------------------------------------------------ */

class ConvNetJSClassifier {
  constructor() {
    this.net = null;
    this.labels = [];
  }

  // ConvNetJS works on its own "Vol" type, so wrap a flat pixel array in one.
  toVol(pixels, side) {
    const vol = new convnetjs.Vol(side, side, 1, 0.0);
    for (let i = 0; i < pixels.length; i++) vol.w[i] = pixels[i];
    return vol;
  }

  async train(examples, labels, { onProgress } = {}) {
    this.labels = labels;
    const side = imageSide(examples[0].pixels);

    this.net = new convnetjs.Net();
    this.net.makeLayers([
      { type: "input", out_sx: side, out_sy: side, out_depth: 1 },
      {
        type: "conv",
        sx: 5,
        filters: 8,
        stride: 1,
        pad: 2,
        activation: "relu",
      },
      { type: "pool", sx: 2, stride: 2 },
      {
        type: "conv",
        sx: 5,
        filters: 16,
        stride: 1,
        pad: 2,
        activation: "relu",
      },
      { type: "pool", sx: 2, stride: 2 },
      { type: "softmax", num_classes: labels.length },
    ]);

    const trainer = new convnetjs.SGDTrainer(this.net, {
      method: "adadelta",
      batch_size: Math.min(8, examples.length),
      l2_decay: 0.001,
    });

    // Pre-build the Vols once; reshuffle the order each epoch.
    const samples = examples.map((example) => ({
      vol: this.toVol(example.pixels, side),
      classIndex: labels.indexOf(example.label),
    }));

    for (let epoch = 0; epoch < TRAIN_EPOCHS; epoch++) {
      for (let i = samples.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [samples[i], samples[j]] = [samples[j], samples[i]];
      }
      for (const sample of samples) {
        trainer.train(sample.vol, sample.classIndex);
      }
      onProgress?.({ progress: (epoch + 1) / TRAIN_EPOCHS });
      await new Promise((resolve) => setTimeout(resolve, 0)); // yield to UI
    }
  }

  predict(pixels) {
    if (!this.net) return null;
    const side = imageSide(pixels);
    this.net.forward(this.toVol(pixels, side));
    return this.labels[this.net.getPrediction()];
  }

  dispose() {
    this.net = null;
  }
}

/* ------------------------------------------------------------------ */
/* The registry + factory — this is what the app actually calls        */
/* ------------------------------------------------------------------ */

const BACKENDS = {
  tensorflow: {
    // Bundled locally so the default setup works offline on a Chromebook.
    lib: "tf.js",
    isReady: () => typeof tf !== "undefined",
    init: async () => {
      // Prefer the GPU; fall back to CPU on low-powered machines.
      // setBackend resolves to false (it does not throw) when a backend
      // is unavailable, so check the result rather than catching.
      let ok = false;
      try {
        ok = await tf.setBackend("webgl");
      } catch (e) {
        ok = false;
      }
      if (!ok) {
        try {
          await tf.setBackend("cpu");
        } catch (_) {
          /* fall through to whatever default is available */
        }
      }
      await tf.ready();
    },
    create: () => new TensorFlowClassifier(),
  },
  convnetjs: {
    // Bundled locally too, so switching backends stays offline-friendly.
    lib: "convnet.js",
    isReady: () => typeof convnetjs !== "undefined",
    init: async () => {},
    create: () => new ConvNetJSClassifier(),
  },
};

/**
 * Build a ready-to-use classifier for the chosen backend, loading the
 * underlying library the first time it is needed.
 */
async function createClassifier(backend = CLASSIFIER_BACKEND) {
  const config = BACKENDS[backend];
  if (!config) {
    throw new Error(
      `Unknown backend "${backend}". Available: ${Object.keys(BACKENDS).join(", ")}.`,
    );
  }
  if (!config.isReady()) await loadScript(config.lib);
  if (!config.isReady()) {
    throw new Error(
      `The "${backend}" library could not be loaded from ${config.lib}.`,
    );
  }
  await config.init();
  return config.create();
}

window.createClassifier = createClassifier;
