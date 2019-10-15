import 'babel-polyfill';
import _ from 'lodash';
import constants, {Modes} from './constants';
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
    default:
      console.error('not yet implemented');
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
  ctx.drawImage(img, 0, 0, constants.canvasWidth, constants.canvasHeight);
}

function drawTrainingScreen(state) {
  if (state.backgroundImg) {
    renderBackgroundImage(state.ctx, state.backgroundImg);
    drawTrainingFish(state);
    drawUpcomingFish(state);
    drawTrainingUiElements(state);
  } else {
    loadBackgroundImage().then(backgroundImg => {
      state = {...state, backgroundImg};
      setState(state);
      drawTrainingScreen(state);
    });
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
  const container = document.getElementById('ui-container');
  const classifyFish = function(doesLike) {
    // TODO: (maddie) classify fish with trainer
    state.trainingIndex += 1;
    setState({trainingIndex: state.trainingIndex});
    drawTrainingScreen(state);
  };

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
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
        const canvas = state.canvas;
        setState({currentMode: Modes.Predicting});
        init(canvas);
      }
    }
  ];

  buttons.forEach(button => {
    let btnEl = document.createElement('button');
    btnEl.innerHTML = button.text;
    btnEl.setAttribute('id', button.id);
    btnEl.addEventListener('click', button.onClick);
    container.appendChild(btnEl);
  });
}

function drawPredictingScreen(state) {
  console.log(state);
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
