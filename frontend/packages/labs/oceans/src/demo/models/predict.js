import 'babel-polyfill';
import {setState, getState} from '../state';
import {Modes} from '../constants';
import {createButton, createText, strForClassType, toMode} from '../helpers';
import {generateOcean} from '../../utils/generateOcean';

const staticUiElements = [
  createButton({
    id: 'predict-button',
    text: 'predict',
    onClick: () => onClickPredict()
  })
];
const headerElements = [createText({id: 'header', text: 'A.I. Sorting'})];
const footerElements = [
  createButton({
    text: 'Training',
    onClick: () => toMode(Modes.Training),
    className: ''
  }),
  createButton({
    text: 'Continue',
    onClick: () => toMode(Modes.Pond),
    className: ''
  })
];

export const init = () => {
  asyncSetUiElements(getState());
  setState({headerElements, footerElements});
};

const asyncSetUiElements = async state => {
  const text = await predictFish(state);
  const uiElements = [
    ...staticUiElements,
    createText({id: 'predict-text', text})
  ];
  const fishData = generateOcean(1000);
  setState({uiElements, fishData});
};

const predictFish = state => {
  return new Promise(resolve => {
    const fish = state.fishData[state.trainingIndex];
    state.trainer.predictFromData(fish.knnData).then(prediction => {
      const classId = prediction.predictedClassId;
      const text = `prediction: ${strForClassType(classId)} @ ${
        prediction.confidencesByClassId[classId]
      }`;
      fish.result = prediction;

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
