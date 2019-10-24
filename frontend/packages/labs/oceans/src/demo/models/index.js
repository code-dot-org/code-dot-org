import {init as initLoading} from './loading';
import {init as initWords} from './words';
import {init as initTrainingIntro} from './trainingIntro';
import {init as initTraining} from './train';
import {init as initPredicting} from './predict';
import {init as initPond} from './pond';
import {Modes} from '../constants';

// Initialize a model based on mode.
// Should only be called when mode changes.
export const init = state => {
  switch (state.currentMode) {
    case Modes.Loading:
      initLoading();
      break;
    case Modes.Words:
      initWords();
      break;
    case Modes.TrainingIntro:
      initTrainingIntro();
      break;
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
      console.error('Unrecognized mode specified.');
  }
};
