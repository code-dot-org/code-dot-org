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
  setState({uiElements});
};

const onClickStartOver = () => {
  const state = setState({currentMode: Modes.Training});
  state.trainer.clearAll();
  initScene();
};
