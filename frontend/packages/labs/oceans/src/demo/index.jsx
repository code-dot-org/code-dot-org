import $ from 'jquery';
import constants, {Modes} from './constants';
import {init as initRenderer} from './renderer';
import {init as initTraining} from './modes/training';
import {init as initPredicting} from './modes/predicting';
import {init as initPond} from './modes/pond';
import {setState, getState} from './state';

$(document).ready(() => {
  let canvas = document.getElementById('activity-canvas');
  canvas.width = constants.canvasWidth;
  canvas.height = constants.canvasHeight;

  const initialState = {
    currentMode: Modes.Training
  };
  setState(initialState);

  initRenderer(canvas);

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

  window.setInterval(() => {
    const currentMode = getState().currentMode;
    if (currentMode === Modes.Training) {
      setState({currentMode: Modes.Predicting});
    } else if (currentMode === Modes.Predicting) {
      setState({currentMode: Modes.Pond});
    } else if (currentMode === Modes.Pond) {
      setState({currentMode: Modes.Training});
    }
  }, 4 * 1000);
});
