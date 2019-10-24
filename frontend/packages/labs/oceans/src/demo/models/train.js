import 'babel-polyfill';
import {setState, getState} from '../state';
import {Modes, ClassType} from '../constants';
import {createButton, createText, toMode} from '../helpers';
import SimpleTrainer from '../../utils/SimpleTrainer';
import {generateOcean} from '../../utils/generateOcean';

const staticUiElements = [
  createButton({
    id: 'yes-button',
    text: 'Yes',
    onClick: () => onClassifyFish(true)
  }),
  createButton({
    id: 'no-button',
    text: 'No',
    onClick: () => onClassifyFish(false)
  })
];
const headerElements = [createText({id: 'header', text: 'A.I. Training'})];
const footerElements = [
  createButton({
    text: 'Select Type',
    onClick: () => onSelectType(),
    className: ''
  }),
  createButton({
    text: 'Continue',
    onClick: () => toMode(Modes.Predicting),
    className: ''
  })
];

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

  setState({
    fishData,
    trainer,
    uiElements: uiElements(state),
    headerElements,
    footerElements,
    isRunning: true
  });
};

const uiElements = state => {
  return [
    ...staticUiElements,
    createText({id: 'train-text', text: `Is this fish ${state.word}?`})
  ];
};

const onClassifyFish = doesLike => {
  const state = getState();

  // No-op if animation is currently in progress.
  if (state.isRunning) {
    return;
  }

  const knnData = state.fishData[state.trainingIndex].knnData;
  const classId = doesLike ? ClassType.Like : ClassType.Dislike;
  state.trainer.addExampleData(knnData, classId);

  let fishData = [...state.fishData];
  if (state.trainingIndex > state.fishData.length - 5) {
    fishData = fishData.concat(generateOcean(100));
  }

  setState({
    trainingIndex: state.trainingIndex + 1,
    fishData,
    isRunning: true
  });
};

const onSelectType = () => {
  const state = setState({
    trainingIndex: 0,
    fishData: []
  });
  if (state.trainer) {
    state.trainer.clearAll();
  }
  toMode(Modes.Words);
};
