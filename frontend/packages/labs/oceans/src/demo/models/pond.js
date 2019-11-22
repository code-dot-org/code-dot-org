import 'idempotent-babel-polyfill';
import _ from 'lodash';
import {setState, getState} from '../state';
import constants, {ClassType} from '../constants';

export const init = async () => {
  const state = getState();
  let fishWithConfidence = await predictAllFish(state);
  fishWithConfidence = _.sortBy(fishWithConfidence, ['confidence']);
  const fishByClassType = _.groupBy(
    fishWithConfidence,
    fish => fish.getResult().predictedClassId
  );

  let pondFish = fishByClassType[ClassType.Like];
  setState({totalPondFish: pondFish.length});
  pondFish = pondFish.splice(0, constants.maxPondFish);
  const recallFish = fishByClassType[ClassType.Dislike].splice(
    0,
    constants.maxPondFish
  );
  arrangeFish(pondFish);
  setState({pondFish, recallFish});
};

const predictAllFish = state => {
  return new Promise(resolve => {
    let fishWithConfidence = [];
    state.fishData.map((fish, index) => {
      state.trainer.predict(fish).then(res => {
        fish.setResult(res);
        fishWithConfidence.push(fish);

        if (index === state.fishData.length - 1) {
          resolve(fishWithConfidence);
        }
      });
    });
  });
};

const arrangeFish = fishes => {
  let fishPositions = formatArrangement();

  fishes.forEach(fish => {
    const pos = fishPositions.shift();
    const x = pos[0] * 140 - 50;
    const y = pos[1] * 150;

    fish.setXY({x, y});
  });
};

// Describes the 20 possible fish positions on the screen, where the value describes
// that position's priority. 0 will be filled first, then 1, etc.
const arrangement = [
  [2, 1, 0, 0, 0, 1, 2],
  [2, 1, 0, 0, 0, 1, 2],
  [2, 1, 0, null, 0, 1, 2]
];

// Reformats the arrangement constant into a 1-dimensional array of x-y coordinates,
// ordered in priority order (e.g., the spots to fill first appear first in the array).
const formatArrangement = () => {
  let intermediateArr = [];
  arrangement.forEach((row, rowIdx) => {
    row.forEach((col, colIdx) => {
      if (typeof col !== 'number') {
        return;
      }

      if (!intermediateArr[col]) {
        intermediateArr[col] = [];
      }

      intermediateArr[col].push([colIdx, rowIdx]);
    });
  });

  // Flatten nested intermediateArr into a 1-dimensional array of x-y coordinates.
  let formattedArrangement = [];
  intermediateArr.forEach(a => {
    formattedArrangement = formattedArrangement.concat(_.shuffle(a));
  });

  return formattedArrangement;
};
