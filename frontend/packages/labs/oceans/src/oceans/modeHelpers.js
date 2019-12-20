import {init as initModel} from './models';
import {setState} from './state';

const toMode = mode => {
  const state = setState({currentMode: mode});
  initModel(state);
};

export default {
  toMode
};
