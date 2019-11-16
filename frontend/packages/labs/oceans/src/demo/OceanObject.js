import * as mobilenetModule from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import {fishData, FishBodyPart} from '../utils/fishData';
import constants from './constants';
import {
  bodyAnchorFromType,
  colorForFishPart,
  generateColorPalette
} from './helpers';
import {trashImagePaths, seaCreatureImagePaths} from '../utils/imagePaths';

let fishPartImages = {};
let trashImages = [];
let seaCreatureImages = [];
// Used to tint the fish components
let intermediateCanvas;
// Used to draw the object in order to evaluate it when using mobilenet
let evaluationCanvas;
let intermediateCtx;
let mobilenet;

// Load a single image.
const loadImage = data => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', e => resolve({img, data}));
    img.addEventListener('error', () => {
      reject(new Error(`failed to load image at ${data.src}`));
    });
    img.src = data.src;
  });
};

// Load all fish part images, and store them in fishPartImages.
export const loadAllFishPartImages = () => {
  intermediateCanvas = document.createElement('canvas');
  intermediateCtx = intermediateCanvas.getContext('2d');
  intermediateCanvas.width = constants.fishCanvasWidth;
  intermediateCanvas.height = constants.fishCanvasHeight;
  evaluationCanvas = document.createElement('canvas');

  let fishPartImagesToLoad = [];
  Object.keys(fishData)
    .filter(partName => partName !== 'colors')
    .forEach((partName, partIndex) => {
      Object.keys(fishData[partName]).forEach(variationName => {
        const partData = {
          partIndex: fishData[partName][variationName].type,
          variationIndex: fishData[partName][variationName].index,
          src: fishData[partName][variationName].src
        };
        fishPartImagesToLoad.push(partData);
      });
    });
  return Promise.all(fishPartImagesToLoad.map(loadImage)).then(results => {
    results.forEach(result => {
      if (fishPartImages[result.data.partIndex] === undefined) {
        fishPartImages[result.data.partIndex] = {};
      }
      fishPartImages[result.data.partIndex][result.data.variationIndex] =
        result.img;
    });
  });
};

export const initMobilenet = () => {
  return mobilenetModule.load(1, 0.25).then(res => (mobilenet = res));
};

// Load all of the trash assets and store them
export const loadAllTrashImages = () => {
  const loadImagePromises = trashImagePaths.map((src, idx) => {
    return loadImage({src, idx});
  });
  return Promise.all(loadImagePromises).then(results => {
    results.forEach(result => {
      trashImages[result.data.idx] = result.img;
    });
  });
};

// Load all of the sea creature assets and store them
export const loadAllSeaCreatureImages = () => {
  const loadImagePromises = seaCreatureImagePaths.map((src, idx) => {
    return loadImage({src, idx});
  });
  return Promise.all(loadImagePromises).then(results => {
    results.forEach(result => {
      seaCreatureImages[result.data.idx] = result.img;
    });
  });
};

// Generate a single object with an even chance of being
// any of the allowed classes
export const generateRandomOceanObject = (
  allowedClasses,
  id,
  possibleFishComponents = null
) => {
  const idx = Math.floor(Math.random() * allowedClasses.length);
  const OceanObjectType = allowedClasses[idx];
  let newOceanObject;
  if (OceanObjectType === FishOceanObject) {
    newOceanObject = new OceanObjectType(id, possibleFishComponents);
  } else {
    newOceanObject = new OceanObjectType(id);
  }

  newOceanObject.randomize();
  return newOceanObject;
};

export class OceanObject {
  constructor(id) {
    this.id = id;
    this.knnData = null;
    this.logits = null;
    this.result = null;
  }

  randomize() {
    throw 'Not yet implemented!';
  }

  // Draws the object to the given canvas and
  // generates the mobilenet data (logits) if generateLogits is true
  drawToCanvas(canvas, generateLogits = true) {
    throw 'Not yet implemented!';
  }
  getId() {
    return this.id;
  }
  getKnnData() {
    return this.knnData;
  }
  getTensor() {
    if (mobilenet) {
      if (!this.logits) {
        const evaluationCtx = evaluationCanvas.getContext('2d');
        evaluationCtx.clearRect(
          0,
          0,
          evaluationCanvas.width,
          evaluationCanvas.height
        );
        this.drawToCanvas(evaluationCanvas, false);
        this.generateLogits(evaluationCanvas);
      }
      return this.logits;
    } else {
      return tf.tensor(this.knnData);
    }
  }
  setResult(result) {
    this.result = result;
  }
  getResult() {
    return this.result;
  }
  setXY(xy) {
    this.xy = xy;
  }
  getXY() {
    return this.xy;
  }

  async generateLogitsAsync(canvas) {
    this.generateLogits(canvas);
  }

  // If using mobilenet, generate a tensor that represents the canvas
  generateLogits(canvas) {
    if (mobilenet && !this.logits) {
      const image = tf.fromPixels(canvas);
      const infer = () => mobilenet.infer(image, 'conv_preds');
      this.logits = infer();
    }
  }
}

/*
 * Fish object that is generated from FishData
 *
 * */
export class FishOceanObject extends OceanObject {
  constructor(id, componentOptions = fishData) {
    super(id);
    this.componentOptions = componentOptions;
  }

