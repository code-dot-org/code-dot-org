import * as tf from '@tensorflow/tfjs';
import * as mobilenetModule from '@tensorflow-models/mobilenet';

import {fishData, FishBodyPart, type FieldInfo} from '../utils/fishData';
import {trashImagePaths, seaCreatureImagePaths} from '../utils/imagePaths';

import constants from './constants';
import {
  bodyAnchorFromType,
  colorForFishPart,
  generateColorPalette,
} from './helpers';

// Both model files are emitted to `assets/models/` by the
// emitModelAssets plugin (see vite.config.ts), and each is referenced
// here via `new URL(relative, import.meta.url)` so the consuming
// bundler (studio, any host embedding the lab) re-emits both through
// its own asset pipeline. The .bin reference here — not just from
// inside model.json — is what makes the bundler track the weight
// shard; without it the consumer would only emit the JSON and the
// shard would 404 at runtime.
const modelJsonUrl = new URL('./assets/models/model.json', import.meta.url)
  .href;
const weightShardUrl = new URL(
  './assets/models/group1-shard1of1.bin',
  import.meta.url,
).href;

/** Index of loaded fish part images, keyed by part type then variation index. */
const fishPartImages: Record<number, Record<number, HTMLImageElement>> = {};

/** Loaded trash images, ordered by index from trashImagePaths. */
const trashImages: HTMLImageElement[] = [];

/** Loaded sea-creature images, ordered by index from seaCreatureImagePaths. */
const seaCreatureImages: HTMLImageElement[] = [];

// Used to tint the fish components
let intermediateCanvas: HTMLCanvasElement;
// Used to draw the object in order to evaluate it when using mobilenet
let evaluationCanvas: HTMLCanvasElement;
let intermediateCtx: CanvasRenderingContext2D | null;
let mobilenet: mobilenetModule.MobileNet | undefined;

/** Metadata attached to each image loaded via loadImage. */
interface ImageLoadData {
  src: string;
  idx?: number;
  partIndex?: number;
  variationIndex?: number;
}

/** Result of a loadImage call — the loaded element plus the original data. */
interface ImageLoadResult {
  img: HTMLImageElement;
  data: ImageLoadData;
}

// Load a single image.
const loadImage = (data: ImageLoadData): Promise<ImageLoadResult> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve({img, data}));
    img.addEventListener('error', () => {
      reject(new Error(`failed to load image at ${data.src}`));
    });
    img.src = data.src;
  });
};

/** Load all fish part images and store them in the fishPartImages registry. */
export const loadAllFishPartImages = (): Promise<void> => {
  intermediateCanvas = document.createElement('canvas');
  intermediateCtx = intermediateCanvas.getContext('2d');
  intermediateCanvas.width = constants.fishCanvasWidth;
  intermediateCanvas.height = constants.fishCanvasHeight;
  evaluationCanvas = document.createElement('canvas');

  const fishPartImagesToLoad: ImageLoadData[] = [];
  Object.keys(fishData)
    .filter(partName => partName !== 'colors')
    .forEach(partName => {
      const part = fishData[partName as keyof typeof fishData] as Record<
        string,
        {type: number; index: number; src: string}
      >;
      Object.keys(part).forEach(variationName => {
        const partData: ImageLoadData = {
          partIndex: part[variationName].type,
          variationIndex: part[variationName].index,
          src: part[variationName].src,
        };
        fishPartImagesToLoad.push(partData);
      });
    });
  return Promise.all(fishPartImagesToLoad.map(loadImage)).then(results => {
    results.forEach(result => {
      if (fishPartImages[result.data.partIndex!] === undefined) {
        fishPartImages[result.data.partIndex!] = {};
      }
      fishPartImages[result.data.partIndex!][result.data.variationIndex!] =
        result.img;
    });
  });
};

/** Initialize the mobilenet model used for logit generation. */
export const initMobilenet = (): Promise<void> => {
  // TFJS resolves the weight shard as a sibling of model.json (from
  // `paths[]` inside the JSON). The bundler hashes both files
  // independently, so the sibling URL produces a 404. Override the
  // fetch function and route requests for `group1-shard1of1.bin` to
  // the bundler-emitted hashed URL. `fetchFunc` is the TFJS 1.x
  // mechanism on `LoadOptions`; later versions renamed it to
  // `customFetch` / added `weightUrlConverter`.
  const modelIO = tf.io.http(modelJsonUrl, {
    fetchFunc: (input: RequestInfo, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.endsWith('group1-shard1of1.bin')) {
        return fetch(weightShardUrl, init);
      }
      return fetch(input, init);
    },
  });
  return mobilenetModule.load({version: 1, modelUrl: modelIO}).then(res => {
    mobilenet = res;
  });
};

