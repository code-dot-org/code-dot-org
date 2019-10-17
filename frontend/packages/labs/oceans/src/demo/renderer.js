import 'babel-polyfill';
import _ from 'lodash';
import constants, {Modes, ClassType, strForClassType} from './constants';
import {FishBodyPart} from '../utils/fishData';
import {setState} from './state';

const FISH_CANVAS_WIDTH = 300;
const FISH_CANVAS_HEIGHT = 200;

// Initialize the renderer once.
// This will generate canvases with the fish collection.
export function init(canvas) {
  canvas.width = constants.canvasWidth;
  canvas.height = constants.canvasHeight;
  const state = setState({
    canvas,
    ctx: canvas.getContext('2d')
  });

  switch (state.currentMode) {
    case Modes.Training:
      drawTrainingScreen(state);
      break;
    case Modes.Predicting:
      drawPredictingScreen(state);
      break;
    case Modes.Pond:
      drawPondScreen(state);
      break;
    default:
      console.error('Unrecognized mode passed to renderer init method.');
  }
}

function loadBackgroundImage() {
  let backgroundImageName;
  // const currentMode = getState().currentMode;
  // if (currentMode === Modes.Training) {
  //   backgroundImageName = 'classroom';
  // } else if (currentMode === Modes.Predicting) {
  //   backgroundImageName = 'pipes';
  // } else if (currentMode === Modes.Pond) {
  //   backgroundImageName = 'underwater';
  // }

  backgroundImageName = 'underwater';

  return new Promise((resolve, reject) => {
    const img = new Image();
    const srcPath = `images/${backgroundImageName}-background.png`;
    img.addEventListener('load', e => resolve(img));
    img.addEventListener('error', () => {
      reject(new Error(`failed to load background image at #{srcPath}`));
    });
    img.src = srcPath;
  });
}

function renderBackgroundImage(ctx, img) {
  //ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(img, 0, 0, constants.canvasWidth, constants.canvasHeight);
}

function drawTrainingScreen(state) {
  if (state.backgroundImg) {
    renderBackgroundImage(state.ctx, state.backgroundImg);
    drawTrainingFish(state);
    drawUpcomingFish(state);
    if (!state.uiDrawn) {
      drawTrainingUiElements(state);
      state.uiDrawn = true;
      setState(state);
    }
  } else {
    loadBackgroundImage().then(backgroundImg => {
      state = {...state, backgroundImg};
      setState(state);
      drawTrainingScreen(state);
    });
  }
}

function drawSingleFish(fishDatum, fishXPos, fishYPos, ctx) {
  if (!fishDatum.canvas) {
    fishDatum.canvas = document.createElement('canvas');
    fishDatum.canvas.width = FISH_CANVAS_WIDTH;
    fishDatum.canvas.height = FISH_CANVAS_HEIGHT;
    loadFishImages(fishDatum.fish).then(results => {
      const fishCtx = fishDatum.canvas.getContext('2d');
      drawFish(
        fishDatum.fish,
        results,
        fishCtx,
        FISH_CANVAS_WIDTH / 2,
        FISH_CANVAS_HEIGHT / 2
      );
      ctx.drawImage(fishDatum.canvas, fishXPos, fishYPos);
    });
  } else {
    ctx.drawImage(fishDatum.canvas, fishXPos, fishYPos);
  }
}

function drawTrainingFish(state) {
  const canvas = state.canvas;
  const ctx = canvas.getContext('2d');

  // Draw frame behind fish
  ctx.fillStyle = '#FFFFFF';
  const frameSize = 300;
  const frameXPos = canvas.width / 2 - frameSize / 2;
  const frameYPos = canvas.height / 2 - frameSize / 2;
  const fishXPos = frameXPos + (frameSize - FISH_CANVAS_WIDTH) / 2;
  const fishYPos = frameYPos + (frameSize - FISH_CANVAS_HEIGHT) / 2;
  ctx.fillRect(frameXPos, frameYPos, frameSize, frameSize);

  const fishDatum = state.fishData[state.trainingIndex];
  drawSingleFish(fishDatum, fishXPos, fishYPos, ctx);
}

function drawUpcomingFish(state) {
  const fishLeft = state.fishData.length - state.trainingIndex - 1;
  const numUpcomingFish = fishLeft >= 3 ? 3 : fishLeft;
  const canvas = state.canvas;
  const ctx = canvas.getContext('2d');
  let x = canvas.width / 2 - 300 - FISH_CANVAS_WIDTH / 2;
  const y = canvas.height / 2 - FISH_CANVAS_HEIGHT / 2;

  for (let i = 1; i <= numUpcomingFish; i++) {
    const fishDatum = state.fishData[state.trainingIndex + i];
    drawSingleFish(fishDatum, x, y, ctx);
    x -= 200;
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
  drawSingleFish(fishDatum, canvas.width / 2 - FISH_CANVAS_WIDTH / 2, canvas.height / 2 - FISH_CANVAS_HEIGHT / 2, ctx);
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

function drawPondScreen(state) {
  console.log('pond!');
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
  ctx.translate(FISH_CANVAS_WIDTH, 0);
  ctx.scale(-1, 1);
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
    case FishBodyPart.PECTORAL_FIN_FRONT:
      return body.pectoralFinFrontAnchor;
    case FishBodyPart.PECTORAL_FIN_BACK:
      return body.pectoralFinBackAnchor;
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
    case FishBodyPart.PECTORAL_FIN_FRONT:
    case FishBodyPart.PECTORAL_FIN_BACK:
    case FishBodyPart.TAIL:
      return palette.finRgb;
    case FishBodyPart.BODY:
      return palette.bodyRgb;
    default:
      return null;
  }
}
