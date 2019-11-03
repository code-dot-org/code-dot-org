import 'idempotent-babel-polyfill';
import {initRenderer} from '../renderer';
import {getState} from '../state';
import {Modes} from '../constants';
import {initFishData} from '../../utils/fishData';
import {getAppMode} from '../helpers';
import {toMode} from '../toMode';

export const init = async () => {
  initFishData();
  await initRenderer();

  const [appModeBase] = getAppMode(getState());
  const mode =
    appModeBase === 'instructions' ? Modes.Instructions : Modes.ActivityIntro;
  toMode(mode);
};
