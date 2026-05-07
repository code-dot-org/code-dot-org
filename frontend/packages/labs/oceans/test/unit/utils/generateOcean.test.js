/**
 *  @jest-environment node
 */

import {initFishData} from '@ml/utils/fishData';
import {generateOcean, filterOcean} from '@ml/utils/generateOcean';
import KNNTrainer from '@ml/utils/KNNTrainer';

describe('Generate ocean test', () => {
  beforeAll(() => {
    initFishData();
  });

  test('Can generate ocean', () => {
    const numFish = 50;
    const ocean = generateOcean(numFish);
    expect(ocean.length).toEqual(numFish);
  });

  test('All fish in ocean have the same knn data length', () => {
    const numFish = 2000;
    const ocean = generateOcean(numFish);
    expect(ocean.length).toEqual(numFish);
    const knnDataLength = ocean[0].getKnnData().length;
    var knnDataSameLength = true;
    ocean.forEach(fish => {
      if (fish.getKnnData().length != knnDataLength) {
        knnDataSameLength = false;
      }
    });
    expect(knnDataSameLength);
  });

  test('Can generate predictions on a random set of fish', async () => {
    const numFish = 25;
    const trainingOcean = generateOcean(numFish);
    const trainer = new KNNTrainer(fish => fish.getTensor());
    trainingOcean.forEach(fish => {
      trainer.addTrainingExample(fish, Math.round(Math.random()));
    });
    const predictedOcean = await filterOcean(generateOcean(numFish), trainer);
    expect(predictedOcean.length).toEqual(numFish);
  });

  test('Eye variations are evenly distributed', async () => {
    const oceanSize = 50;
    const trainingOcean = generateOcean(oceanSize);
    let eyeCounts = {};
    trainingOcean.forEach(fish => {
      if (eyeCounts[fish.eye.index]) {
        eyeCounts[fish.eye.index]++;
      } else {
        eyeCounts[fish.eye.index] = 1;
      }
    });
    Object.keys(eyeCounts).forEach(eye => {
      expect(eyeCounts[eye]).toBeGreaterThanOrEqual(
        Math.floor(oceanSize / Object.keys(eyeCounts).length)
      );
    });
  });
});
