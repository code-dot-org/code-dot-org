import 'idempotent-babel-polyfill';
import {initRenderer} from '../renderer';
import {getState, setState} from '../state';
import {Modes} from '../constants';
import {init as initModel} from './index';
import {initFishData} from '../../utils/fishData';
import {getAppMode} from '../helpers';

export const init = async () => {
  initFishData();
  await initRenderer();

  const [appModeBase,] = getAppMode(getState());
  const currentMode =
    appModeBase === 'instructions' ? Modes.Instructions : Modes.ActivityIntro;

  const state = setState({currentMode: currentMode});
  initModel(state);
};
