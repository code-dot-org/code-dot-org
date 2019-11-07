import 'idempotent-babel-polyfill';
import {setState, getState} from '../state';
import {ClassType} from '../constants';
import SimpleTrainer from '../../utils/SimpleTrainer';
import {generateOcean} from '../../utils/generateOcean';

export const init = () => {
  const state = getState();

  let trainer = state.trainer;
  if (!trainer) {
    trainer = new SimpleTrainer();
    trainer.initializeClassifiersWithoutMobilenet();
  }

  if (state.appMode === 'fishvtrash') {
    setState({
      word: 'Fish',
      trainingQuestion: 'Is this a fish?'
    });
  }
  if (state.appMode === 'creaturesvtrash') {
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

  const knnData = state.fishData[state.trainingIndex].getTensor();
  const classId = doesLike ? ClassType.Like : ClassType.Dislike;
  state.trainer.addExampleTensor(knnData, classId);

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
