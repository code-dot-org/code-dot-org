/**
 * Quality test: verifies that SVMTrainer achieves at least 90% accuracy on a
 * linearly-separable 2-D dataset.
 *
 * KNNTrainer quality is exercised indirectly via the unit tests in
 * KNNTrainer.test.js; a separate accuracy test for KNN is omitted here
 * because TFJS's CPU backend in jsdom is unreliable for small datasets.
 */
import {describe, it, expect, beforeEach} from 'vitest';

import {ClassType} from '../../src/oceans/constants';
import SVMTrainer from '../../src/utils/SVMTrainer';

/** Generates `n` 2-D points drawn from a Gaussian centred at `centre`. */
function gaussianPoints(n, centre, spread = 0.2) {
  return Array.from({length: n}, () => [
    centre[0] + (Math.random() - 0.5) * spread,
    centre[1] + (Math.random() - 0.5) * spread,
  ]);
}

/** Evaluates classification accuracy of a trainer on a test set. */
async function accuracy(trainer, testPoints, expectedClass) {
  let correct = 0;
  for (const point of testPoints) {
    const {predictedClassId} = await trainer.predict(point);
    if (predictedClassId === expectedClass) {
      correct++;
    }
  }
  return correct / testPoints.length;
}

const LIKE_CENTRE = [0.2, 0.2];
const DISLIKE_CENTRE = [0.8, 0.8];
const TRAIN_SIZE = 30;
const TEST_SIZE = 20;
const ACCURACY_THRESHOLD = 0.9;

describe('SVMTrainer quality', () => {
  let trainer;

  beforeEach(() => {
    trainer = new SVMTrainer(x => x);
    gaussianPoints(TRAIN_SIZE, LIKE_CENTRE).forEach(p =>
      trainer.addTrainingExample(p, ClassType.Like),
    );
    gaussianPoints(TRAIN_SIZE, DISLIKE_CENTRE).forEach(p =>
      trainer.addTrainingExample(p, ClassType.Dislike),
    );
    trainer.train();
  });

  it('achieves >=90% accuracy on Like points', async () => {
    const likeAcc = await accuracy(
      trainer,
      gaussianPoints(TEST_SIZE, LIKE_CENTRE),
      ClassType.Like,
    );
    expect(likeAcc).toBeGreaterThanOrEqual(ACCURACY_THRESHOLD);
  });

  it('achieves >=90% accuracy on Dislike points', async () => {
    const dislikeAcc = await accuracy(
      trainer,
      gaussianPoints(TEST_SIZE, DISLIKE_CENTRE),
      ClassType.Dislike,
    );
    expect(dislikeAcc).toBeGreaterThanOrEqual(ACCURACY_THRESHOLD);
  });
});
