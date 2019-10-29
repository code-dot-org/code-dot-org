import 'babel-polyfill';
import _ from 'lodash';
import {setState, getState} from '../state';
import constants, {ClassType} from '../constants';
import {randomInt} from '../helpers';

export const init = async () => {
  const state = getState();
  let fishWithConfidence = await predictAllFish(state);
  fishWithConfidence = _.sortBy(fishWithConfidence, ['confidence']);
  const pondFishWithConfidence = fishWithConfidence.splice(0, 20);
  arrangeFish(pondFishWithConfidence);
  const pondFish = [];
  pondFishWithConfidence.map(fishWithConfidence => {
    pondFish.push(fishWithConfidence.fish);
  });
  setState({pondFish});
};

const predictAllFish = state => {
  return new Promise(resolve => {
    let fishWithConfidence = [];
    state.fishData.map((fish, index) => {
      state.trainer.predictFromData(fish.getKnnData()).then(res => {
        if (res.predictedClassId === ClassType.Like) {
          let data = {
            fish,
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

const arrangeFish = fishesWithConfidence => {
  fishesWithConfidence.forEach(fishesWithConfidence => {
    const x = randomInt(
      0,
      constants.canvasWidth - constants.fishCanvasWidth / 2
    );
    const y = randomInt(
      0,
      constants.canvasHeight - constants.fishCanvasHeight / 2
    );
    fishesWithConfidence.fish.setXY({x, y});
  });
};
