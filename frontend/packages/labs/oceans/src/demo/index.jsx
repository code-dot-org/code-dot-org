import $ from 'jquery';
import constants, {Modes} from './constants';
import {setState} from './state';
import {init as initScene} from './init';
import {render} from './renderer';

$(document).ready(() => {
  // Set up initial state
  const canvas = document.getElementById('activity-canvas');
  const backgroundCanvas = document.getElementById('background-canvas');
  canvas.width = backgroundCanvas.width = constants.canvasWidth;
  canvas.height = backgroundCanvas.height = constants.canvasHeight;

  setState({
    currentMode: Modes.Loading,
    canvas,
    backgroundCanvas,
    uiContainer: document.getElementById('ui-container')
  });

  initScene();

  render();
});
