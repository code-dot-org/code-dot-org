import $ from 'jquery';
import constants, {Modes} from './constants';
import {init as initRenderer} from './renderer';
import {init as initTraining} from './modes/training';
import {init as initPredicting} from './modes/predicting';
import {init as initPond} from './modes/pond';
import {setState, getState} from './state';
import {generateRandomFish} from '../activities/hoc2019/SpritesheetFish';

$(document).ready(() => {
  // Generate some fish
  let fishes = [];
  for (let i = 0; i < 100; i++) {
    fishes.push(getRandomFish(i));
  }

  // Set up state
  const initialState = {
    currentMode: Modes.Training,
    fishData: fishes
  };
  setState(initialState);

  // Initialize renderer
  const canvas = document.getElementById('activity-canvas');
  initRenderer(canvas);

  // Initialize current model
  initModel();
});

// Initialize a model based on mode.
// Should only be called when mode changes.
function initModel() {
  switch (getState().currentMode) {
    case Modes.Training:
      initTraining();
      break;
    case Modes.Predicting:
      initPredicting();
      break;
    case Modes.Pond:
      initPond();
      break;
    default:
      console.error('No mode specified');
  }
}

function getRandomFish(id) {
  return {
    id: id,
    fish: generateRandomFish(),
    canvas: null
  };
}
