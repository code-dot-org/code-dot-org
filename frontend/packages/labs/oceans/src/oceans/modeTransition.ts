import {setState} from './state';

/**
 * Registered once at startup by modeHelpers.ts so that toMode can call
 * models/index.init without creating a static import cycle.
 */
let _initModel: ((state: unknown) => void) | null = null;

/**
 * Registers the model-init dispatcher. Called by modeHelpers.ts at module
 * load time so that loading.js can use toMode without importing modeHelpers.
 *
 * @param fn - Function that dispatches models/index.init for a given state.
 */
export const setModelInitCallback = (fn: (state: unknown) => void): void => {
  _initModel = fn;
};

/**
 * Transitions the lab to a new UI mode by updating state and invoking the
 * registered model-init callback.
 *
 * @param mode - The `Modes` integer value to switch to.
 */
export const toMode = (mode: number): void => {
  const state = setState({currentMode: mode});
  if (_initModel) {
    _initModel(state);
  }
};
