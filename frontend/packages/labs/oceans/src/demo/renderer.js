import 'babel-polyfill';
import _ from 'lodash';
import {getState} from './state';
import constants, {Modes} from './constants';
import {
  backgroundPathForMode,
  bodyAnchorFromType,
  colorFromType,
  randomInt
} from './helpers';
import {FishBodyPart} from '../utils/fishData';

let prevState = {};

export const render = () => {
  const state = getState();
  drawBackground(state);

  if (prevState.uiElements !== state.uiElements) {
    drawUiElements(state);
  }

  switch (state.currentMode) {
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
      if (prevState.pondFish !== state.pondFish) {
        loadPondFishImages();
        clearCanvas(state.canvas);
        //drawPondFish(state);
      }
      clearCanvas(state.canvas);
      drawPondFishImages();
      break;
    default:
      console.error('Unrecognized mode specified.');
  }

  prevState = {...state};
  window.requestAnimFrame(render);
};

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

export const drawTrainingFish = state => {
  const canvas = state.canvas;
  const ctx = canvas.getContext('2d');

  // Draw frame behind fish
  ctx.fillStyle = '#FFFFFF';
  const frameSize = 300;
  const frameXPos = canvas.width / 2 - frameSize / 2;
  const frameYPos = canvas.height / 2 - frameSize / 2;
  ctx.fillRect(frameXPos, frameYPos, frameSize, frameSize);

  const fish = state.fishData[state.trainingIndex];
  const fishXPos = frameXPos + (frameSize - constants.fishCanvasWidth) / 2;
  const fishYPos = frameYPos + (frameSize - constants.fishCanvasHeight) / 2;
  drawSingleFish(fish, fishXPos, fishYPos, ctx);
};

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

export const drawUiElements = state => {
  const container = state.uiContainer;
  container.innerHTML = '';
  state.uiElements.forEach(el => container.appendChild(el));
};

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

export const drawPondFish = state => {
  const canvas = state.canvas;
  state.pondFish.forEach(fish => {
    loadFishImages(fish).then(results => {
      const randomX = randomInt(
        constants.fishCanvasWidth / 4,
        canvas.width - constants.fishCanvasWidth / 4
      );
      const randomY = randomInt(
        constants.fishCanvasHeight / 4,
        canvas.height - constants.fishCanvasHeight / 4
      );
      drawFish(fish, results, canvas.getContext('2d'), randomX, randomY);
    });
  });
};

const loadPondFishImages = () => {
  getState().pondFish.forEach(fish => {
    fish.parts.map(loadFishImage);
  });
};

const drawPondFishImages = () => {
  const canvas = getState().canvas;
  const ctx = canvas.getContext('2d');
  getState().pondFish.forEach(fish => {
    drawSingleFish(fish, fish.x, fish.y, ctx);
  });
};

const loadFishImages = fish => {
  return Promise.all(fish.parts.map(loadFishImage));
};

const loadFishImage = fishPart => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', e => resolve({img, fishPart}));
    img.addEventListener('error', () => {
      reject(new Error(`failed to load image at #{fishPart.src}`));
    });
    img.src = fishPart.src;
  });
};

const drawSingleFish = (fish, fishXPos, fishYPos, ctx) => {
  if (!fish.canvas) {
    fish.canvas = document.createElement('canvas');
    fish.canvas.width = constants.fishCanvasWidth;
    fish.canvas.height = constants.fishCanvasHeight;
    loadFishImages(fish).then(results => {
      const fishCtx = fish.canvas.getContext('2d');
      drawFish(
        fish,
        results,
        fishCtx,
        constants.fishCanvasWidth / 2,
        constants.fishCanvasHeight / 2
      );
      ctx.drawImage(fish.canvas, fishXPos, fishYPos);
    });
  } else {
    ctx.drawImage(fish.canvas, fishXPos, fishYPos);
  }
};

const drawFish = (fish, results, ctx, x = 0, y = 0) => {
  ctx.translate(constants.fishCanvasWidth, 0);
  ctx.scale(-1, 1);
  const body = results.find(
    result => result.fishPart.type === FishBodyPart.BODY
  ).fishPart;
  const bodyAnchor = bodyAnchorFromType(body, body.type);
  results = _.orderBy(results, ['fishPart.type']);

  results.forEach(result => {
    let intermediateCanvas = document.createElement('canvas');
    intermediateCanvas.width = constants.fishCanvasWidth;
    intermediateCanvas.height = constants.fishCanvasHeight;
    let intermediateCtx = intermediateCanvas.getContext('2d');
    let anchor = [0, 0];
    if (result.fishPart.type !== FishBodyPart.BODY) {
      const bodyAnchor = bodyAnchorFromType(body, result.fishPart.type);
      anchor[0] = bodyAnchor[0];
      anchor[1] = bodyAnchor[1];
    }
    if (result.fishPart.type === FishBodyPart.TAIL) {
      anchor[1] -= result.img.height / 2;
    }

    const xPos = bodyAnchor[0] + anchor[0];
    const yPos = bodyAnchor[1] + anchor[1];

    intermediateCtx.drawImage(result.img, xPos, yPos);
    const rgb = colorFromType(fish.colorPalette, result.fishPart.type);

    if (rgb) {
      let imageData = intermediateCtx.getImageData(
        xPos,
        yPos,
        result.img.width,
        result.img.height
      );
      let data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255) {
          data[i] = rgb[0];
          data[i + 1] = rgb[1];
          data[i + 2] = rgb[2];
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

export const clearCanvas = canvas => {
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
};

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
