import 'idempotent-babel-polyfill';
import {getState, setState} from './state';
import constants, {AppMode, Modes, ClassType} from './constants';
import CanvasCache from './canvasCache';
import {backgroundPathForMode} from './helpers';
import {predictFish} from './models/predict';
import {
  loadAllFishPartImages,
  loadAllSeaCreatureImages,
  loadAllTrashImages,
  initMobilenet,
  FishOceanObject,
  SeaCreatureOceanObject
} from './OceanObject';
import aiBotClosed from '../../public/images/ai-bot/ai-bot-closed.png';
import aiBotCheckmark from '../../public/images/ai-bot/ai-bot-checkmark.png';
import aiBotX from '../../public/images/ai-bot/ai-bot-x.png';
import redScanner from '../../public/images/ai-bot/red-scanner.png';
import greenScanner from '../../public/images/ai-bot/green-scanner.png';
import blueScanner from '../../public/images/ai-bot/blue-scanner.png';

var $time =
  Date.now ||
  function() {
    return +new Date();
  };

let prevState = {};
let currentModeStartTime = $time();
let canvasCache;
let lastPauseTime = 0;
let lastStartTime;
let defaultMoveTime = 1000;
let moveTime;
let botImages = {};
let botVelocity = 3;
let botY, botYDestination;
let currentPredictedClassId;

export const initRenderer = () => {
  canvasCache = new CanvasCache();
  let promises = [];
  promises.push(loadAllFishPartImages());
  if (getState().loadTrashImages) {
    promises.push(loadAllTrashImages());
    promises.push(loadAllSeaCreatureImages());
    promises.push(initMobilenet());
  }
  return Promise.all(promises);
};

