import 'idempotent-babel-polyfill';
import {setState, getState} from '../state';
import {ClassType} from '../constants';
import SimpleTrainer from '../../utils/SimpleTrainer';
import {generateOcean} from '../../utils/generateOcean';

export const init = () => {
  const state = getState();

  let fishData = [...state.fishData];
  if (fishData.length === 0) {
    fishData = fishData.concat(generateOcean(100));
  }

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
    fishData,
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
  if (state.appMode === 'long') {
    const exampleData = state.fishData[state.trainingIndex].knnData;
    state.trainer.addTrainingExample(exampleData, classId);
  } else {
    const exampleTensor = state.fishData[state.trainingIndex].getTensor();
    state.trainer.addExampleTensor(exampleTensor, classId);
  }

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
