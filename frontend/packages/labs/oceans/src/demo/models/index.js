import {init as initLoading} from './loading';
import {init as initWords} from './words';
import {init as initTraining} from './train';
import {init as initPredicting} from './predict';
import {init as initPond} from './pond';
import {Modes} from '../constants';
import {reportPageView} from '../helpers';

// Initialize a model (if that model has an `init` method) based on mode.
// Should only be called when mode changes.
export const init = state => {
  switch (state.currentMode) {
    case Modes.Loading:
      initLoading();
      break;
    case Modes.Words:
      initWords();
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
  }

  // Report a synthetic pageview to Google Analytics.
  const modeToPage = {
    [Modes.Loading]: 'loading',
    [Modes.Words]: 'words',
    [Modes.Training]: 'training',
    [Modes.Pond]: 'pond',
    [Modes.Instructions]: 'instructions'
  };
  const page = modeToPage[state.currentMode];
  if (window.ga && page) {
    reportPageView(page);
  }
};
