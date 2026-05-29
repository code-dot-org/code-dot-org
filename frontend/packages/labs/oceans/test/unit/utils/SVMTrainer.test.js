import {describe, it, expect, beforeEach} from 'vitest';

import {ClassType} from '../../../src/oceans/constants';
import SVMTrainer from '../../../src/utils/SVMTrainer';

/** A trivial identity converter: input is already a number[]. */
const identityConverter = x => x;

/** Trains a two-class SVM on two well-separated 1-D points. */
function trainSimple(trainer) {
  trainer.addTrainingExample([0], ClassType.Like);
  trainer.addTrainingExample([1], ClassType.Dislike);
  trainer.train();
}

describe('SVMTrainer', () => {
  let trainer;

  beforeEach(() => {
    trainer = new SVMTrainer(identityConverter);
  });

  describe('predict — no training data', () => {
    it('returns null predictedClassId', async () => {
      const result = await trainer.predict([0]);
      expect(result.predictedClassId).toBeNull();
    });
  });

  describe('predict — single class only', () => {
    it('returns that class with confidence 1', async () => {
      trainer.addTrainingExample([0], ClassType.Like);
      trainer.train();
      const result = await trainer.predict([0]);
      expect(result.predictedClassId).toBe(ClassType.Like);
      expect(result.confidencesByClassId[ClassType.Like]).toBe(1);
    });
  });

  describe('predict — two classes', () => {
    it('classifies like example correctly', async () => {
      trainSimple(trainer);
      const result = await trainer.predict([0]);
      expect(result.predictedClassId).toBe(ClassType.Like);
    });

    it('classifies dislike example correctly', async () => {
      trainSimple(trainer);
      const result = await trainer.predict([1]);
      expect(result.predictedClassId).toBe(ClassType.Dislike);
    });
  });

  describe('clearAll', () => {
    it('resets the model so predict returns null', async () => {
      trainSimple(trainer);
      trainer.clearAll();
      const result = await trainer.predict([0]);
      expect(result.predictedClassId).toBeNull();
    });
  });

  describe('hasNontrivialModel', () => {
    it('is false before training', () => {
      expect(trainer.hasNontrivialModel()).toBe(false);
    });

    it('is false with only one class', () => {
      trainer.addTrainingExample([0], ClassType.Like);
      trainer.train();
      expect(trainer.hasNontrivialModel()).toBe(false);
    });

    it('is true after two-class training', () => {
      trainSimple(trainer);
      expect(trainer.hasNontrivialModel()).toBe(true);
    });
  });

  describe('summarize', () => {
    it('returns null when no nontrivial model exists', () => {
      expect(trainer.summarize([])).toBeNull();
    });

    it('returns normalized importance entries after training', () => {
      const fieldInfos = [{partType: 'bodies', fieldType: 'id', index: 0}];
      trainSimple(trainer);
      const result = trainer.summarize(fieldInfos);
      expect(result).not.toBeNull();
      expect(result).toHaveLength(1);
      expect(result[0].partType).toBe('bodies');
      // Importance values must be normalized to sum to 1.
      const total = result.reduce((s, e) => s + e.importance, 0);
      expect(total).toBeCloseTo(1, 5);
    });
  });

  describe('explainFish', () => {
    it('returns null when no nontrivial model exists', () => {
      const fish = {
        knnData: [0.5],
        fieldInfos: [{partType: 'bodies', fieldType: 'id', index: 0}],
      };
      expect(trainer.explainFish(fish)).toBeNull();
    });

    it('returns impact entries after training', () => {
      trainSimple(trainer);
      const fish = {
        knnData: [0.5],
        fieldInfos: [{partType: 'bodies', fieldType: 'id', index: 0}],
      };
      const result = trainer.explainFish(fish);
      expect(result).not.toBeNull();
      expect(result).toHaveLength(1);
      expect(result[0].partType).toBe('bodies');
      expect(typeof result[0].impact).toBe('number');
    });
  });
});
