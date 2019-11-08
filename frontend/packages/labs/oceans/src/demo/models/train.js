import 'idempotent-babel-polyfill';
import {setState, getState} from '../state';
import {ClassType, AppMode} from '../constants';
import SimpleTrainer from '../../utils/SimpleTrainer';
import SVMTrainer from '../../utils/SVMTrainer';
import {generateOcean} from '../../utils/generateOcean';

export const init = () => {
  const state = getState();

  let trainer = state.trainer;
  if (!trainer) {
    if ([AppMode.FishShort, AppMode.FishLong].includes(state.appMode)) {
      trainer = new SVMTrainer(fish => fish.getKnnData());
    } else {
      trainer = new SimpleTrainer(oceanObj => oceanObj.getTensor());
    }
  }

  if (state.appMode === AppMode.FishVTrash) {
    setState({
      word: 'Fish',
      trainingQuestion: 'Is this a fish?'
    });
  }
  if (state.appMode === AppMode.CreaturesVTrash) {
    setState({
      word: 'Water creature',
      trainingQuestion: 'Does this belong in the water?'
    });
  }

  setState({
    fishData: generateOcean(100),
    trainingIndex: 0,
    trainer,
    isRunning: true
  });
};

export const onClassifyFish = doesLike => {
  const state = getState();

  // No-op if animation is currently in progress.
  if (state.isRunning) {
    return;
  }

  const classId = doesLike ? ClassType.Like : ClassType.Dislike;
  state.trainer.addTrainingExample(
    state.fishData[state.trainingIndex],
    classId
  );

  let fishData = [...state.fishData];
  if (state.trainingIndex > state.fishData.length - 5) {
    fishData = fishData.concat(generateOcean(100));
  }

  if (doesLike) {
    const newValue = getState().yesCount + 1;
    setState({yesCount: newValue});
  } else {
    const newValue = getState().noCount + 1;
    setState({noCount: newValue});
  }

  setState({
    trainingIndex: state.trainingIndex + 1,
    fishData,
    isRunning: true
  });
};
