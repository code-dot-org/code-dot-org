import 'babel-polyfill';
import {setState, getState} from '../state';
import {init as initScene} from '../init';
import {Modes} from '../constants';
import {createButton} from '../helpers';
import {drawPondFish, drawUiElements, clearCanvas} from '../renderer';

const uiElements = [
  createButton({
    id: 'start-over-button',
    text: 'start over',
    onClick: () => onClickStartOver()
  })
];

export const init = () => {
  const state = getState();
  drawScene(state);
};

const drawScene = state => {
  // Clear main canvas before drawing.
  clearCanvas(state.canvas);
  drawPondFish(state);
  drawUiElements(state.uiContainer, uiElements);
};

const onClickStartOver = () => {
  const state = setState({currentMode: Modes.Training});
  state.trainer.clearAll();
  clearCanvas(state.canvas);
  initScene();
};
