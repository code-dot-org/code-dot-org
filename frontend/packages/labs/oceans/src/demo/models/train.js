import $ from 'jquery';
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
    footerElements
  });
};

const uiElements = state => {
  return [
    ...staticUiElements,
    createText({id: 'train-text', text: `Is this fish ${state.word}?`}),
    createText({id: 'train-counter-yes-text', text: ""}),
    createText({id: 'train-counter-no-text', text: ""})
  ];
};

const onClassifyFish = doesLike => {
  const state = getState();
  const knnData = state.fishData[state.trainingIndex].knnData;
  const classId = doesLike ? ClassType.Like : ClassType.Dislike;
  state.trainer.addExampleData(knnData, classId);
  state.trainingIndex += 1;
  setState({trainingIndex: state.trainingIndex});
  if (state.trainingIndex > state.fishData.length - 5) {
    const fishData = state.fishData.concat(generateOcean(100));
    setState({fishData});
  }
  if (doesLike) {
    const newValue = getState().yesCount + 1;
    setState({yesCount: newValue});
    $("#train-counter-yes-text").text(newValue);

  } else {
    const newValue = getState().noCount + 1;
    setState({noCount: newValue});
    $("#train-counter-no-text").text(newValue);
  }
};

const onSelectType = () => {
  const trainer = getState().trainer;
  if (trainer) {
    trainer.clearAll();
  }
  toMode(Modes.Words);
};
