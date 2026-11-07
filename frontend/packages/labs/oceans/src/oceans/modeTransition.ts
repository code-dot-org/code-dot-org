import type {State} from './state';
import {setState} from './state';

/**
 * Registered once at startup by modeHelpers.ts so that toMode can call
 * models/index.init without creating a static import cycle.
 */
let _initModel: ((state: State) => void) | null = null;

/**
 * Registers the model-init dispatcher. Called by modeHelpers.ts at module
 * load time so that loading.js can use toMode without importing modeHelpers.
 *
 * @param fn - Function that dispatches models/index.init for a given state.
 */
export const setModelInitCallback = (fn: (state: State) => void): void => {
  _initModel = fn;
};

/**
 * Transitions the lab to a new UI mode by updating state and invoking the
 * registered model-init callback.
 *
 * @param mode - The `Modes` integer value to switch to.
 */
export const toMode = (mode: number): void => {
  // Reset animation flags in the same update as the mode change so there is
  // never a rendered frame where `currentMode` already matches the new
  // scene (and its guide/arrow can appear) while `isRunning`/`isPaused` are
  // still left over from the previous scene and suppress that scene's own
  // "move forward" button (e.g. Predict's Run button) until the new mode's
  // async init resolves.
  const state = setState({
    currentMode: mode,
    isRunning: false,
    isPaused: false,
  });
  if (_initModel) {
    _initModel(state);
  }
};
