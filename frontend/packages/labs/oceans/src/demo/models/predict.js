import 'babel-polyfill';
import {setState, getState} from '../state';
import {init as initScene} from '../init';
import {Modes} from '../constants';
import {createButton, createText, strForClassType} from '../helpers';

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
  asyncSetUiElements(getState());
};

const asyncSetUiElements = async state => {
  const text = await predictFish(state);
  const uiElements = [
    ...staticUiElements,
    createText({id: 'predict-text', text})
  ];
  setState({uiElements});
};

const predictFish = state => {
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
  state = setState({trainingIndex: state.trainingIndex});
  asyncSetUiElements(state);
};

const onClickNext = () => {
  setState({currentMode: Modes.Pond});
  initScene();
};
