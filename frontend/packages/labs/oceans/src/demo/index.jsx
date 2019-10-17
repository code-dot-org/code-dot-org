import $ from 'jquery';
import {Modes} from './constants';
import {init as initRenderer} from './renderer';
import {initTraining, initPredicting, initPond} from './models';
import {setState, getState} from './state';
import {generateRandomFish} from '../utils/generateOcean';
import SimpleTrainer from '../utils/SimpleTrainer';

$(document).ready(() => {
  // Generate some fish
  let fishes = [];
  for (let i = 0; i < 100; i++) {
    fishes.push(getRandomFish(i));
  }

  // Set up state
  const trainer = new SimpleTrainer();
  trainer.initializeClassifiersWithoutMobilenet();
  const initialState = {
    currentMode: Modes.Training,
    fishData: fishes,
    trainer
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
    fish: generateRandomFish()
  };
}
