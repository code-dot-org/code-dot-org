import 'babel-polyfill';
import _ from 'lodash';
import constants, {ClassType} from './constants';
import {FishBodyPart} from '../utils/fishData';
import {getState} from './state';

export const drawBackground = imgPath => {
  const canvas = getState().backgroundCanvas;
  if (!canvas) {
    return;
  }

  if (!imgPath) {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  loadImage(imgPath).then(img => {
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  });
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
  loadFishImages(fish).then(results => {
    drawFish(fish, results, ctx, canvas.width / 2, canvas.height / 2);
  });
};

export const drawUpcomingFish = state => {
  const fishLeft = state.fishData.length - state.trainingIndex - 1;
  const numUpcomingFish = fishLeft >= 3 ? 3 : fishLeft;
  const canvas = state.canvas;
  let x = canvas.width / 2 - 300;

  for (let i = 1; i <= numUpcomingFish; i++) {
    const fish = state.fishData[state.trainingIndex + i];
    loadFishImages(fish).then(results => {
      drawFish(fish, results, canvas.getContext('2d'), x, canvas.height / 2);
      x -= 200;
    });
  }
};

export const drawUiElements = (container, children) => {
  clearChildren(container);
  children.forEach(child => container.appendChild(child));
};

export const drawPredictingFish = state => {
  const fish = state.fishData[state.trainingIndex];
  const canvas = state.canvas;
  loadFishImages(fish).then(results => {
    drawFish(
      fish,
      results,
      canvas.getContext('2d'),
      canvas.width / 2,
      canvas.height / 2
    );
  });
};

export const drawPondFish = state => {
  predictAllFish(state, fishWithConfidence => {
    fishWithConfidence = _.sortBy(fishWithConfidence, ['confidence']);
    const pondFish = fishWithConfidence.splice(0, 20);
    const canvas = state.canvas;

    pondFish.forEach(fish => {
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
  });
};

const predictAllFish = (state, onComplete) => {
  let fishWithConfidence = [];
  state.fishData.map((fish, index) => {
    state.trainer.predictFromData(fish.knnData).then(res => {
      if (res.predictedClassId === ClassType.Like) {
        let data = {
          ...fish,
          confidence: res.confidencesByClassId[res.predictedClassId]
        };
        fishWithConfidence.push(data);
      }

      if (index === state.fishData.length - 1) {
        onComplete(fishWithConfidence);
      }
    });
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

const drawFish = (fish, results, ctx, x = 0, y = 0) => {
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
      anchor = bodyAnchorFromType(body, result.fishPart.type);
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

const clearChildren = el => {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
};

export const clearCanvas = canvas => {
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
};

const bodyAnchorFromType = (body, type) => {
  switch (type) {
    case FishBodyPart.EYE:
      return body.eyeAnchor;
    case FishBodyPart.MOUTH:
      return body.mouthAnchor;
    case FishBodyPart.DORSAL_FIN:
      return body.dorsalFinAnchor;
    case FishBodyPart.PECTORAL_FIN:
      return body.pectoralFinAnchor;
    case FishBodyPart.TAIL:
      return body.tailAnchor;
    case FishBodyPart.BODY:
      return body.anchor;
    default:
      return [0, 0];
  }
};

const colorFromType = (palette, type) => {
  switch (type) {
    case FishBodyPart.MOUTH:
      return palette.mouthRgb;
    case FishBodyPart.DORSAL_FIN:
    case FishBodyPart.PECTORAL_FIN:
    case FishBodyPart.TAIL:
      return palette.finRgb;
    case FishBodyPart.BODY:
      return palette.bodyRgb;
    default:
      return null;
  }
};

const randomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
