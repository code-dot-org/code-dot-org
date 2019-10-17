import 'babel-polyfill';
import _ from 'lodash';
import constants, {Modes, ClassType, strForClassType} from './constants';
import {FishBodyPart} from '../utils/fishData';
import {setState, getState} from './state';

const FISH_CANVAS_WIDTH = 300;
const FISH_CANVAS_HEIGHT = 200;

export const renderBackground = imgPath => {
  const canvas = getState().backgroundCanvas;
  if (!canvas) {
    return;
  }

  loadImage(imgPath).then(img => {
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  });
};

export const render = () => {};

// Initialize the renderer once.
// This will generate canvases with the fish collection.
export function init(canvas) {
  clearBackground();
  const state = setState({
    canvas,
    ctx: canvas.getContext('2d')
  });

  switch (state.currentMode) {
    case Modes.Training:
      initTrainingScreen(state);
      break;
    case Modes.Predicting:
      initPredictingScreen(state);
      break;
    case Modes.Pond:
      initPondScreen(state);
      break;
    default:
      console.error('Unrecognized mode passed to renderer init method.');
  }
}

const loadImage = imgPath => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', e => resolve(img));
    img.addEventListener('error', () => {
      reject(new Error(`failed to load background image at #{imgPath}`));
    });
    img.src = imgPath;
  });
};

function renderBackgroundImage(img) {
  const canvas = backgroundCanvas();
  if (!canvas) {
    return;
  }

  canvas.width = constants.canvasWidth;
  canvas.height = constants.canvasHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, constants.canvasWidth, constants.canvasHeight);
}

function initTrainingScreen(state) {
  // We only want to draw the background and UI elements once,
  // so render here instead of in drawTrainingScreen().
  loadBackgroundImage().then(backgroundImg => {
    renderBackgroundImage(backgroundImg);
    drawTrainingScreen(state);
    drawTrainingUiElements(state);
  });
}

function drawTrainingScreen(state) {
  state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
  drawTrainingFish(state);
  drawUpcomingFish(state);
}

function drawTrainingFish(state) {
  const canvas = state.canvas;
  const ctx = canvas.getContext('2d');

  // Draw frame behind fish
  ctx.fillStyle = '#FFFFFF';
  const frameSize = 300;
  const frameXPos = canvas.width / 2 - frameSize / 2;
  const frameYPos = canvas.height / 2 - frameSize / 2;
  ctx.fillRect(frameXPos, frameYPos, frameSize, frameSize);

  const fishDatum = state.fishData[state.trainingIndex];
  loadFishImages(fishDatum.fish).then(results => {
    drawFish(fishDatum.fish, results, ctx, canvas.width / 2, canvas.height / 2);
  });
}

function drawUpcomingFish(state) {
  const fishLeft = state.fishData.length - state.trainingIndex - 1;
  const numUpcomingFish = fishLeft >= 3 ? 3 : fishLeft;
  const canvas = state.canvas;
  let x = canvas.width / 2 - 300;

  for (let i = 1; i <= numUpcomingFish; i++) {
    const fishDatum = state.fishData[state.trainingIndex + i];
    loadFishImages(fishDatum.fish).then(results => {
      const ctx = canvas.getContext('2d');
      drawFish(fishDatum.fish, results, ctx, x, canvas.height / 2);
      x -= 200;
    });
  }
}

function drawTrainingUiElements(state) {
  const classifyFish = function(doesLike) {
    const knnData = state.fishData[state.trainingIndex].fish.knnData;
    const classId = doesLike ? ClassType.Like : ClassType.Dislike;
    state.trainer.addExampleData(knnData, classId);
    state.trainingIndex += 1;
    setState({trainingIndex: state.trainingIndex});
    drawTrainingScreen(state);
  };

  const container = uiContainer();
  const buttons = [
    {
      text: 'like',
      id: 'like-button',
      onClick: () => classifyFish(true)
    },
    {
      text: 'dislike',
      id: 'dislike-button',
      onClick: () => classifyFish(false)
    },
    {
      text: 'next',
      id: 'next-button',
      onClick: () => {
        clearChildren(container);
        const canvas = state.canvas;
        setState({currentMode: Modes.Predicting});
        init(canvas);
      }
    }
  ];

  buttons.forEach(button =>
    renderButton(container, button.id, button.text, button.onClick)
  );
}

function initPredictingScreen(state) {
  drawPredictingScreen(state);
}

function drawPredictingScreen(state) {
  state.canvas
    .getContext('2d')
    .clearRect(0, 0, state.canvas.width, state.canvas.height);
  drawPredictingFish(state);
  drawPredictingUiElements(state);
}

function drawPredictingFish(state) {
  const canvas = state.canvas;
  const ctx = canvas.getContext('2d');

  const fishDatum = state.fishData[state.trainingIndex];
  loadFishImages(fishDatum.fish).then(results => {
    drawFish(fishDatum.fish, results, ctx, canvas.width / 2, canvas.height / 2);
  });
}

