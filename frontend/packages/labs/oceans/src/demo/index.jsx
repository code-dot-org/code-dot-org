import $ from 'jquery';
import constants, {Modes} from './constants';
import {init as initTraining} from './modes/training';
import {init as initPredicting} from './modes/predicting';
import {init as initPond} from './modes/pond';
import {setState} from './state';

$(document).ready(() => {
  let canvas = document.getElementById('activity-canvas');
  canvas.width = constants.canvasWidth;
  canvas.height = constants.canvasHeight;

  const initialState = {
    currentMode: Modes.Pond
  };
  setState(initialState);

  switch (initialState.currentMode) {
    case Modes.Training:
      initTraining(canvas);
      break;
    case Modes.Predicting:
      initPredicting(canvas);
      break;
    case Modes.Pond:
      initPond(canvas);
      break;
    default:
      console.error('No mode specified');
  }
});
