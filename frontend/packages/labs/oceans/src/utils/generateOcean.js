import {fishData} from './fishData';
import {FishOceanObject, TrashOceanObject, generateOceanObject} from '../demo/OceanObject';

export const generateOcean = numFish => {
  const ocean = [];
  for (var i = 0; i < numFish; ++i) {
    ocean.push(generateOceanObject([FishOceanObject, TrashOceanObject], i));
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
