import 'idempotent-babel-polyfill';
import {initRenderer} from '../renderer';
import {setState} from '../state';
import {Modes} from '../constants';
import {init as initScene} from '../init';
import {initFishData} from '../../utils/fishData';

export const init = async () => {
  initFishData();
  await initRenderer();
  setState({currentMode: Modes.ActivityIntro});
  initScene();
};
