import {DecisionTreeClassifier, DecisionTreeRegression} from 'ml-cart';
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

  it('reports an unknown trainer rather than predicting', () => {
    expect(predict({...baseModel, selectedTrainer: 'randomForest'})).toBe(
      'Error: unknown trainer'
    );
  });

  it('reports an unknown trainer for an inherited property name', () => {
    expect(predict({...baseModel, selectedTrainer: 'constructor'})).toBe(
      'Error: unknown trainer'
    );
  });
});

describe('MLTrainers.predict with a decision tree', () => {
  // `sides` fixes the shape, so each tree has a clean split to find.
  const SIDES = [[1], [2], [3], [4], [5], [10]];

  function treeModel(Kind, selectedTrainer, labels, extra = {}) {
    const tree = new Kind({maxDepth: 3, minNumSamples: 1});
    tree.train(SIDES, labels);
    return {
      selectedTrainer,
      trainedModel: JSON.parse(JSON.stringify(tree.toJSON())),
      featureNumberKey: {shape: {circle: 0, triangle: 1, square: 2}},
      features: [{id: 'sides'}],
      label: {id: 'shape', values: ['circle', 'triangle', 'square']},
      testData: {sides: 3},
      ...extra,
    };
  }

  it('predicts a categorical label from a saved classification tree', () => {
    const model = treeModel(
      DecisionTreeClassifier,
      'treeClassify',
      [0, 0, 1, 0, 0, 2]
    );

    expect(predict(model)).toBe('triangle');
  });

  /*
    A regression tree has no featureNumberKey entry for its label, so the
    prediction stays numeric rather than being mapped back to a string.
  */
  it('predicts a numeric label from a saved regression tree', () => {
    const model = treeModel(
      DecisionTreeRegression,
      'treeRegress',
      [10, 20, 30, 40, 50, 100],
      {
        featureNumberKey: {},
        label: {id: 'price'},
      }
    );

    expect(predict(model)).toBe(30);
  });

  // The tree is handed one row, so it must give back one prediction.
  it('returns a single prediction, not one per feature', () => {
    const twoFeatures = [
      [1, 9],
      [2, 9],
      [3, 1],
      [4, 1],
      [5, 1],
      [10, 1],
    ];
    const tree = new DecisionTreeClassifier({maxDepth: 3, minNumSamples: 1});
    tree.train(twoFeatures, [0, 0, 1, 0, 0, 2]);

    const prediction = predict({
      selectedTrainer: 'treeClassify',
      trainedModel: JSON.parse(JSON.stringify(tree.toJSON())),
      featureNumberKey: {shape: {circle: 0, triangle: 1, square: 2}},
      features: [{id: 'sides'}, {id: 'corners'}],
      label: {id: 'shape', values: ['circle', 'triangle', 'square']},
      testData: {sides: 3, corners: 1},
    });

    expect(prediction).toBe('triangle');
  });
});
