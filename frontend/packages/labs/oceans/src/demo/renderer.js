import 'babel-polyfill';
import _ from 'lodash';
import {getState} from './state';
import constants, {Modes} from './constants';
import CanvasCache from './canvasCache';
import {
  backgroundPathForMode,
  bodyAnchorFromType,
  colorFromType,
  randomInt,
  clamp
} from './helpers';
import fishData, {FishBodyPart} from '../utils/fishData';

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

  if (
    state.headerContainer &&
    prevState.headerElements !== state.headerElements
  ) {
    drawUiElements(state.headerContainer, state.headerElements);
  }

  if (state.uiContainer && prevState.uiElements !== state.uiElements) {
    drawUiElements(state.uiContainer, state.uiElements);
  }

  if (
    state.footerContainer &&
    prevState.footerElements !== state.footerElements
  ) {
    drawUiElements(state.footerContainer, state.footerElements);
  }

  if (state.currentMode !== prevState.currentMode) {
    drawBackground(state);
    currentModeStartTime = $time();
  }

  switch (state.currentMode) {
    case Modes.Loading:
      clearCanvas(state.canvas);
      break;
    case Modes.Words:
      clearCanvas(state.canvas);
      break;
    case Modes.Training:
      clearCanvas(state.canvas);
      drawTrainingFish(state);
      drawUpcomingFish(state);
      break;
    case Modes.Predicting:
      clearCanvas(state.canvas);
      drawPredictingFish(state);
      break;
    case Modes.Pond:
      clearCanvas(state.canvas);
      drawPondFishImages();
      break;
    default:
      console.error('Unrecognized mode specified.');
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

// Draw the fish for training mode.
export const drawTrainingFish = state => {
  const canvas = state.canvas;
  const ctx = canvas.getContext('2d');

  // Draw frame behind fish
  const frameSize = 300;
  const frameXPos = canvas.width / 2 - frameSize / 2;
  const frameYPos = canvas.height / 2 - frameSize / 2;
  drawRoundedFrame(
    ctx,
    frameXPos,
    frameYPos,
    frameSize,
    frameSize,
    '#FFFFFF',
    '#000000'
  );

  const fish = state.fishData[state.trainingIndex];
  const fishXPos = frameXPos + (frameSize - constants.fishCanvasWidth) / 2;
  const fishYPos = frameYPos + (frameSize - constants.fishCanvasHeight) / 2;
  drawSingleFish(fish, fishXPos, fishYPos, ctx);
};

// Draw the upcoming fish for training mode.
export const drawUpcomingFish = state => {
  const fishLeft = state.fishData.length - state.trainingIndex - 1;
  const numUpcomingFish = fishLeft >= 3 ? 3 : fishLeft;
  const canvas = state.canvas;
  const ctx = canvas.getContext('2d');
  let x = canvas.width / 2 - 300 - constants.fishCanvasWidth / 2;
  const y = canvas.height / 2 - constants.fishCanvasHeight / 2;

  for (let i = 1; i <= numUpcomingFish; i++) {
    const fish = state.fishData[state.trainingIndex + i];
    drawSingleFish(fish, x, y, ctx);
    x -= 200;
  }
};

// Draw the fish for predicting mode.
export const drawPredictingFish = state => {
  const fish = state.fishData[state.trainingIndex];
  const canvas = state.canvas;
  drawSingleFish(
    fish,
    canvas.width / 2 - constants.fishCanvasWidth / 2,
    canvas.height / 2 - constants.fishCanvasHeight / 2,
    canvas.getContext('2d')
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
    var swayValue = (($time() * 360) / (20 * 1000) + (fish.id + 1) * 10) % 360;
    var swayOffsetX = Math.sin(((swayValue * Math.PI) / 180) * 2) * 120;
    var swayOffsetY = Math.sin(((swayValue * Math.PI) / 180) * 6) * 8;

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
    const rgb = colorFromType(fish.colorPalette, part.type);

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
        if (data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255) {
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
  var duration = $time() - currentModeStartTime;
  var amount = 1 - duration / 800;
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

// Attach HTML UI elements to the DOM.
export const drawUiElements = (container, elements) => {
  container.innerHTML = '';
  elements.forEach(el => container.appendChild(el));
};

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
