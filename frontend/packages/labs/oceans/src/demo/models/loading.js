import 'babel-polyfill';
import {initRenderer} from '../renderer';
import {getState, setState} from '../state';
import {Modes} from '../constants';
import {init as initModel} from './index';
import {initFishData} from '../../utils/fishData';

export const init = async () => {
  initFishData();
  await initRenderer();
  const state = setState({currentMode: Modes.ActivityIntro});
  initModel(state);
};
