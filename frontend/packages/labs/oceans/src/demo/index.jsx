import $ from 'jquery';
import constants, {Modes} from './constants';
import {initModel} from './models';
import {setState} from './state';

$(document).ready(() => {
  // Set up initial state
  const canvas = document.getElementById('activity-canvas');
  const backgroundCanvas = document.getElementById('background-canvas');
  canvas.width = backgroundCanvas.width = constants.canvasWidth;
  canvas.height = backgroundCanvas.height = constants.canvasHeight;

  const state = setState({
    currentMode: Modes.Words,
    canvas,
    backgroundCanvas,
    uiContainer: document.getElementById('ui-container')
  });

  // Initialize current model
  initModel(state);
});
