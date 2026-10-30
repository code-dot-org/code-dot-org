import * as tf from '@tensorflow/tfjs';
import {describe, it, expect, beforeEach} from 'vitest';

import {ClassType} from '../../../src/oceans/constants';
import KNNTrainer from '../../../src/utils/KNNTrainer';

/** Converts a number[] to a 1-D tensor for KNN input. */
const toTensor = x => tf.tensor1d(x);

/** Adds multiple copies of each example to reinforce the KNN dataset. */
function addExamples(trainer, vector, classId, count = 5) {
  for (let i = 0; i < count; i++) {
    trainer.addTrainingExample(vector, classId);
  }
}

describe('KNNTrainer', () => {
  let trainer;

  beforeEach(async () => {
    await tf.setBackend('cpu');
    trainer = new KNNTrainer(toTensor);
  });

  describe('predict — empty dataset', () => {
    it('returns null predictedClassId', async () => {
      const result = await trainer.predict([0, 1]);
      expect(result.predictedClassId).toBeNull();
    });
  });

  describe('addTrainingExample / predict', () => {
    it('classifies a like example after one-sided training', async () => {
      addExamples(trainer, [1, 0, 0, 0], ClassType.Like);
      const result = await trainer.predict([1, 0, 0, 0]);
      expect(result.predictedClassId).toBe(ClassType.Like);
    });

    it('classifies correctly after two-class training', async () => {
      // Use well-separated vectors and multiple examples per class for reliability.
      addExamples(trainer, [1, 0, 0, 0, 0, 0, 0, 0], ClassType.Like, 5);
      addExamples(trainer, [0, 0, 0, 0, 0, 0, 0, 1], ClassType.Dislike, 5);

      const likeResult = await trainer.predict([1, 0, 0, 0, 0, 0, 0, 0]);
      const dislikeResult = await trainer.predict([0, 0, 0, 0, 0, 0, 0, 1]);
      expect(likeResult.predictedClassId).toBe(ClassType.Like);
      expect(dislikeResult.predictedClassId).toBe(ClassType.Dislike);
    });
  });

  describe('getNumClasses / getExampleCount', () => {
    it('starts at 0 classes', () => {
      expect(trainer.getNumClasses()).toBe(0);
    });

    it('reports 1 class after one example', () => {
      trainer.addTrainingExample([1, 0], ClassType.Like);
      expect(trainer.getNumClasses()).toBe(1);
    });

    it('getExampleCount returns correct count for existing class', () => {
      trainer.addTrainingExample([1, 0], ClassType.Like);
      trainer.addTrainingExample([1, 1], ClassType.Like);
      expect(trainer.getExampleCount(ClassType.Like)).toBe(2);
    });

    it('getExampleCount returns 0 or undefined for missing class', () => {
      trainer.addTrainingExample([1, 0], ClassType.Like);
      // The underlying knn library does not track absent classes explicitly.
      const count = trainer.getExampleCount(ClassType.Dislike) ?? 0;
      expect(count).toBe(0);
    });
  });

  describe('clearAll', () => {
    it('resets the dataset', () => {
      trainer.addTrainingExample([1, 0], ClassType.Like);
      trainer.clearAll();
      expect(trainer.getNumClasses()).toBe(0);
    });

    it('returns null predictedClassId after clearAll', async () => {
      trainer.addTrainingExample([1, 0], ClassType.Like);
      trainer.clearAll();
      const result = await trainer.predict([1, 0]);
      expect(result.predictedClassId).toBeNull();
    });
  });

  describe('getDatasetJSON / loadDatasetJSON', () => {
    it('round-trips the dataset', async () => {
      trainer.addTrainingExample([1, 0], ClassType.Like);
      trainer.addTrainingExample([0, 1], ClassType.Dislike);

      const json = trainer.getDatasetJSON();
      expect(typeof json).toBe('string');

      const restored = new KNNTrainer(toTensor);
      restored.loadDatasetJSON(json);
      expect(restored.getNumClasses()).toBe(2);
      expect(restored.getExampleCount(ClassType.Like)).toBe(1);
    });
  });

  describe('setTopK', () => {
    it('does not throw when set before training', () => {
      expect(() => trainer.setTopK(3)).not.toThrow();
    });
  });
});
