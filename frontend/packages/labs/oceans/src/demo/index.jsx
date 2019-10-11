import $ from 'jquery';
import _ from 'lodash';
import fish, {FishBodyPart} from '../utils/fishData';
import {generateRandomFish} from '../activities/hoc2019/SpritesheetFish';

const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 576;

let canvas,
  ctx,
  fishCanvases = [];

$(document).ready(() => {
  canvas = document.getElementById('activity-canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  ctx = canvas.getContext('2d');
  ctx.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fill();

  const palette = fish.colorPalettes.palette1;
  let x = 0,
    y = 0;
  for (let i = 0; i < 1; i++) {
    let fish = generateRandomFish();
    loadFish(fish, x, y, palette);
    x = Math.floor(Math.random() * CANVAS_WIDTH);
    y = Math.floor(Math.random() * CANVAS_HEIGHT);
  }
});

function loadFish(fish, x, y, palette) {
  let fishCanvas = document.createElement('canvas');
  let fishCtx = fishCanvas.getContext('2d');

  const promises = fish.parts.map(bodyPart => loadFishImage(bodyPart));
  Promise.all(promises).then(results => {
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

      fishCtx.drawImage(intermediateCanvas, 0, 0);
    });

    fishCanvases.push(fishCanvas);
    ctx.drawImage(fishCanvas, x, y);
  });
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
