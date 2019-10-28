import 'babel-polyfill';
import _ from 'lodash';
import {getState, setState} from './state';
import constants, {Modes, ClassType} from './constants';
import CanvasCache from './canvasCache';
import {
  backgroundPathForMode,
  bodyAnchorFromType,
  colorForFishPart,
  randomInt,
  clamp
} from './helpers';
import {fishData, FishBodyPart} from '../utils/fishData';
import {predictFish} from './models/predict';

var $time =
  Date.now ||
  function() {
    return +new Date();
  };

let prevState = {};
let currentModeStartTime = $time();
let fishPartImages = {};
let canvasCache;
let intermediateCanvas;
let intermediateCtx;
let lastPauseTime = 0;
let lastStartTime;
let defaultMoveTime = 1000;
let moveTime;

export const initRenderer = () => {
  canvasCache = new CanvasCache();
  intermediateCanvas = document.createElement('canvas');
  intermediateCtx = intermediateCanvas.getContext('2d');
  intermediateCanvas.width = constants.fishCanvasWidth;
  intermediateCanvas.height = constants.fishCanvasHeight;

  return loadAllFishPartImages();
};

// Render a single frame of the scene.
// Sometimes performs special rendering actions, such as when mode has changed.
export const render = () => {
  const state = getState();

  if (state.currentMode !== prevState.currentMode) {
    drawBackground(state);
    currentModeStartTime = $time();
    lastPauseTime = 0;
    lastStartTime = null;

    if (state.currentMode === Modes.Training) {
      moveTime = defaultMoveTime / 2;
    } else {
      moveTime = defaultMoveTime;
    }
  }

  clearCanvas(state.canvas);

  const timeBeforeCanSkipPredict = 5000;

  switch (state.currentMode) {
    case Modes.Training:
      drawFrame(state);
      drawMovingFish(state);
      break;
    case Modes.Predicting:
      setState({canSkipPredict: $time() >= currentModeStartTime + timeBeforeCanSkipPredict});
      drawMovingFish(state);
      break;
    case Modes.Pond:
      drawPondFishImages();
      break;
  }

  drawOverlays();

  prevState = {...state};
  window.requestAnimFrame(render);
};

// Load and display the background image onto the background canvas.
export const drawBackground = state => {
  const canvas = state.backgroundCanvas;
  if (!canvas) {
    return;
  }

  const imgPath = backgroundPathForMode(state.currentMode);
  if (imgPath) {
    loadImage(imgPath).then(img => {
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    });
  } else {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  }
};

// Load a single image.
// Used by drawBackground.
const loadImage = imgPath => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', e => resolve(img));
    img.addEventListener('error', () => {
      reject(new Error(`Failed to load image at #{imgPath}`));
    });
    img.src = imgPath;
  });
};

const currentRunTime = (isRunning, clampTime) => {
  let t = 0;
  if (isRunning) {
    if (!lastStartTime) {
      lastStartTime = $time();
    }

    t = $time() - lastStartTime;
    if (clampTime && t > moveTime) {
      t = moveTime;
    }
  }

  return t;
};

const finishMovement = () => {
  setState({isRunning: false});
  lastPauseTime += moveTime;
  lastStartTime = null;
};

// Calculate the screen's current X offset.
const getOffsetForTime = (t, totalFish) => {
  // Normalize the fish movement amount from 0 to 1.
  let amount = t / moveTime;

  // Apply an S-curve to that amount.
  amount = amount - Math.sin(amount * 2 * Math.PI) / (2 * Math.PI);

  return (
    constants.fishCanvasWidth * totalFish -
    constants.canvasWidth / 2 +
    constants.fishCanvasWidth / 2 -
    Math.round(amount * constants.fishCanvasWidth)
  );
};

// Given X (screenX + offsetX), calculate the fish index at that X.
const getFishIdxForLocation = (screenX, offsetX, totalFish) => {
  const n = Math.floor((screenX + offsetX) / constants.fishCanvasWidth);
  return totalFish - n;
};

// Calculate a given fish's X position.
const getXForFish = (numFish, fishIdx, offsetX) => {
  return (numFish - fishIdx) * constants.fishCanvasWidth - offsetX;
};

// Calculate a given fish's Y position.
// It will begin dropping as they pass the midpoint on the screen if not
// liked.
const getYForFish = (numFish, fishIdx, state, offsetX, predictedClassId) => {
  let y = constants.canvasHeight / 2 - constants.fishCanvasHeight / 2;

  // Move fish down a little on predict screen.
  if (state.currentMode === Modes.Predicting) {
    y += 130;

    // And drop the fish down even more if they are not liked.
    const doesLike = predictedClassId === ClassType.Like;
    if (!doesLike) {
      const midScreenX =
        constants.canvasWidth / 2 - constants.fishCanvasWidth / 2;
      const screenX = getXForFish(numFish, fishIdx, offsetX);
      if (screenX > midScreenX) {
        y += screenX - midScreenX;
      }
    }

    // And sway fish vertically on the predicting screen.
    const swayValue =
      (($time() * 360) / (20 * 1000) + (fishIdx + 1) * 10) % 360;
    const swayOffsetY = Math.sin(((swayValue * Math.PI) / 180) * 6) * 8;
    y += swayOffsetY;
  }

  return y;
};

