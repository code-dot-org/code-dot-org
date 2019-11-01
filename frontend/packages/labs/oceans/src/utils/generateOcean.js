import {
  FishOceanObject,
  TrashOceanObject,
  generateRandomOceanObject
} from '../demo/OceanObject';
import {getState} from '../demo/state';
import {fishData} from './fishData';
import {filterFishComponents} from '../demo/helpers';

export const generateOcean = (numFish, loadTrashImages) => {
  let possibleObjects = [FishOceanObject];
  const possibleFishComponents = filterFishComponents(
    fishData,
    getState().dataSet
  );
  if (loadTrashImages) {
    possibleObjects.push(TrashOceanObject);
  }

  const ocean = [];
  for (var i = 0; i < numFish; ++i) {
    ocean.push(
      generateRandomOceanObject(possibleObjects, i, possibleFishComponents)
    );
  }
  return ocean;
};

export const filterOcean = async (ocean, trainer) => {
  const predictionPromises = [];
  ocean.forEach((fish, idx) => {
    if (!fish.getResult()) {
      predictionPromises.push(
        trainer.predictFromTensor(fish.getTensor()).then(res => {
          fish.setResult(res);
        })
      );
    }
  });
  await Promise.all(predictionPromises);
  return ocean;
};