function drawPredictingUiElements(state) {
  const container = uiContainer();
  const buttons = [
    {
      text: 'predict next fish',
      id: 'predict-button',
      onClick: () => {
        state.trainingIndex += 1;
        setState(state);
        drawPredictingScreen(state);
      }
    },
    {
      text: 'next',
      id: 'next-button',
      onClick: () => {
        clearChildren(container);
        const canvas = state.canvas;
        setState({currentMode: Modes.Pond});
        init(canvas);
      }
    }
  ];

  predictionText(state, res => {
    const text = `prediction: ${strForClassType(res.predictedClassId)} @ ${
      res.confidencesByClassId[res.predictedClassId]
    }`;
    renderText(container, 'predict-text', text);
    buttons.forEach(button =>
      renderButton(container, button.id, button.text, button.onClick)
    );
  });
}

function predictionText(state, onComplete) {
  const fishDatum = state.fishData[state.trainingIndex];
  state.trainer.predictFromData(fishDatum.fish.knnData).then(res => {
    onComplete(res);
  });
}

function initPondScreen(state) {
  loadBackgroundImage().then(backgroundImg => {
    renderBackgroundImage(backgroundImg);
    drawPondScreen(state);
    drawPondUiElements(state);
  });
}

function drawPondScreen(state) {
  drawPondFish(state);
}

function drawPondFish(state) {
  predictAllFish(state, fishWithConfidence => {
    fishWithConfidence = _.sortBy(fishWithConfidence, ['confidence']);
    const pondFish = fishWithConfidence.splice(0, 20);

    pondFish.forEach(fishDatum => {
      loadFishImages(fishDatum.fish).then(results => {
        const randomX = randomInt(
          FISH_CANVAS_WIDTH / 4,
          state.canvas.width - FISH_CANVAS_WIDTH / 4
        );
        const randomY = randomInt(
          FISH_CANVAS_HEIGHT / 4,
          state.canvas.height - FISH_CANVAS_HEIGHT / 4
        );
        drawFish(fishDatum.fish, results, state.ctx, randomX, randomY);
      });
    });
  });
}

function predictAllFish(state, onComplete) {
  let fishWithConfidence = [];
  state.fishData.map((fishDatum, index) => {
    state.trainer.predictFromData(fishDatum.fish.knnData).then(res => {
      if (res.predictedClassId === ClassType.Like) {
        let data = {
          ...fishDatum,
          confidence: res.confidencesByClassId[res.predictedClassId]
        };
        fishWithConfidence.push(data);
      }

      if (index === state.fishData.length - 1) {
        onComplete(fishWithConfidence);
      }
    });
  });
}

function drawPondUiElements(state) {
  const container = uiContainer();
  const buttons = [
    {
      text: 'start over',
      id: 'start-over-button',
      onClick: () => {
        clearChildren(container);
        const canvas = state.canvas;
        state.currentMode = Modes.Training;
        state.trainer.clearAll();
        setState(state);
        init(canvas);
      }
    }
  ];

  buttons.forEach(button =>
    renderButton(container, button.id, button.text, button.onClick)
  );
}

function loadFishImages(fish) {
  return Promise.all(fish.parts.map(loadFishImage));
}

function loadFishImage(fishPart) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', e => resolve({img, fishPart}));
    img.addEventListener('error', () => {
      reject(new Error(`failed to load image at #{fishPart.src}`));
    });
    img.src = fishPart.src;
  });
}

function drawFish(fish, results, ctx, x = 0, y = 0) {
  const body = results.find(
    result => result.fishPart.type === FishBodyPart.BODY
  ).fishPart;
  const bodyAnchor = bodyAnchorFromType(body, body.type);
  results = _.orderBy(results, ['fishPart.type']);

  results.forEach(result => {
    let intermediateCanvas = document.createElement('canvas');
    intermediateCanvas.width = FISH_CANVAS_WIDTH;
    intermediateCanvas.height = FISH_CANVAS_HEIGHT;
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
      FISH_CANVAS_WIDTH,
      FISH_CANVAS_HEIGHT
    );
  });
}

function renderButton(container, id, text, onClick) {
  // If an element with this id already exists, destroy it.
  destroyElById(id);

  let btnEl = document.createElement('button');
  btnEl.innerHTML = text;
  btnEl.setAttribute('id', id);
  btnEl.setAttribute('class', 'ui-button');
  btnEl.addEventListener('click', onClick);
  container.appendChild(btnEl);
}

function renderText(container, id, text) {
  // If an element with this id already exists, destroy it.
  destroyElById(id);

  let textEl = document.createElement('div');
  textEl.setAttribute('id', id);
  textEl.innerHTML = text;
  container.appendChild(textEl);
}

function clearChildren(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

function uiContainer() {
  return document.getElementById('ui-container');
}

function backgroundCanvas() {
  return document.getElementById('background-canvas');
}

function clearBackground() {
  const canvas = backgroundCanvas();
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function destroyElById(id) {
  const existingEl = document.getElementById(id);
  if (existingEl) {
    existingEl.remove();
  }
}

function bodyAnchorFromType(body, type) {
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
}

function colorFromType(palette, type) {
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
}

function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
