import $ from 'jquery';
import _ from 'lodash';
import fish, {FishBodyPart} from '../utils/fishData';
import {generateRandomFish} from '../activities/hoc2019/SpritesheetFish';

const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 576;

let canvas,
  fishes = [];

function updatePos(fish) {
  for (var i = 0; i <= 1; i++) {
    if (fish.currentPos[i] > fish.defaultPos[i] + 5) {
      fish.posChange[i] = -1;
    }
    if (fish.currentPos[i] < fish.defaultPos[i] - 5) {
      fish.posChange[i] = 1;
    }
    fish.currentPos[i] += fish.posChange[i];
  }
}

function getRandomFish(currentPos, defaultPos) {
  return {
    fish: generateRandomFish(),
    defaultPos: defaultPos,
    currentPos: currentPos,
    canvas: null,
    posChange: [0, 1]
  };
}

$(document).ready(() => {
  canvas = document.getElementById('activity-canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  for (var i = 0; i < 3; ++i) {
    const x = Math.floor(Math.random() * CANVAS_WIDTH);
    const y = Math.floor(Math.random() * CANVAS_HEIGHT);
    fishes.push(getRandomFish([x, y], [x, y]));
  }
  const palette = fish.colorPalettes.palette1;

  fishes.forEach(fish => {
    //fish.canvas = document.createElement('canvas');
    fish.canvas = new OffscreenCanvas(200, 200);
    loadImages(fish.fish).then(results =>
      drawFish(fish.fish, results, palette, fish.canvas.getContext('2d'))
    );
  });
  function animateScreen() {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = 'destination-over';

    fishes.forEach(fish => {
      updatePos(fish);
      loadFish(
        fish.canvas,
        fish.currentPos[0],
        fish.currentPos[1],
        palette,
        ctx
      );
    });
  }

  window.setInterval(animateScreen, 50);
});

function loadImages(fish) {
  return Promise.all(fish.parts.map(bodyPart => loadFishImage(bodyPart)));
}

function drawFish(fish, results, palette, ctx) {
  const body = results.find(
    result => result.fishPart.type === FishBodyPart.BODY
  ).fishPart;
  const bodyAnchor = bodyAnchorFromType(body, body.type);
  results = _.orderBy(results, ['fishPart.type']);

  results.forEach(result => {
    let intermediateCanvas = document.createElement('canvas');
    let intermediateCtx = intermediateCanvas.getContext('2d');

    let anchor = [0, 0];
    if (result.fishPart.type !== FishBodyPart.BODY) {
      anchor = bodyAnchorFromType(body, result.fishPart.type);
    }

    const xPos = bodyAnchor[0] + anchor[0];
    const yPos = bodyAnchor[1] + anchor[1];

    intermediateCtx.drawImage(result.img, xPos, yPos);
    const rgb = colorFromType(palette, result.fishPart.type);

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

    ctx.drawImage(intermediateCanvas, 0, 0);
  });
}

function loadFish(fishCanvas, x, y, palette, ctx) {
  //const promises = fish.parts.map(bodyPart => loadFishImage(bodyPart));
  ctx.drawImage(fishCanvas, x, y);
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
