import {init as initModel} from './models';
import {getState} from './state';

export const init = () => {
  const state = getState();
  initModel(state);
};
