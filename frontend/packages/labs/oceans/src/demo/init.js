import {init as initModel} from './models';
import {init as initRenderer} from './renderer';
import {getState} from './state';

export const init = () => {
  const state = getState();
  initModel(state);
  initRenderer(state);
};
