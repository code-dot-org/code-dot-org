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
      state.trainer.predict(fish).then(res => {
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
    // Pick a random side of the bot UI.
    const side = randomInt(0, 1);

    // Generate a location for the fish on that side.
    const xBounds = [
      {minX: 0, maxX: 360 - constants.fishCanvasWidth / 2},
      {minX: 510, maxX: constants.canvasWidth - constants.fishCanvasWidth}
    ];
    const x = randomInt(xBounds[side].minX, xBounds[side].maxX);

    // Don't put fish at the very bottom of the pond because of UI.
    const bottomAreaHeight = 80;
    const y = randomInt(
      0,
      constants.canvasHeight - constants.fishCanvasHeight / 2 - bottomAreaHeight
    );
    fish.setXY({x, y});
  });
};
