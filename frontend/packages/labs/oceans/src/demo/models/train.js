import 'babel-polyfill';
import {setState, getState} from '../state';
import {init as initScene} from '../init';
import {Modes, ClassType} from '../constants';
import {createButton} from '../helpers';
import SimpleTrainer from '../../utils/SimpleTrainer';
import {generateOcean} from '../../utils/generateOcean';
import {
  drawTrainingFish,
  drawUpcomingFish,
  drawUiElements,
  clearCanvas
} from '../renderer';

const uiElements = [
  createButton({
    id: 'like-button',
    text: 'like',
    onClick: () => onClassifyFish(true)
  }),
  createButton({
    id: 'dislike-button',
    text: 'dislike',
    onClick: () => onClassifyFish(false)
  }),
  createButton({
    id: 'next-button',
    text: 'next',
    onClick: () => onClickNext()
  })
];

export const init = () => {
  const fishData = generateOcean(100);
  const trainer = new SimpleTrainer();
  trainer.initializeClassifiersWithoutMobilenet();

  const state = setState({fishData, trainer});
  drawScene(state);
  drawUiElements(state.uiContainer, uiElements);
};

const drawScene = state => {
  // Clear main canvas before drawing.
  clearCanvas(state.canvas);
  drawTrainingFish(state);
  drawUpcomingFish(state);
};

const onClassifyFish = doesLike => {
  const state = getState();
  const knnData = state.fishData[state.trainingIndex].knnData;
  const classId = doesLike ? ClassType.Like : ClassType.Dislike;
  state.trainer.addExampleData(knnData, classId);
  state.trainingIndex += 1;
  setState({trainingIndex: state.trainingIndex});
  drawScene(state);
};

const onClickNext = () => {
  const state = setState({currentMode: Modes.Predicting});
  clearCanvas(state.canvas);
  initScene();
};
