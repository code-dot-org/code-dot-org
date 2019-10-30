import {FishOceanObject, TrashOceanObject, generateOceanObject} from '../demo/OceanObject';

export const generateOcean = (numFish, loadTrashImages) => {
  const ocean = [];
  let possibleObjects = [FishOceanObject];
  if (loadTrashImages) {
    possibleObjects.push(TrashOceanObject);
  }

  for (var i = 0; i < numFish; ++i) {
    ocean.push(generateOceanObject(possibleObjects, i));
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
