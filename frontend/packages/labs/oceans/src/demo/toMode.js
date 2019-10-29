import {init as initModel} from './models';
import {setState} from './state';

export const toMode = mode => {
  const state = setState({currentMode: mode});
  initModel(state);
};


