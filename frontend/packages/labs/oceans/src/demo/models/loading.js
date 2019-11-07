import 'idempotent-babel-polyfill';
import {initRenderer} from '../renderer';
import {getState, setState} from '../state';
import {Modes, DataSet} from '../constants';
import {initFishData} from '../../utils/fishData';
import {getAppMode} from '../helpers';
import {toMode} from '../toMode';
import SimpleTrainer from '../../utils/SimpleTrainer';
import SVMTrainer from '../../utils/SVMTrainer';

export const init = async () => {
  const [appModeBase] = getAppMode(getState());

  const dataSet = appModeBase === 'short' ? DataSet.Small : DataSet.Large;
  const loadTrashImages =
    appModeBase === 'fishvtrash' ||
    appModeBase === 'creaturesvtrash' ||
    appModeBase === 'creaturesvtrashdemo';
  const loadCreatureImages =
    appModeBase === 'creaturesvtrash' || appModeBase === 'creaturesvtrashdemo';
  if (appModeBase === 'creaturesvtrashdemo') {
    const trainer = new SimpleTrainer();
    trainer.initializeClassifiersWithoutMobilenet();
    setState({trainer, word: 'fish'});
  }
  if (appModeBase === 'long') {
    console.log('created SVMTrainer');
    setState({trainer: new SVMTrainer()});
  }

  setState({dataSet, loadTrashImages, loadCreatureImages});

  initFishData();
  await initRenderer();

  let mode;
  if (appModeBase === 'instructions') {
    mode = Modes.Instructions;
  } else if (appModeBase === 'fishvtrash' || appModeBase === 'creaturesvtrash') {
    mode = Modes.Training;
  } else if (appModeBase === 'creaturesvtrashdemo') {
    mode = Modes.Predicting;
  } else {
    mode = Modes.Words;
  }
  toMode(mode);
};
