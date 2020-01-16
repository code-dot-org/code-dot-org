import 'idempotent-babel-polyfill';
import {initRenderer} from '../renderer';
import {getState, setState} from '../state';
import {AppMode, Modes} from '../constants';
import {initFishData} from '../../utils/fishData';
import {getAppMode, $time, finishLoading} from '../helpers';
import modeHelpers from '../modeHelpers';
import KNNTrainer from '../../utils/KNNTrainer';

export const init = async () => {
  const startTime = $time();

  const [appModeBase] = getAppMode(getState());

  const loadTrashImages = [
    AppMode.FishVTrash,
    AppMode.CreaturesVTrash,
    AppMode.CreaturesVTrashDemo
  ].includes(appModeBase);
  const loadCreatureImages = [
    AppMode.CreaturesVTrash,
    AppMode.CreaturesVTrashDemo
  ].includes(appModeBase);

  if (appModeBase === AppMode.CreaturesVTrashDemo) {
    const trainer = new KNNTrainer(oceanObj => oceanObj.getTensor());
    setState({trainer, word: 'fish'});
  }

  setState({loadTrashImages, loadCreatureImages});

  initFishData();
  await initRenderer();

  let mode;
  if (appModeBase === 'instructions') {
    mode = Modes.Instructions;
  } else if (
    [AppMode.FishVTrash, AppMode.CreaturesVTrash].includes(appModeBase)
  ) {
    mode = Modes.Training;
  } else if (appModeBase === AppMode.CreaturesVTrashDemo) {
    mode = Modes.Predicting;
  } else {
    mode = Modes.Words;
  }

  finishLoading(startTime, () => modeHelpers.toMode(mode));
};