const drawMovingFish = state => {
  const runtime = currentRunTime(
    state.isRunning,
    state.currentMode === Modes.Training
  );
  const t = lastPauseTime + runtime;
  const offsetX = getOffsetForTime(t, state.fishData.length);
  const maxScreenX =
    state.currentMode === Modes.Training
      ? constants.canvasWidth - 100
      : constants.canvasWidth + constants.fishCanvasWidth;
  const startFishIdx = Math.max(
    getFishIdxForLocation(maxScreenX, offsetX, state.fishData.length),
    0
  );
  const lastFishIdx = Math.min(
    getFishIdxForLocation(0, offsetX, state.fishData.length),
    state.fishData.length - 1
  );
  const ctx = state.canvas.getContext('2d');

  for (let i = startFishIdx; i <= lastFishIdx; i++) {
    const fish = state.fishData[i];
    const x = getXForFish(state.fishData.length - 1, i, offsetX);
    const y = getYForFish(
      state.fishData.length - 1,
      i,
      state,
      offsetX,
      fish.result ? fish.result.predictedClassId : false
    );

    drawSingleFish(fish, x, y, ctx);

    if (state.currentMode === Modes.Predicting) {
      if (fish.result) {
        const midScreenX =
          constants.canvasWidth / 2 - constants.fishCanvasWidth / 2;
        if (x > midScreenX) {
          drawPrediction(fish.result.predictedClassId, state.word, x, y, ctx);
        }
      } else {
        predictFish(state, i).then(prediction => {
          fish.result = prediction;
        });
      }
    }
  }

  if (state.currentMode === Modes.Training && runtime === moveTime) {
    finishMovement();
  }
};

// Draw a prediction to the canvas.
const drawPrediction = (predictedClassId, text, x, y, ctx) => {
  const centeredX = x + constants.fishCanvasWidth / 2;
  const doesLike = predictedClassId === ClassType.Like;

  ctx.fillStyle = doesLike ? 'green' : 'red';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  if (!doesLike) {
    text = 'not ' + text;
  }
  ctx.fillText(text.toUpperCase(), centeredX, y);
};

// Draw frame in the center of the screen.
const drawFrame = state => {
  const canvas = state.canvas;
  const size = constants.fishCanvasWidth;
  const frameXPos = canvas.width / 2 - size / 2;
  const frameYPos = canvas.height / 2 - size / 2;
  drawRoundedFrame(
    canvas.getContext('2d'),
    frameXPos,
    frameYPos,
    size,
    size,
    '#F0F0F0',
    '#F0F0F0'
  );
};

// Load all fish part images, and store them in fishPartImages.
const loadAllFishPartImages = () => {
  let fishPartImagesToLoad = [];
  Object.keys(fishData)
    .filter(partName => partName !== 'colorPalettes')
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

  return Promise.all(fishPartImagesToLoad.map(loadFishPartImage)).then(
    results => {
      results.forEach(result => {
        if (fishPartImages[result.data.partIndex] === undefined) {
          fishPartImages[result.data.partIndex] = {};
        }
        fishPartImages[result.data.partIndex][result.data.variationIndex] =
          result.img;
      });
    }
  );
};

// Load a single fish part image.
const loadFishPartImage = data => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', e => resolve({img, data}));
    img.addEventListener('error', () => {
      reject(new Error(`failed to load image at ${data.src}`));
    });
    img.src = data.src;
  });
};

// Draw the fish for pond mode.
const drawPondFishImages = () => {
  const canvas = getState().canvas;
  const ctx = canvas.getContext('2d');
  getState().pondFish.forEach(fish => {
    const swayValue =
      (($time() * 360) / (20 * 1000) + (fish.id + 1) * 10) % 360;
    const swayOffsetX = Math.sin(((swayValue * Math.PI) / 180) * 2) * 120;
    const swayOffsetY = Math.sin(((swayValue * Math.PI) / 180) * 6) * 8;

    drawSingleFish(fish, fish.x + swayOffsetX, fish.y + swayOffsetY, ctx);
  });
};

