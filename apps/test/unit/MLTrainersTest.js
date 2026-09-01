import {DecisionTreeClassifier, DecisionTreeRegression} from 'ml-cart';
import KNN from 'ml-knn';

import {
  predict,
  getHyperparameters,
  PREDICTION_FAILED,
  UNKNOWN_TRAINER,
} from '@cdo/apps/MLTrainers';

import {assert} from '../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

// grew: no => 0, yes => 1
const categoricalKey = {grew: {no: 0, yes: 1}};

const examples = [
  [10, 1],
  [12, 2],
  [15, 3],
  [80, 7],
  [85, 8],
  [90, 9],
];
const classLabels = [0, 0, 0, 1, 1, 1];

function classifierModelData(trainedModel, selectedTrainer) {
  return {
    selectedTrainer,
    trainedModel,
    featureNumberKey: categoricalKey,
    label: {id: 'grew'},
    features: [{id: 'temperature'}, {id: 'rain'}],
    testData: {temperature: 88, rain: 9},
  };
}

function trainedTreeClassifier() {
  const model = new DecisionTreeClassifier({maxDepth: 3, minNumSamples: 1});
  model.train(examples, classLabels);
  return JSON.parse(JSON.stringify(model.toJSON()));
}

/*
  The heights within each group differ. A regression tree in ml-cart 2.1.1
  will not split when the best split has zero squared error, so identical
  values on each side of the split would leave one leaf holding every row.
*/
function trainedTreeRegression() {
  const model = new DecisionTreeRegression({maxDepth: 3, minNumSamples: 1});
  model.train(examples, [2, 3, 4, 40, 41, 42]);
  return JSON.parse(JSON.stringify(model.toJSON()));
}

function trainedKnn() {
  const model = new KNN(examples, classLabels, {k: 1});
  return JSON.parse(JSON.stringify(model.toJSON()));
}

describe('predict', function () {
  it('predicts from a saved KNN model', function () {
    const result = predict(classifierModelData(trainedKnn(), 'knnClassify'));
    assert.equal(result, 'yes');
  });

  it('predicts from a saved decision tree classifier', function () {
    const result = predict(
      classifierModelData(trainedTreeClassifier(), 'treeClassify')
    );
    assert.equal(result, 'yes');
  });

  it('predicts from a saved decision tree regression', function () {
    const result = predict({
      selectedTrainer: 'treeRegress',
      trainedModel: trainedTreeRegression(),
      featureNumberKey: {},
      label: {id: 'height'},
      features: [{id: 'temperature'}, {id: 'rain'}],
      testData: {temperature: 88, rain: 9},
    });
    // The mean of the matching leaf, a value in no training row.
    assert.equal(result, 41.5);
  });

  it('returns the prediction error when the blob names the other tree kind', function () {
    const result = predict(
      classifierModelData(trainedTreeRegression(), 'treeClassify')
    );
    assert.equal(result, PREDICTION_FAILED);
  });

  it('returns the unknown trainer error for a trainer it does not handle', function () {
    const result = predict(
      classifierModelData(trainedKnn(), 'neuralNetworkClassify')
    );
    assert.equal(result, UNKNOWN_TRAINER);
  });
});

describe('convertTestValue', function () {
  // A tree splits on a threshold, so truncating 72.8 to 72 can send the value
  // down the other branch.
  it('passes a fractional feature value through intact', function () {
    // The tree splits temperature at 72.5, the mean of the adjacent 72 and 73.
    const model = new DecisionTreeRegression({maxDepth: 1, minNumSamples: 1});
    model.train([[71], [72], [73], [74]], [0, 1, 100, 101]);

    const modelData = {
      selectedTrainer: 'treeRegress',
      trainedModel: JSON.parse(JSON.stringify(model.toJSON())),
      featureNumberKey: {},
      label: {id: 'yield'},
      features: [{id: 'temperature'}],
      testData: {temperature: '72.8'},
    };

    // 72.8 belongs above the threshold. parseInt would truncate it to 72 and
    // send it down the other branch, predicting 0.5.
    assert.equal(predict(modelData), 100.5);
    assert.equal(predict({...modelData, testData: {temperature: '72.2'}}), 0.5);
  });

  it('still resolves a categorical value through featureNumberKey', function () {
    const model = new DecisionTreeClassifier({maxDepth: 2, minNumSamples: 1});
    // Feature "flavor": sour => 0, sweet => 1.
    model.train([[0], [1]], [0, 1]);

    const result = predict({
      selectedTrainer: 'treeClassify',
      trainedModel: JSON.parse(JSON.stringify(model.toJSON())),
      featureNumberKey: {flavor: {sour: 0, sweet: 1}, grew: {no: 0, yes: 1}},
      label: {id: 'grew'},
      features: [{id: 'flavor'}],
      testData: {flavor: 'sweet'},
    });

    assert.equal(result, 'yes');
  });
});

describe('getHyperparameters', function () {
  it('prefers the hyperparameters object', function () {
    assert.deepEqual(getHyperparameters({hyperparameters: {k: 5}, kValue: 3}), {
      k: 5,
    });
  });

  it('falls back to the legacy kValue', function () {
    assert.deepEqual(getHyperparameters({kValue: 3}), {k: 3});
  });

  it('returns an empty object when a model carries neither', function () {
    assert.deepEqual(getHyperparameters({}), {});
    assert.deepEqual(getHyperparameters({kValue: null}), {});
  });
});
