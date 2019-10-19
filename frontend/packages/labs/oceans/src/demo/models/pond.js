import 'babel-polyfill';
import {setState, getState} from '../state';
import {initModel} from './index';
import {Modes} from '../constants';
import {backgroundPathForMode, createButton} from '../helpers';
import {
  drawBackground,
  drawPondFish,
  drawUiElements,
  clearCanvas
} from '../renderer';

const uiElements = [
  createButton({
    id: 'start-over-button',
    text: 'start over',
    onClick: () => onClickStartOver()
  })
];

export const init = () => {
  const state = getState();

  drawBackground(backgroundPathForMode(state.currentMode));
  drawScene(state);
};

const drawScene = state => {
  // Clear main canvas before drawing.
  clearCanvas(state.canvas);
  drawPondFish(state);
  drawUiElements(state.uiContainer, uiElements);
};

const onClickStartOver = () => {
  const state = setState({currentMode: Modes.Words});
  state.trainer.clearAll();
  clearCanvas(state.canvas);
  initModel(state);
};