/** Load all trash asset images and store them in the trashImages registry. */
export const loadAllTrashImages = (): Promise<void> => {
  const loadImagePromises = trashImagePaths.map((src, idx) => {
    return loadImage({src, idx});
  });
  return Promise.all(loadImagePromises).then(results => {
    results.forEach(result => {
      trashImages[result.data.idx!] = result.img;
    });
  });
};

/** Load all sea-creature asset images and store them in the seaCreatureImages registry. */
export const loadAllSeaCreatureImages = (): Promise<void> => {
  const loadImagePromises = seaCreatureImagePaths.map((src, idx) => {
    return loadImage({src, idx});
  });
  return Promise.all(loadImagePromises).then(results => {
    results.forEach(result => {
      seaCreatureImages[result.data.idx!] = result.img;
    });
  });
};

/**
 * Generate a single OceanObject chosen at random from the provided allowed classes.
 *
 * @param allowedClasses - Constructor types to pick from.
 * @param id - Unique numeric ID for the new object.
 * @param possibleFishComponents - Fish component options (used only for FishOceanObject).
 * @returns A newly randomized OceanObject instance.
 */
export const generateRandomOceanObject = (
  allowedClasses: Array<new (...args: unknown[]) => OceanObject>,
  id: number,
  possibleFishComponents: unknown = null,
): OceanObject => {
  const idx = Math.floor(Math.random() * allowedClasses.length);
  const OceanObjectType = allowedClasses[idx];
  let newOceanObject: OceanObject;
  if (
    OceanObjectType ===
    (FishOceanObject as unknown as new (...args: unknown[]) => OceanObject)
  ) {
    newOceanObject = new OceanObjectType(id, possibleFishComponents);
  } else {
    newOceanObject = new OceanObjectType(id);
  }

  newOceanObject.randomize();
  return newOceanObject;
};

/** Base class for all objects that appear in the ocean scene. */
export class OceanObject {
  /** Unique identifier for this object. */
  id: number | string;

  /** Flattened numeric feature vector used by KNN classifier. */
  knnData: number[] | null;

  /**
   * Per-dimension metadata aligned with `knnData`.  Only populated by
   * subclasses that participate in word-attribute SVM training
   * (FishOceanObject); empty for trash and creature instances.
   */
  fieldInfos: FieldInfo[] = [];

  /** Cached mobilenet inference tensor. */
  logits: unknown | null;

  /** Classifier result attached after prediction. */
  result: unknown | null;

  /** Current screen position of the object. */
  xy?: {x: number; y: number};

  constructor(id: number | string) {
    this.id = id;
    this.knnData = null;
    this.logits = null;
    this.result = null;
  }

  /** Randomize this object's visual properties. Must be overridden in subclasses. */
  randomize(): void {
    throw 'Not yet implemented!';
  }

  /**
   * Draw the object to the given canvas and optionally generate mobilenet logits.
   *
   * @param canvas - Target canvas element.
   * @param generateLogits - When true, queue async logit generation after drawing.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  drawToCanvas(_canvas: HTMLCanvasElement, _generateLogits = true): void {
    throw 'Not yet implemented!';
  }

  /** @returns The unique ID of this object. */
  getId(): number | string {
    return this.id;
  }

  /** @returns The KNN feature vector, or null if not yet computed. */
  getKnnData(): number[] | null {
    return this.knnData;
  }

  /**
   * Returns the tensor representation of this object.
   * Uses mobilenet logits when available; falls back to knnData tensor.
   *
   * @returns A TensorFlow tensor or the cached mobilenet logits.
   */
  getTensor(): unknown {
    if (mobilenet) {
      if (!this.logits) {
        const evaluationCtx = evaluationCanvas.getContext('2d');
        evaluationCtx!.clearRect(
          0,
          0,
          evaluationCanvas.width,
          evaluationCanvas.height,
        );
        this.drawToCanvas(evaluationCanvas, false);
        this.generateLogits(evaluationCanvas);
      }
      return this.logits;
    } else {
      return tf.tensor(this.knnData!);
    }
  }

