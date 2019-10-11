import $ from 'jquery';
import {FishBodyPart} from '../utils/fishData';
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

  const fish1 = generateRandomFish();
  const fish2 = generateRandomFish();
  const fish3 = generateRandomFish();

  loadFish(fish1, 100, 100);
  loadFish(fish2, 300, 100);
  loadFish(fish3, 500, 100);
});

function loadFish(fish, x, y) {
  let fishCanvas = document.createElement('canvas');
  let fishCtx = fishCanvas.getContext('2d');

  const promises = fish.parts.map(bodyPart => loadFishImage(bodyPart));

  Promise.all(promises).then(results => {
    const body = results.find(
      result => result.fishPart.type === FishBodyPart.BODY
    ).fishPart;
    const bodyAnchor = bodyAnchorFromType(body, body.type);

    results.forEach(result => {
      let anchor = [0, 0];
      if (result.fishPart.type !== FishBodyPart.BODY) {
        anchor = bodyAnchorFromType(body, result.fishPart.type);
      }
      fishCtx.drawImage(
        result.img,
        bodyAnchor[0] + anchor[0],
        bodyAnchor[1] + anchor[1]
      );
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
