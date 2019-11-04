import 'idempotent-babel-polyfill';
import {initRenderer} from '../renderer';
import {getState, setState} from '../state';
import {Modes, DataSet} from '../constants';
import {initFishData} from '../../utils/fishData';
import {getAppMode} from '../helpers';
import {toMode} from '../toMode';

export const init = async () => {
  const [appModeBase] = getAppMode(getState());

  const dataSet = appModeBase === "short" ? DataSet.Small : DataSet.Large;
  const loadTrashImages = appModeBase === "fishvtrash";
  setState({dataSet, loadTrashImages});

  initFishData();
  await initRenderer();

  let mode;
  if (appModeBase === 'instructions') {
    mode = Modes.Instructions;
  } else if (appModeBase === 'fishvtrash') {
    mode = Modes.Training;
  } else {
    mode = Modes.Words;
  }
  toMode(mode);
};
