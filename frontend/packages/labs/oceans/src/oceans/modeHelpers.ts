import {init as initModel} from './models';
import {setState} from './state';

/**
 * Transitions the lab to a new UI mode, reinitialising the model layer.
 *
 * @param mode - The `Modes` integer value to switch to.
 */
const toMode = (mode: number): void => {
  const state = setState({currentMode: mode});
  initModel(state);
};

export default {
  toMode,
};