// Render a single frame of the scene.
// Sometimes performs special rendering actions, such as when mode has changed.
export const render = () => {
  const state = getState();

  if (state.currentMode !== prevState.currentMode) {
    canvasCache.clearCache();
    drawBackground(state);
    currentModeStartTime = $time();
    lastPauseTime = 0;
    lastStartTime = null;
    botY = null;
    botYDestination = null;
    currentPredictedClassId = null;

    if (state.currentMode === Modes.Training) {
      moveTime = defaultMoveTime / 2;
    } else {
      moveTime = defaultMoveTime;
    }

    if (state.currentMode === Modes.Predicting) {
      loadAllBotImages();
    }
  }

  clearCanvas(state.canvas);

  const timeBeforeCanSkipPredict = 5000;
  const timeBeforeCanSkipBiasText = 2000;
  const timeBeforeCanSeePondText = 3000;
  const timeBeforeCanSkipPond = 5000;

  switch (state.currentMode) {
    case Modes.Training:
      drawFrame(state);
      drawMovingFish(state);
      break;
    case Modes.Predicting:
      drawPredictBot(state);
      drawMovingFish(state);

      if (state.appMode === AppMode.CreaturesVTrashDemo) {
        if (state.showBiasText) {
          setState({
            canSkipPredict:
              $time() >= state.biasTextTime + timeBeforeCanSkipBiasText
          });
        }
      } else if (state.isRunning) {
        setState({
          canSkipPredict:
            $time() >= state.runStartTime + timeBeforeCanSkipPredict
        });
      }

      break;
    case Modes.Pond:
      drawPondFishImages();

      setState({
        canSkipPond: $time() >= currentModeStartTime + timeBeforeCanSkipPond,
        canSeePondText:
          $time() >= currentModeStartTime + timeBeforeCanSeePondText
      });
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
// Used by drawBackground and loadAllBotImages.
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

// Loads all bot + bot scanner images and caches them in botImages.
const loadAllBotImages = async () => {
  botImages = {}; // Empty previous cache
  const imagesToLoad = {
    defaultBot: aiBotClosed,
    defaultScanner: blueScanner,
    likeBot: aiBotCheckmark,
    likeScanner: greenScanner,
    dislikeBot: aiBotX,
    dislikeScanner: redScanner
  };
  let imagePromises = [];

  Object.keys(imagesToLoad).forEach(key => {
    imagePromises.push(
      loadImage(imagesToLoad[key]).then(img => {
        botImages[key] = img;
      })
    );
  });

  await Promise.all(imagePromises);
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

const pauseMovement = t => {
  setState({isRunning: false, isPaused: true});
  lastPauseTime = t;
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
    y += 120;

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

  let centerFish;
  for (let i = startFishIdx; i <= lastFishIdx; i++) {
    const fish = state.fishData[i];
    const x = getXForFish(state.fishData.length - 1, i, offsetX);
    const y = getYForFish(
      state.fishData.length - 1,
      i,
      state,
      offsetX,
      fish.getResult() ? fish.getResult().predictedClassId : false
    );

    if (state.currentMode === Modes.Predicting) {
      if (fish.getResult()) {
        const midScreenX =
          constants.canvasWidth / 2 - constants.fishCanvasWidth / 2;
        if (Math.abs(midScreenX - x) <= 50) {
          centerFish = fish;
          if (
            state.isRunning &&
            state.appMode === AppMode.CreaturesVTrashDemo
          ) {
            if (fish instanceof FishOceanObject) {
              fish.result.predictedClassId = 0;
            } else if (fish instanceof SeaCreatureOceanObject) {
              fish.result.predictedClassId = 1;
            } else {
              fish.result.predictedClassId = 1;
            }
            if (i === lastFishIdx && Math.abs(midScreenX - x) <= 1) {
              pauseMovement(t);
              setState({showBiasText: true, biasTextTime: $time()});
            }
          }
        }
      } else {
        predictFish(state, i).then(prediction => {
          fish.setResult(prediction);
        });
      }
    }

    drawSingleFish(fish, x, y, ctx);
  }

  if (state.currentMode === Modes.Predicting) {
    currentPredictedClassId = centerFish
      ? centerFish.getResult().predictedClassId
      : null;
  }

  if (state.currentMode === Modes.Training && runtime === moveTime) {
    finishMovement();
  }
};

// Draw AI bot + scanner to canvas for predict mode.
// *Note:* This will no-op if the expected bot/scanner is not present
// in the botImages cache. Call loadAllBotImages() to populate the botImages cache.
const drawPredictBot = state => {
  let botImg, scannerImg;
  if (currentPredictedClassId === ClassType.Like) {
    botImg = botImages.likeBot;
    scannerImg = botImages.likeScanner;
  } else if (currentPredictedClassId === ClassType.Dislike) {
    botImg = botImages.dislikeBot;
    scannerImg = botImages.dislikeScanner;
  } else {
    botImg = botImages.defaultBot;
    scannerImg = botImages.defaultScanner;
  }

  if (!botImg || !scannerImg) {
    return;
  }

  let botX = state.canvas.width / 2 - botImg.width / 2;
  botY = botY || state.canvas.height / 2 - botImg.height / 2;
  const ctx = state.canvas.getContext('2d');

  // Move AI bot above fish parade.
  if (state.isRunning || state.isPaused) {
    botYDestination = botYDestination || botY - 120;

    const distToDestination = Math.abs(botYDestination - botY);
    if (distToDestination > 1) {
      const direction = distToDestination === botYDestination - botY ? 1 : -1;
      botY += direction * botVelocity;
    }

    // Draw scanner.
    const scannerX = state.canvas.width / 2 - scannerImg.width / 2;
    ctx.drawImage(scannerImg, scannerX, botY + 50);
  }

  // Draw bot.
  ctx.drawImage(botImg, botX, botY);
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

// Draw the fish for pond mode.
const drawPondFishImages = () => {
  const canvas = getState().canvas;
  const ctx = canvas.getContext('2d');

  const fishBounds = [];

  getState().pondFish.forEach(fish => {
    const pondClickedFish = getState().pondClickedFish;
    const pondClickedFishUs = pondClickedFish && fish.id === pondClickedFish.id;

    const swayValue =
      (($time() * 360) / (20 * 1000) + (fish.getId() + 1) * 10) % 360;
    const swayMultipleX = 120;
    const swayOffsetX =
      Math.sin(((swayValue * Math.PI) / 180) * 2) * swayMultipleX;
    const swayOffsetY = Math.sin(((swayValue * Math.PI) / 180) * 6) * 8;

    const xy = fish.getXY();
    const finalX = xy.x + swayOffsetX;
    const finalY = xy.y + swayOffsetY;

    const size = pondClickedFishUs ? 1 : 0.5;

    drawSingleFish(fish, finalX, finalY, ctx, size);

    // Record this screen location so that we can separately check for clicks on it.
    fishBounds.push({
      fishId: fish.id,
      x: finalX,
      y: finalY,
      w: constants.fishCanvasWidth / 2,
      h: constants.fishCanvasHeight / 2,
      confidence: fish.result
    });
    setState({pondFishBounds: fishBounds}, {skipCallback: true});
  });
};

// Draw a single fish, preferably from cached canvas.
// Used by drawMovingFish and drawPondFishImages.
// Takes an optional size multipler, where 0.5 means fish are half size.
const drawSingleFish = (fish, fishXPos, fishYPos, ctx, size = 1) => {
  const [fishCanvas, hit] = canvasCache.getCanvas(fish.id);
  if (!hit) {
    fishCanvas.width = constants.fishCanvasWidth;
    fishCanvas.height = constants.fishCanvasHeight;
    fish.drawToCanvas(fishCanvas);
  }

  // TODO: Does scaling during drawImage have a performance impact on some
  // devices/browsers?  We migth need to pre-cache scaled images.
  const width = fishCanvas.width * size;
  const height = fishCanvas.height * size;

  // Maintain the center of the fish.
  const adjustedFishXPos = fishXPos - width / 2 + fishCanvas.width / 2;
  const adjustedFishYPos = fishYPos - height / 2 + fishCanvas.height / 2;

  ctx.drawImage(
    fishCanvas,
    Math.round(adjustedFishXPos),
    Math.round(adjustedFishYPos),
    width,
    height
  );
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
