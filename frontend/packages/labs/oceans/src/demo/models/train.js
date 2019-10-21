import 'babel-polyfill';
import {setState, getState} from '../state';
import {init as initScene} from '../init';
import {Modes, ClassType} from '../constants';
import {createButton} from '../helpers';
import SimpleTrainer from '../../utils/SimpleTrainer';
import {generateOcean} from '../../utils/generateOcean';

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

  setState({fishData, trainer, uiElements});
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
