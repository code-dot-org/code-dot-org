import KNN from 'ml-knn';

import {getHyperparameters, predict} from '@cdo/apps/MLTrainers';

/*
  A saved model now carries a `hyperparameters` object. Models saved before that
  field carry a top-level `kValue`, and they stay in S3 permanently, so the
  fallback below is permanent too. This file covers both shapes, and it records
  that `predict` itself needs neither field, because `KNN.load` restores k from
  the serialized model.
*/
describe('getHyperparameters', () => {
  it('takes the value from kValue when there is no hyperparameters object', () => {
    expect(getHyperparameters({kValue: 3})).toEqual({k: 3});
  });

  it('takes the object when there is one', () => {
    expect(getHyperparameters({hyperparameters: {k: 7}})).toEqual({k: 7});
  });

  it('prefers hyperparameters over kValue when a model carries both', () => {
    expect(getHyperparameters({hyperparameters: {k: 7}, kValue: 3})).toEqual({
      k: 7,
    });
  });

  it('carries the values a decision tree records', () => {
    const tree = {maxDepth: 3, minNumSamples: 1};
    expect(getHyperparameters({hyperparameters: tree})).toEqual(tree);
  });

  it('gives an empty object when a model carries neither field', () => {
    expect(getHyperparameters({})).toEqual({});
    expect(getHyperparameters({kValue: null})).toEqual({});
  });
});

describe('MLTrainers.predict', () => {
  let baseModel;

  beforeEach(() => {
    // k = 1 gives triangle here and k = 5 gives circle, so the last test can fail.
    const knn = new KNN([[1], [2], [3], [4], [5], [10]], [0, 0, 1, 0, 0, 2], {
      k: 1,
    });
    baseModel = {
      selectedTrainer: 'knnClassify',
      trainedModel: JSON.parse(JSON.stringify(knn.toJSON())),
      featureNumberKey: {shape: {circle: 0, triangle: 1, square: 2}},
      features: [{id: 'sides'}],
      label: {id: 'shape', values: ['circle', 'triangle', 'square']},
      testData: {sides: 3},
    };
  });

  it('predicts from a model that carries only the legacy kValue', () => {
    expect(predict({...baseModel, kValue: 1})).toBe('triangle');
  });

  it('predicts the same from a model that carries hyperparameters', () => {
    expect(predict({...baseModel, hyperparameters: {k: 1}, kValue: 1})).toBe(
      'triangle'
    );
  });

  it('takes k from the serialized model, not from hyperparameters', () => {
    expect(predict({...baseModel, hyperparameters: {k: 5}, kValue: 1})).toBe(
      'triangle'
    );
  });
});