  /**
   * Attach a classifier result to this object.
   *
   * @param result - Prediction result from the trainer.
   */
  setResult(result: unknown): void {
    this.result = result;
  }

  /** @returns The attached classifier result, or null. */
  getResult(): unknown {
    return this.result;
  }

  /**
   * Store the screen position of this object.
   *
   * @param xy - Object with x and y canvas coordinates.
   */
  setXY(xy: {x: number; y: number}): void {
    this.xy = xy;
  }

  /** @returns The current screen position, or undefined if not set. */
  getXY(): {x: number; y: number} | undefined {
    return this.xy;
  }

  /**
   * Async wrapper around generateLogits — queues logit computation without
   * blocking the caller.
   *
   * @param canvas - Canvas whose pixel content drives the inference.
   */
  async generateLogitsAsync(canvas: HTMLCanvasElement): Promise<void> {
    this.generateLogits(canvas);
  }

  /**
   * If mobilenet is loaded and logits have not been computed, run inference on
   * the given canvas and cache the result.
   *
   * @param canvas - Source canvas for mobilenet inference.
   */
  generateLogits(canvas: HTMLCanvasElement): void {
    if (mobilenet && !this.logits) {
      const image = tf.browser.fromPixels(canvas);
      // Pass true to get the embedding (conv_preds layer equivalent).
      const infer = () => mobilenet!.infer(image, true);
      this.logits = infer();
    }
  }
}

/**
 * Fish object composed from randomly selected parts in FishData.
 */
export class FishOceanObject extends OceanObject {
  /** Available component options for this fish. */
  componentOptions: typeof fishData;

  /** Selected body part. */
  body: unknown;

  /** Selected eye part. */
  eye: unknown;

  /** Selected mouth part. */
  mouth: unknown;

  /** Selected front pectoral fin part. */
  pectoralFinFront: unknown;

  /** Selected back pectoral fin part. */
  pectoralFinBack: unknown;

  /** Selected dorsal fin part. */
  dorsalFin: unknown;

  /** Selected tail part. */
  tail: unknown;

  /** Selected scales part. */
  scales: unknown;

  /** Selected color palette. */
  colorPalette: unknown;

  /** When true the fish swims to the left; default is right. */
  faceLeft?: boolean;

  /** Per-frame start time for words-mode fish animation. */
  startTime?: number;

  /** Per-frame speed for words-mode fish animation (ms to cross the screen). */
  speed?: number;

  constructor(
    id: number | string,
    componentOptions: typeof fishData = fishData,
  ) {
    super(id);
    this.componentOptions = componentOptions;
    this.fieldInfos = [];
  }

  /** Randomize all fish component selections and compute the knnData vector. */
  randomize(): void {
    if (!this.body) {
      const bodies = Object.values(this.componentOptions.bodies);
      this.body = bodies[Math.floor(Math.random() * bodies.length)];
    }
    if (!this.eye) {
      const eyes = Object.values(this.componentOptions.eyes);
      this.eye = eyes[Math.floor(Math.random() * eyes.length)];
    }
    if (!this.mouth) {
      const mouths = Object.values(this.componentOptions.mouths);
      this.mouth = mouths[Math.floor(Math.random() * mouths.length)];
    }
    if (!this.pectoralFinFront) {
      const pectoralFinsFront = Object.values(
        this.componentOptions.pectoralFinsFront,
      );
      const pectoralFinsBack = Object.values(
        this.componentOptions.pectoralFinsBack,
      );

      const finIdx = Math.floor(Math.random() * pectoralFinsFront.length);
      this.pectoralFinFront = pectoralFinsFront[finIdx];
      this.pectoralFinBack = pectoralFinsBack[finIdx];
    }
    if (!this.dorsalFin) {
      const dorsalFins = Object.values(this.componentOptions.dorsalFins);
      this.dorsalFin =
        dorsalFins[Math.floor(Math.random() * dorsalFins.length)];
    }
    if (!this.tail) {
      const tails = Object.values(this.componentOptions.tails);
      this.tail = tails[Math.floor(Math.random() * tails.length)];
    }
    if (!this.scales) {
      const scales = Object.values(this.componentOptions.scales);
      this.scales = scales[Math.floor(Math.random() * scales.length)];
    }
    if (!this.colorPalette) {
      const colors = Object.values(this.componentOptions.colors) as Array<{
        rgb: number[];
        knnData: number[];
        fieldInfos: FieldInfo[];
      }>;
      this.colorPalette = generateColorPalette(colors);
    }

    type PartWithData = {knnData: number[]; fieldInfos: FieldInfo[]};
    const b = this.body as PartWithData;
    const e = this.eye as PartWithData;
    const m = this.mouth as PartWithData;
    const d = this.dorsalFin as PartWithData;
    const t = this.tail as PartWithData;
    const c = this.colorPalette as PartWithData;

    this.knnData = [
      ...b.knnData,
      ...e.knnData,
      ...m.knnData,
      ...d.knnData,
      ...t.knnData,
      ...c.knnData,
    ];
    this.fieldInfos = [
      ...b.fieldInfos,
      ...e.fieldInfos,
      ...m.fieldInfos,
      ...d.fieldInfos,
      ...t.fieldInfos,
      ...c.fieldInfos,
    ];
  }

