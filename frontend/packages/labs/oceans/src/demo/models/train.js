import 'babel-polyfill';
import {setState, getState} from '../state';
import {init as initScene} from '../init';
import {Modes, ClassType} from '../constants';
import {createButton, createText} from '../helpers';
import SimpleTrainer from '../../utils/SimpleTrainer';
import {generateOcean} from '../../utils/generateOcean';

const staticUiElements = [
  createButton({
    id: 'yes-button',
    text: 'yes',
    onClick: () => onClassifyFish(true)
  }),
  createButton({
    id: 'no-button',
    text: 'no',
    onClick: () => onClassifyFish(false)
  })
];

export const init = () => {
  const fishData = generateOcean(100);
  const trainer = new SimpleTrainer();
  trainer.initializeClassifiersWithoutMobilenet();

  setState({fishData, trainer, uiElements: uiElements(getState())});
};

const uiElements = state => {
  return [
    ...staticUiElements,
    createText({id: 'train-text', text: `Is this fish ${state.word}?`})
  ];
};

const onClassifyFish = doesLike => {
  const state = getState();
  const knnData = state.fishData[state.trainingIndex].knnData;
  const classId = doesLike ? ClassType.Like : ClassType.Dislike;
  state.trainer.addExampleData(knnData, classId);
  state.trainingIndex += 1;
  setState({trainingIndex: state.trainingIndex});
};

const onClickNext = () => {
  setState({currentMode: Modes.Predicting});
  initScene();
};
