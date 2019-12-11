const {
  initFishData,
  fishData,
  fieldInfos,
  MouthExpression,
  BodyShape
} = require('@ml/utils/fishData');
const {generateOcean, filterOcean} = require('@ml/utils/generateOcean');
const SVMTrainer = require('@ml/utils/SVMTrainer');
import {ClassType} from '@ml/oceans/constants';

const floatEquals = (a, b) => {
  return Math.abs(a - b) <= 0.0001;
};

describe('SVMTrainer edge cases test', () => {
  beforeAll(() => {
    initFishData();
  });

  test('test no training data', async () => {
    const trainer = new SVMTrainer(fish => fish.getKnnData());

    trainer.train(); // Should do nothing instead of throwing error

    const testFish = generateOcean(1)[0];
    const result = await trainer.predict(testFish);
    expect(result).toEqual({
      predictedClassId: null,
      confidencesByClassId: {}
    });

    const summary = trainer.summarize(testFish.fieldInfos);
    expect(summary).toBeNull();

    const fishSummary = trainer.explainFish(testFish);
    expect(fishSummary).toBeNull();
  });

  test('test one "Like" training data point', async () => {
    const label = ClassType.Like;
    const trainer = new SVMTrainer(fish => fish.getKnnData());
    const trainingFish = generateOcean(1)[0];
    trainer.addTrainingExample(trainingFish, label);

    trainer.train(); // Should do nothing instead of throwing error

    // We should predict the same label as we originally used
    const testFish = generateOcean(1)[0];
    const result = await trainer.predict(testFish);
    expect(result).toEqual({
      predictedClassId: label,
      confidencesByClassId: {[label]: 1}
    });

    const summary = trainer.summarize(testFish.fieldInfos);
    expect(summary).toBeNull();

    const fishSummary = trainer.explainFish(testFish);
    expect(fishSummary).toBeNull();
  });

  test('test one "Dislike" training data point', async () => {
    const label = ClassType.Dislike;
    const trainer = new SVMTrainer(fish => fish.getKnnData());
    const trainingFish = generateOcean(1)[0];
    trainer.addTrainingExample(trainingFish, label);

    trainer.train(); // Should do nothing instead of throwing error

    // We should predict the same label as we originally used
    const testFish = generateOcean(1)[0];
    const result = await trainer.predict(testFish);
    expect(result).toEqual({
      predictedClassId: label,
      confidencesByClassId: {[label]: 1}
    });
  });

  test('test only "Like" training data points', async () => {
    const label = ClassType.Like;
    const trainer = new SVMTrainer(fish => fish.getKnnData());
    const trainingData = generateOcean(10);
    for (const fish of trainingData) {
      trainer.addTrainingExample(fish, label);
    }

    trainer.train(); // Should do nothing instead of throwing error

    // We should predict the same label as we originally used
    const testFish = generateOcean(100);
    for (const fish of testFish) {
      const result = await trainer.predict(fish);
      expect(result).toEqual({
        predictedClassId: label,
        confidencesByClassId: {[label]: 1}
      });
    }

    const summary = trainer.summarize(testFish[0].fieldInfos);
    expect(summary).toBeNull();

    const fishSummary = trainer.explainFish(testFish[0]);
    expect(fishSummary).toBeNull();
  });

  test('test only "Dislike" training data points', async () => {
    const label = ClassType.Dislike;
    const trainer = new SVMTrainer(fish => fish.getKnnData());
    const trainingData = generateOcean(10);
    for (const fish of trainingData) {
      trainer.addTrainingExample(fish, label);
    }

    trainer.train(); // Should do nothing instead of throwing error

    // We should predict the same label as we originally used
    const testFish = generateOcean(100);
    for (const fish of testFish) {
      const result = await trainer.predict(fish);
      expect(result).toEqual({
        predictedClassId: label,
        confidencesByClassId: {[label]: 1}
      });
    }

    const summary = trainer.summarize(testFish[0].fieldInfos);
    expect(summary).toBeNull();

    const fishSummary = trainer.explainFish(testFish[0]);
    expect(fishSummary).toBeNull();
  });
});
