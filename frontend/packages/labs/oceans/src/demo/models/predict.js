import 'babel-polyfill';
import {setState, getState} from '../state';
import {init as initScene} from '../init';
import {Modes} from '../constants';
import {
  backgroundPathForMode,
  createButton,
  createText,
  strForClassType
} from '../helpers';
import {
  drawBackground,
  drawPredictingFish,
  drawUiElements,
  clearCanvas
} from '../renderer';

const staticUiElements = [
  createButton({
    id: 'predict-button',
    text: 'predict',
    onClick: () => onClickPredict()
  }),
  createButton({
    id: 'next-button',
    text: 'next',
    onClick: () => onClickNext()
  })
];

export const init = () => {
  const state = getState();
  drawScene(state);
};

const drawScene = state => {
  // Clear main canvas before drawing.
  clearCanvas(state.canvas);
  drawPredictingFish(state);
  asyncDrawUiElements(state);
};

const asyncDrawUiElements = async state => {
  const text = await loadPredictionText(state);
  const elements = [
    ...staticUiElements,
    createText({id: 'predict-text', text})
  ];
  drawUiElements(state.uiContainer, elements);
};

const loadPredictionText = state => {
  return new Promise(resolve => {
    const fish = state.fishData[state.trainingIndex];
    state.trainer.predictFromData(fish.knnData).then(prediction => {
      const classId = prediction.predictedClassId;
      const text = `prediction: ${strForClassType(classId)} @ ${
        prediction.confidencesByClassId[classId]
      }`;

      resolve(text);
    });
  });
};

const onClickPredict = () => {
  let state = getState();
  state.trainingIndex += 1;
  setState({trainingIndex: state.trainingIndex});
  drawScene(state);
};

const onClickNext = () => {
  const state = setState({currentMode: Modes.Pond});
  clearCanvas(state.canvas);
  initScene();
};
