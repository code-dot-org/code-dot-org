import 'babel-polyfill';
import _ from 'lodash';
import {setState, getState} from '../state';
import constants, {Modes, ClassType} from '../constants';
import {createButton, createText, randomInt, toMode} from '../helpers';

const headerElements = [createText({id: 'header', text: 'A.I. Results'})];
const footerElements = [
  createButton({
    text: 'Training',
    onClick: () => toMode(Modes.Training),
    className: ''
  }),
  createButton({
    text: 'Start Over',
    onClick: () => onClickStartOver(),
    className: ''
  })
];

export const init = async () => {
  let fishWithConfidence = await predictAllFish(getState());
  fishWithConfidence = _.sortBy(fishWithConfidence, ['confidence']);
  const pondFish = fishWithConfidence.splice(0, 20);
  arrangeFish(pondFish);
  setState({pondFish, headerElements, footerElements});
};

const predictAllFish = state => {
  return new Promise(resolve => {
    let fishWithConfidence = [];
    state.fishData.map((fish, index) => {
      state.trainer.predictFromData(fish.knnData).then(res => {
        if (res.predictedClassId === ClassType.Like) {
          let data = {
            ...fish,
            confidence: res.confidencesByClassId[res.predictedClassId]
          };
          fishWithConfidence.push(data);
        }

        if (index === state.fishData.length - 1) {
          resolve(fishWithConfidence);
        }
      });
    });
  });
};

const arrangeFish = fishes => {
  fishes.forEach(fish => {
    fish.x = randomInt(
      0,
      constants.canvasWidth - constants.fishCanvasWidth / 2
    );
    fish.y = randomInt(
      0,
      constants.canvasHeight - constants.fishCanvasHeight / 2
    );
  });
};

const onClickStartOver = () => {
  const state = setState({
    iterationCount: getState().iterationCount + 1
  });
  state.trainer.clearAll();
  toMode(Modes.Words);
};
