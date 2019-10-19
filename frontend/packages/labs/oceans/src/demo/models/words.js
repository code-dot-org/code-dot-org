import $ from 'jquery';
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

const createDropdowns = () => {
  const listData = [
    { type: "color", title: "Color", options: ["blue", "green", "red", "yellow"] },
    { type: "shape", title: "Shape", options: ["narrow", "round", "sharp", "square", "wide", "spiky"] },
    { type: "type", title: "Type", options: ["bizarre", "fast", "scary", "funny", "glitchy"] },
    { type: "personality", title: "Personality", options: ["angry", "brave", "fierce", "friendly", "fun", "shy", "smart", "wild"] }
  ];

  let results = [];
  for (var i = 0; i < 4; i++) {
    const listItem = listData[i];
    var selectList = document.createElement("select");
    $(selectList).append(`<option selected disabled>${listItem.title}</option>`);
    for (var j = 0; j < listItem.options.length; j++) {
      const option = listItem.options[j];
      $(selectList).append(`<option value="${option}">${option}</option>`);
    }
    selectList.setAttribute('id', `select-${listItem.type}`);
    selectList.setAttribute('class', 'ui-centered-select');
    results.push(selectList);
  }
  return results;
};

const uiElements = [
  createButton({
    id: 'start-over-button',
    text: 'choose word',
    onClick: () => onClickChooseWord()
  }),
  ...createDropdowns()
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

const onClickChooseWord = () => {
  const state = setState({currentMode: Modes.Training});
  clearCanvas(state.canvas);
  initModel(state);
};


