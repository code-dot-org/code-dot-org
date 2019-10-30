import {FishOceanObject, generateOceanObject} from '../demo/OceanObject';
import {getState} from '../demo/state';

export const generateOcean = numFish => {
  const state = getState();
  const ocean = [];
  for (var i = 0; i < numFish; ++i) {
    ocean.push(generateOceanObject([FishOceanObject], i, state.dataSet));
  }
  return ocean;
};

export const filterOcean = async (ocean, trainer) => {
  const predictionPromises = [];
  ocean.forEach((fish, idx) => {
    if (!fish.getResult()) {
      predictionPromises.push(
        trainer.predictFromData(fish.knnData).then(res => {
          fish.setResult(res);
        })
      );
    }
  });
  await Promise.all(predictionPromises);
  return ocean;
};
