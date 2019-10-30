import {FishOceanObject, generateOceanObject} from '../demo/OceanObject';
import {getState} from '../demo/state';
import {fishData} from './fishData';
import {filterFishComponents} from '../demo/helpers';

export const generateOcean = numFish => {
  // Right now, all ocean objects are FishOceanObjects. This will need to be
  // refactored when we add other object types.
  const allowedClasses = [FishOceanObject];
  const allowedComponents = filterFishComponents(fishData, getState().dataSet);

  const ocean = [];
  for (var i = 0; i < numFish; ++i) {
    ocean.push(generateOceanObject(allowedClasses, i, allowedComponents));
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
