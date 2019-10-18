import {init as initModel} from './models';
import {render} from './renderer';
import {getState} from './state';

export const init = () => {
  const state = getState();
  initModel(state);
  render();
};
