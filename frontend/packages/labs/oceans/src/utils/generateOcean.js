import {
  FishOceanObject,
  TrashOceanObject,
  generateOceanObject
} from '../demo/OceanObject';
import {getState} from '../demo/state';

export const generateOcean = (numFish, loadTrashImages) => {
  const state = getState();
  const ocean = [];
  let possibleObjects = [FishOceanObject];
  if (loadTrashImages) {
    possibleObjects.push(TrashOceanObject);
  }

  for (var i = 0; i < numFish; ++i) {
    ocean.push(generateOceanObject(possibleObjects, i, state.dataSet));
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
