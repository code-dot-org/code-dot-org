import {FishOceanObject, TrashOceanObject, generateOceanObject} from '../demo/OceanObject';

export const generateOcean = (numFish, generateTrash=true) => {
  const ocean = [];
  let objectsToGenerate = [FishOceanObject];
  if (generateTrash) {
      objectsToGenerate.push(TrashOceanObject);
  }
  for (var i = 0; i < numFish; ++i) {
    ocean.push(generateOceanObject(objectsToGenerate, i));
  }
  return ocean;
};

export const filterOcean = async (ocean, trainer) => {
  const predictionPromises = [];
  ocean.forEach((fish, idx) => {
    if (!fish.getResult()) {
      predictionPromises.push(
        trainer.predictFromTensor(fish.knnData).then(res => {
          fish.setResult(res);
        })
      );
    }
  });
  await Promise.all(predictionPromises);
  return ocean;
};
