const {generateOcean, filterOcean} = require('../../src/utils/generateOcean');
const SimpleTrainer = require('../../src/utils/SimpleTrainer');

describe('Generate ocean test', () => {
  test('Can generate ocean', () => {
    const numFish = 20;
    const ocean = generateOcean(numFish);
    expect(ocean.length).toEqual(numFish);
  });

  test('Can generate predictions on a random set of fish', async () => {
    const numFish = 20;
    const trainingOcean = generateOcean(numFish);
    const trainer = new SimpleTrainer();
    await trainer.initializeClassifiersWithoutMobilenet();
    trainingOcean.forEach(fish => {
      trainer.addExampleData(fish.knnData, Math.round(Math.random()));
    });
    const predictedOcean = await filterOcean(generateOcean(numFish), trainer);
    expect(predictedOcean.length).toEqual(numFish);
  });
});