// Draw a single fish, preferably from cached canvas.
// Used by drawTrainingFish, drawUpcomingFish, drawPredictingFish.
const drawSingleFish = (fish, fishXPos, fishYPos, ctx) => {
  const [fishCanvas, hit] = canvasCache.getCanvas(fish.id);
  if (!hit) {
    fishCanvas.width = constants.fishCanvasWidth;
    fishCanvas.height = constants.fishCanvasHeight;
    const fishCtx = fishCanvas.getContext('2d');
    renderFishFromParts(
      fish,
      fishCtx,
      constants.fishCanvasWidth / 2,
      constants.fishCanvasHeight / 2
    );
  }
  ctx.drawImage(fishCanvas, fishXPos, fishYPos);
};

// Renders a fish into a canvas from its constituent parts.
const renderFishFromParts = (fish, ctx, x = 0, y = 0) => {
  ctx.translate(constants.fishCanvasWidth, 0);
  ctx.scale(-1, 1);
  const body = fish.parts.find(part => part.type === FishBodyPart.BODY);
  const bodyAnchor = bodyAnchorFromType(body, body.type);
  const parts = _.orderBy(fish.parts, ['type']);

  parts.forEach((part, partIndex) => {
    intermediateCtx.clearRect(
      0,
      0,
      constants.fishCanvasWidth,
      constants.fishCanvasHeight
    );

    let anchor = [0, 0];
    if (part.type !== FishBodyPart.BODY) {
      const bodyAnchor = bodyAnchorFromType(body, part.type);
      anchor[0] = bodyAnchor[0];
      anchor[1] = bodyAnchor[1];
    }

    const img = fishPartImages[part.type][part.index];

    if (part.type === FishBodyPart.TAIL) {
      anchor[1] -= img.height / 2;
    }

    const xPos = bodyAnchor[0] + anchor[0];
    const yPos = bodyAnchor[1] + anchor[1];

    intermediateCtx.drawImage(img, xPos, yPos);
    const rgb = colorForFishPart(fish.colorPalette, part);

    if (rgb) {
      // Add some random tint to the RGB value.
      const tintAmount = 20;
      let newRgb = [];
      newRgb[0] = clamp(rgb[0] + randomInt(-tintAmount, tintAmount), 0, 255);
      newRgb[1] = clamp(rgb[1] + randomInt(-tintAmount, tintAmount), 0, 255);
      newRgb[2] = clamp(rgb[2] + randomInt(-tintAmount, tintAmount), 0, 255);

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
          data[i] = newRgb[0];
          data[i + 1] = newRgb[1];
          data[i + 2] = newRgb[2];
        }
      }

      intermediateCtx.putImageData(imageData, xPos, yPos);
    }

    ctx.drawImage(
      intermediateCanvas,
      x - intermediateCanvas.width / 2,
      y - intermediateCanvas.height / 2,
      constants.fishCanvasWidth,
      constants.fishCanvasHeight
    );
  });
};

// Clear the sprite canvas.
export const clearCanvas = canvas => {
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
};

// Draw an overlay over the whole scene.  Used for fades.
function drawOverlays() {
  const duration = $time() - currentModeStartTime;
  let amount = 1 - duration / 800;
  if (amount < 0) {
    amount = 0;
  }
  DrawFade(amount, '#000');
}

// Draw a fade over the scene.
function DrawFade(amount, overlayColour) {
  if (amount === 0) {
    return;
  }

  const canvasCtx = getState().canvas.getContext('2d');
  canvasCtx.globalAlpha = amount;
  canvasCtx.fillStyle = overlayColour;
  DrawFilledRect(0, 0, constants.canvasWidth, constants.canvasHeight);
  canvasCtx.globalAlpha = 1;
}

const drawRoundedFrame = (
  ctx,
  x,
  y,
  w,
  h,
  backgroundColor,
  borderColor,
  thickness = 2
) => {
  const r = 10;
  ctx.lineJoin = 'round';
  ctx.lineWidth = r;

  // Outer frame
  ctx.strokeStyle = borderColor;
  ctx.strokeRect(x + r / 2, y + r / 2, w - r, h - r);
  ctx.fillStyle = borderColor;
  DrawFilledRect(x + r / 2, y + r / 2, w - r, h - r);

  // Inner frame
  ctx.strokeStyle = backgroundColor;
  ctx.strokeRect(
    x + r / 2 + thickness,
    y + r / 2 + thickness,
    w - r - thickness * 2,
    h - r - thickness * 2
  );
  ctx.fillStyle = backgroundColor;
  DrawFilledRect(
    x + r / 2 + thickness,
    y + r / 2 + thickness,
    w - r - thickness * 2,
    h - r - thickness * 2
  );
};

// Draw a filled rectangle.
function DrawFilledRect(x, y, w, h) {
  x = Math.floor(x / 1);
  y = Math.floor(y / 1);
  w = Math.floor(w / 1);
  h = Math.floor(h / 1);

  const canvasCtx = getState().canvas.getContext('2d');
  canvasCtx.fillRect(x, y, w, h);
}

// A single frame of animation.
window.requestAnimFrame = (() => {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(/* function */ callback, /* DOMElement */ element) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();
