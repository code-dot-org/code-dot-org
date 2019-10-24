import 'babel-polyfill';
import {initRenderer} from '../renderer';
import {setState} from '../state';
import {Modes} from '../constants';
import {init as initScene} from '../init';

export const init = async () => {
  await initRenderer();
  setState({currentMode: Modes.ActivityIntro});
  initScene();
};