  /** @returns The selected color palette for this fish. */
  getColorPalette(): unknown {
    return this.colorPalette;
  }

  /**
   * Draw the eye and mouth onto the fish canvas at the face anchor point.
   *
   * @param bodyAnchor - [x, y] origin of the body bounding box.
   * @param ctx - Canvas 2D rendering context to draw into.
   */
  drawFishFace(bodyAnchor: number[], ctx: CanvasRenderingContext2D): void {
    type PartWithAnchor = {faceAnchor: number[]};
    type IndexedPart = {type: number; index: number};
    const anchor = (this.body as PartWithAnchor).faceAnchor;

    const eyePart = this.eye as IndexedPart;
    const mouthPart = this.mouth as IndexedPart;
    const eyeImg = fishPartImages[eyePart.type][eyePart.index];
    const mouthImg = fishPartImages[mouthPart.type][mouthPart.index];

    const maxComponentWidth = Math.max(eyeImg.width, mouthImg.width);
    const distBetweenEyeAndMouth = 5;

    ctx.drawImage(
      eyeImg,
      bodyAnchor[0] + anchor[0] + (maxComponentWidth - eyeImg.width) / 2,
      bodyAnchor[1] + anchor[1],
    );
    ctx.drawImage(
      mouthImg,
      bodyAnchor[0] + anchor[0] + (maxComponentWidth - mouthImg.width) / 2,
      bodyAnchor[1] + anchor[1] + eyeImg.height + distBetweenEyeAndMouth,
    );
  }

