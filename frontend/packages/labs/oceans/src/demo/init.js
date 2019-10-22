import {init as initModel} from './models';
import {setState} from './state';

export const init = () => {
  // Reset any state that shouldn't persist between modes.
  const state = setState({
    uiElements: [],
    headerElements: [],
    footerElements: []
  });
  initModel(state);
};
