import {Modes} from '../constants';
import {reportPageView} from '../helpers';
import type {State} from '../state';

import {init as initLoading} from './loading';
import {init as initPond} from './pond';
import {init as initPredicting} from './predict';
import train from './train';
import {init as initWords} from './words';

/**
 * Initialize the model for the current mode and report a synthetic page view.
 * Should only be called when the mode changes.
 *
 * @param state - Current lab state, providing currentMode.
 */
export const init = (state: State): void => {
  switch (state.currentMode) {
    case Modes.Loading:
      initLoading();
      break;
    case Modes.Words:
      initWords();
      break;
    case Modes.Training:
      train.init();
      break;
    case Modes.Predicting:
      initPredicting();
      break;
    case Modes.Pond:
      initPond();
      break;
  }

  // Report a synthetic pageview to Google Analytics.
  const modeToPage: Record<number, string> = {
    [Modes.Loading]: 'loading',
    [Modes.Words]: 'words',
    [Modes.Training]: 'training',
    [Modes.Pond]: 'pond',
    [Modes.Instructions]: 'instructions',
  };
  reportPageView(modeToPage[state.currentMode!]);
};