  /**
   * Draw and color-tint a single fish component onto the intermediate canvas
   * then composite the result into the target context.
   *
   * @param part - The fish body part data including type, index, and anchoring info.
   * @param bodyAnchor - [x, y] origin of the body bounding box.
   * @param ctx - Canvas 2D rendering context to draw into.
   */
  drawFishComponent(
    part: unknown,
    bodyAnchor: number[],
    ctx: CanvasRenderingContext2D,
  ): void {
    type Part = {type: number; index: number; x_adjustment?: number};
    const p = part as Part;

    intermediateCtx!.clearRect(
      0,
      0,
      constants.fishCanvasWidth,
      constants.fishCanvasHeight,
    );

    const anchor = [0, 0];
    if (p.type !== FishBodyPart.BODY) {
      const bodyAnch = bodyAnchorFromType(
        this.body as Parameters<typeof bodyAnchorFromType>[0],
        p.type,
      );
      anchor[0] = bodyAnch[0];
      anchor[1] = bodyAnch[1];
    }

    const img = fishPartImages[p.type][p.index];

    if (p.type === FishBodyPart.TAIL) {
      anchor[1] -= img.height / 2;
    }

    if (p.type === FishBodyPart.DORSAL_FIN) {
      anchor[1] -= img.height;
      if (p.x_adjustment) {
        anchor[0] += p.x_adjustment;
      }
    }

    const xPos = bodyAnchor[0] + anchor[0];
    const yPos = bodyAnchor[1] + anchor[1];
    if (p.type === FishBodyPart.PECTORAL_FIN_BACK) {
      intermediateCtx!.translate(xPos + img.width, yPos);
      intermediateCtx!.scale(-1, 1);
      intermediateCtx!.drawImage(img, 0, 0);
      intermediateCtx!.setTransform(1, 0, 0, 1, 0, 0);
    } else if (p.type === FishBodyPart.SCALES) {
      intermediateCtx!.globalAlpha = 0.2;
      intermediateCtx!.drawImage(img, xPos, yPos);
      intermediateCtx!.globalAlpha = 1;
    } else {
      intermediateCtx!.drawImage(img, xPos, yPos);
    }

    let rgb = colorForFishPart(
      this.colorPalette as Parameters<typeof colorForFishPart>[0],
      part as Parameters<typeof colorForFishPart>[1],
    );

    if (rgb) {
      // Darken back pectoral fin by 15.
      if (p.type === FishBodyPart.PECTORAL_FIN_BACK) {
        rgb = rgb.map(c => (c -= 15));
      }

      const imageData = intermediateCtx!.getImageData(
        xPos,
        yPos,
        img.width,
        img.height,
      );
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Tint any visible pixels
        if (data[i + 3] > 0) {
          data[i] = rgb[0];
          data[i + 1] = rgb[1];
          data[i + 2] = rgb[2];
        }
      }

      intermediateCtx!.putImageData(imageData, xPos, yPos);
    }
    ctx.drawImage(
      intermediateCanvas,
      constants.fishCanvasWidth / 2 - intermediateCanvas.width / 2,
      constants.fishCanvasHeight / 2 - intermediateCanvas.height / 2,
      constants.fishCanvasWidth,
      constants.fishCanvasHeight,
    );
  }

  /**
   * Render the complete fish onto the given canvas.
   *
   * @param fishCanvas - Canvas element to draw onto.
   * @param generateLogits - When true, kick off async mobilenet inference.
   */
  drawToCanvas(fishCanvas: HTMLCanvasElement, generateLogits = true): void {
    const ctx = fishCanvas.getContext('2d')!;
    if (!this.faceLeft) {
      ctx.translate(constants.fishCanvasWidth, 0);
      ctx.scale(-1, 1);
    }
    const bodyAnchor = bodyAnchorFromType(
      this.body as Parameters<typeof bodyAnchorFromType>[0],
      (this.body as {type: number}).type,
    );

    this.drawFishComponent(this.dorsalFin, bodyAnchor, ctx);
    this.drawFishComponent(this.tail, bodyAnchor, ctx);
    this.drawFishComponent(this.pectoralFinBack, bodyAnchor, ctx);
    this.drawFishComponent(this.body, bodyAnchor, ctx);
    this.drawFishComponent(this.scales, bodyAnchor, ctx);
    this.drawFishComponent(this.pectoralFinFront, bodyAnchor, ctx);
    this.drawFishFace(bodyAnchor, ctx);
    if (generateLogits) {
      this.generateLogitsAsync(fishCanvas);
    }
  }
}

/**
 * Trash object rendered using a randomly selected image from trashImages.
 */
export class TrashOceanObject extends OceanObject {
  /** Currently selected trash image. */
  image!: HTMLImageElement;

  /** Pick a random trash image for this object. */
  randomize(): void {
    const idx = Math.floor(Math.random() * trashImages.length);
    this.image = trashImages[idx];
  }

  /**
   * Draw the trash image (rotated randomly) onto the canvas.
   *
   * @param canvas - Target canvas element.
   * @param generateLogits - When true, kick off async mobilenet inference.
   */
  drawToCanvas(canvas: HTMLCanvasElement, generateLogits = true): void {
    const ctx = canvas.getContext('2d')!;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.random() * 2 * Math.PI);
    const xpos = (-1 * this.image.width) / 2;
    const ypos = (-1 * this.image.height) / 2;
    ctx.drawImage(this.image, xpos, ypos);
    ctx.restore();
    if (generateLogits) {
      this.generateLogitsAsync(canvas);
    }
  }
}

/**
 * Sea-creature object rendered using a randomly selected image from seaCreatureImages.
 */
export class SeaCreatureOceanObject extends OceanObject {
  /** Currently selected sea-creature image. */
  image!: HTMLImageElement;

  /** Pick a random sea-creature image for this object. */
  randomize(): void {
    const idx = Math.floor(Math.random() * seaCreatureImages.length);
    this.image = seaCreatureImages[idx];
  }

  /**
   * Draw the sea-creature image centred on the canvas.
   *
   * @param canvas - Target canvas element.
   * @param generateLogits - When true, kick off async mobilenet inference.
   */
  drawToCanvas(canvas: HTMLCanvasElement, generateLogits = true): void {
    const ctx = canvas.getContext('2d')!;
    const xpos = canvas.width / 2 - this.image.width / 2;
    const ypos = canvas.height / 2 - this.image.height / 2;
    ctx.drawImage(this.image, xpos, ypos);
    if (generateLogits) {
      this.generateLogitsAsync(canvas);
    }
  }
}
