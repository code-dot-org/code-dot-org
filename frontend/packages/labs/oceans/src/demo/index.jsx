import $ from 'jquery';
import constants from './constants';
import {init as initFishRenderer} from './fishRenderer';

let canvas;

$(document).ready(() => {
  canvas = document.getElementById('activity-canvas');
  canvas.width = constants.canvasWidth;
  canvas.height = constants.canvasHeight;

  initFishRenderer(canvas);
});
