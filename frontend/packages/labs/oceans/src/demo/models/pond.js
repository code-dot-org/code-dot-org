import 'babel-polyfill';
import _ from 'lodash';
import {setState, getState} from '../state';
import constants, {Modes, ClassType} from '../constants';
import {
  createButton,
  createText,
  createImage,
  randomInt,
  toMode
} from '../helpers';

export const init = async () => {
  const state = getState();
  let fishWithConfidence = await predictAllFish(state);
  fishWithConfidence = _.sortBy(fishWithConfidence, ['confidence']);
  const pondFish = fishWithConfidence.splice(0, 20);
  arrangeFish(pondFish);
  setState({pondFish});
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
