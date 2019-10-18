import 'babel-polyfill';
import {setState, getState} from '../state';
import {Modes, ClassType} from '../constants';
import {backgroundPathForMode, createButton} from '../../utils/helpers';
import SimpleTrainer from '../../utils/SimpleTrainer';
import {generateOcean} from '../../utils/generateOcean';
import {
  drawBackground,
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
  createButton({id: 'next-button', text: 'next', onClick: onClickNext})
];

export const init = () => {
  const fishData = generateOcean(100);
  const trainer = new SimpleTrainer();
  trainer.initializeClassifiersWithoutMobilenet();

  let state = setState({fishData, trainer});

  drawBackground(backgroundPathForMode(Modes.Training));
  drawTrainingScreen(state);
  drawUiElements(state.uiContainer, uiElements);
};

const drawTrainingScreen = state => {
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
  drawTrainingScreen(state);
};

const onClickNext = () => {
  setState({currentMode: Modes.Pond});
  // init(canvas);
};
