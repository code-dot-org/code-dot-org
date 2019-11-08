import 'idempotent-babel-polyfill';
import {initRenderer} from '../renderer';
import {getState, setState} from '../state';
import {AppMode, Modes} from '../constants';
import {initFishData} from '../../utils/fishData';
import {getAppMode} from '../helpers';
import {toMode} from '../toMode';
import SimpleTrainer from '../../utils/SimpleTrainer';

export const init = async () => {
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

  // TODO: refactor into a model init method
  if (appModeBase === AppMode.CreaturesVTrashDemo) {
    const trainer = new SimpleTrainer();
    trainer.initializeClassifiersWithoutMobilenet();
    setState({trainer, word: 'fish'});
  }

  setState({loadTrashImages, loadCreatureImages});

  initFishData();
  await initRenderer();

  let mode;
  if (appModeBase === AppMode.Instructions) {
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
  toMode(mode);
};