  randomize() {
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
        this.componentOptions.pectoralFinsFront
      );
      const pectoralFinsBack = Object.values(
        this.componentOptions.pectoralFinsBack
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
      const colors = Object.values(this.componentOptions.colors);
      this.colorPalette = generateColorPalette(colors);
    }
    this.knnData = [
      ...this.body.knnData,
      ...this.eye.knnData,
      ...this.mouth.knnData,
      ...this.pectoralFinFront.knnData,
      ...this.dorsalFin.knnData,
      ...this.tail.knnData,
      ...this.scales.knnData,
      ...this.colorPalette.knnData
    ];
  }

  getColorPalette() {
    return this.colorPalette;
  }

  drawFishComponent(part, bodyAnchor, ctx) {
    intermediateCtx.clearRect(
      0,
      0,
      constants.fishCanvasWidth,
      constants.fishCanvasHeight
    );

    let anchor = [0, 0];
    if (part.type !== FishBodyPart.BODY) {
      const bodyAnchor = bodyAnchorFromType(this.body, part.type);
      anchor[0] = bodyAnchor[0];
      anchor[1] = bodyAnchor[1];
    }

    const img = fishPartImages[part.type][part.index];

    if (part.type === FishBodyPart.TAIL) {
      anchor[1] -= img.height / 2;
    }

    if (part.type === FishBodyPart.DORSAL_FIN) {
      anchor[1] -= img.height;
      if (part.x_adjustment) {
        anchor[0] += part.x_adjustment;
      }
    }

    const xPos = bodyAnchor[0] + anchor[0];
    const yPos = bodyAnchor[1] + anchor[1];
    if (part.type === FishBodyPart.PECTORAL_FIN_BACK) {
      intermediateCtx.translate(xPos + img.width, yPos);
      intermediateCtx.scale(-1, 1);
      intermediateCtx.drawImage(img, 0, 0);
      intermediateCtx.setTransform(1, 0, 0, 1, 0, 0);
    } else if (part.type === FishBodyPart.SCALES) {
      intermediateCtx.globalAlpha = 0.2; 
      intermediateCtx.drawImage(img, xPos, yPos);
      intermediateCtx.globalAlpha = 1; 
    }else {
      intermediateCtx.drawImage(img, xPos, yPos);
    }

    let rgb = colorForFishPart(this.colorPalette, part);

    if (rgb) {
      // Darken back pectoral fin by 15.
      if (part.type === FishBodyPart.PECTORAL_FIN_BACK) {
        rgb = rgb.map(c => (c -= 15));
      }

      let imageData = intermediateCtx.getImageData(
        xPos,
        yPos,
        img.width,
        img.height
      );
      let data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Tint any visible pixels
        if (data[i + 3] > 0) {
          data[i] = rgb[0];
          data[i + 1] = rgb[1];
          data[i + 2] = rgb[2];
        }
      }

      intermediateCtx.putImageData(imageData, xPos, yPos);
    }
    ctx.drawImage(
      intermediateCanvas,
      constants.fishCanvasWidth / 2 - intermediateCanvas.width / 2,
      constants.fishCanvasHeight / 2 - intermediateCanvas.height / 2,
      constants.fishCanvasWidth,
      constants.fishCanvasHeight
    );
  }

  drawToCanvas(fishCanvas, generateLogits = true) {
    const ctx = fishCanvas.getContext('2d');
    ctx.translate(constants.fishCanvasWidth, 0);
    ctx.scale(-1, 1);
    const bodyAnchor = bodyAnchorFromType(this.body, this.body.type);

    this.drawFishComponent(this.dorsalFin, bodyAnchor, ctx);
    this.drawFishComponent(this.tail, bodyAnchor, ctx);
    this.drawFishComponent(this.pectoralFinBack, bodyAnchor, ctx);
    this.drawFishComponent(this.body, bodyAnchor, ctx);
    this.drawFishComponent(this.scales, bodyAnchor, ctx);
    this.drawFishComponent(this.pectoralFinFront, bodyAnchor, ctx);
    this.drawFishComponent(this.mouth, bodyAnchor, ctx);
    this.drawFishComponent(this.eye, bodyAnchor, ctx);
    if (generateLogits) {
      this.generateLogitsAsync(fishCanvas);
    }
  }
}

/*
 * Trash object that uses one of the images from TrashImages
 *
 * */
export class TrashOceanObject extends OceanObject {
  randomize() {
    const idx = Math.floor(Math.random() * trashImages.length);
    this.image = trashImages[idx];
  }

  drawToCanvas(canvas, generateLogits = true) {
    const ctx = canvas.getContext('2d');
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

/*
 * Sea creatures that use one of the images from SeaCreatureImages
 *
 * */
export class SeaCreatureOceanObject extends OceanObject {
  randomize() {
    const idx = Math.floor(Math.random() * seaCreatureImages.length);
    this.image = seaCreatureImages[idx];
  }

  drawToCanvas(canvas, generateLogits = true) {
    const ctx = canvas.getContext('2d');
    const xpos = canvas.width / 2 - this.image.width / 2;
    const ypos = canvas.height / 2 - this.image.height / 2;
    ctx.drawImage(this.image, xpos, ypos);
    if (generateLogits) {
      this.generateLogitsAsync(canvas);
    }
  }
}
