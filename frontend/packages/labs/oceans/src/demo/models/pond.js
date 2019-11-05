import 'idempotent-babel-polyfill';
import _ from 'lodash';
import {setState, getState} from '../state';
import constants, {ClassType} from '../constants';
import {randomInt} from '../helpers';

export const init = async () => {
  const state = getState();
  let fishWithConfidence = await predictAllFish(state);
  setState({totalPondFish: fishWithConfidence.length});
  fishWithConfidence = _.sortBy(fishWithConfidence, ['confidence']);
  const pondFishWithConfidence = fishWithConfidence.splice(0, 20);
  arrangeFish(pondFishWithConfidence);
  setState({pondFish: pondFishWithConfidence});
};

const predictAllFish = state => {
  return new Promise(resolve => {
    let fishWithConfidence = [];
    state.fishData.map((fish, index) => {
      state.trainer.predictFromTensor(fish.getTensor()).then(res => {
        if (res.predictedClassId === ClassType.Like) {
          fish.setResult(res);
          fishWithConfidence.push(fish);
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
    const x = randomInt(
      0,
      constants.canvasWidth - constants.fishCanvasWidth / 2
    );
    const y = randomInt(
      0,
      constants.canvasHeight - constants.fishCanvasHeight / 2
    );
    fish.setXY({x, y});
  });
};
