/*
  The decision tree trainer, driven the way `train.test.js` drives KNN.

  `train.init` still builds the KNN trainer for every level, because no level
  can select a family yet. These tests therefore call `train.init` for what it
  prepares — the feature number keys and the training/accuracy split — and then
  drive a `DecisionTreeTrainer` over that store directly. The trainer becomes
  reachable through `train` when `mode.trainer` lands.

  The last 10% of each dataset below is reserved for the accuracy check, so the
  row order matters to every expected value here.
*/
import {DecisionTreeClassifier, DecisionTreeRegression} from 'ml-cart';
import {createStore} from 'redux';

import {ColumnTypes} from '../../src/constants';
import {
  convertValueForTraining,
  getConvertedPredictedLabel,
} from '../../src/helpers/valueConversion';
import rootReducer, {
  setImportedData,
  setLabelColumn,
  addSelectedFeature,
  setColumnsByDataType,
  setTestData,
} from '../../src/redux';
import train from '../../src/train';
import DecisionTreeTrainer from '../../src/trainers/DecisionTreeTrainer';

/*
  Builds the store a level would have at the moment training starts, then
  returns a trainer over it. `columns` gives each column's type, `label` names
  the label, and every other column becomes a feature.
*/
function setUp(data, columns, label) {
  const store = createStore(rootReducer);

  store.dispatch(setImportedData(data, false));
  Object.entries(columns).forEach(([column, type]) =>
    store.dispatch(setColumnsByDataType(column, type)),
  );
  store.dispatch(setLabelColumn(label));
  Object.keys(columns)
    .filter(column => column !== label)
    .forEach(column => store.dispatch(addSelectedFeature(column)));

  train.reset();
  train.init(store);

  return {store, trainer: new DecisionTreeTrainer(store)};
}

// Mirrors `prepareTestData` in train.ts, which is not exported.
function predictWith(store, trainer, testValues) {
  Object.entries(testValues).forEach(([feature, value]) =>
    store.dispatch(setTestData(feature, value)),
  );
  const state = store.getState();
  trainer.predict(
    state.selectedFeatures.map(feature =>
      convertValueForTraining(state, state.testData[feature], feature),
    ),
  );
  return getConvertedPredictedLabel(store.getState());
}

const NUMERICAL = ColumnTypes.NUMERICAL;
const CATEGORICAL = ColumnTypes.CATEGORICAL;

describe('DecisionTreeTrainer: the full train and predict flow', () => {
  test('trains a classification tree and predicts a categorical label', () => {
    // `legs` fixes `animal`, so the tree has something clean to split on.
    const data = [
      {animal: 'bird', legs: '2', tail: 'yes'},
      {animal: 'bird', legs: '2', tail: 'no'},
      {animal: 'bird', legs: '2', tail: 'yes'},
      {animal: 'dog', legs: '4', tail: 'yes'},
      {animal: 'dog', legs: '4', tail: 'no'},
      {animal: 'dog', legs: '4', tail: 'yes'},
      {animal: 'snake', legs: '0', tail: 'yes'},
      {animal: 'snake', legs: '0', tail: 'no'},
      {animal: 'snake', legs: '0', tail: 'yes'},
      {animal: 'dog', legs: '4', tail: 'yes'},
    ];
    const {store, trainer} = setUp(
      data,
      {animal: CATEGORICAL, legs: NUMERICAL, tail: CATEGORICAL},
      'animal',
    );

    trainer.startTraining();

    expect(store.getState().trainedModel).toBeDefined();
    expect(predictWith(store, trainer, {legs: 4, tail: 'yes'})).toBe('dog');
    expect(predictWith(store, trainer, {legs: 0, tail: 'no'})).toBe('snake');
  });

});

describe('DecisionTreeTrainer: the maxDepth sweep', () => {
  /*
    One feature separates the label completely, so a depth of 1 is already
    perfect and every deeper candidate ties with it. The sweep must keep the
    shallowest of them. This is the rule that differs from the k sweep.
  */
  test('a tie across depths stores the shallowest tree', () => {
    const data = [
      {label: 'low', value: '1', noise: '7'},
      {label: 'low', value: '2', noise: '3'},
      {label: 'low', value: '3', noise: '9'},
      {label: 'low', value: '4', noise: '1'},
      {label: 'high', value: '90', noise: '4'},
      {label: 'high', value: '91', noise: '8'},
      {label: 'high', value: '92', noise: '2'},
      {label: 'high', value: '93', noise: '6'},
      {label: 'low', value: '5', noise: '5'},
      {label: 'high', value: '94', noise: '0'},
    ];
    const {store, trainer} = setUp(
      data,
      {label: CATEGORICAL, value: NUMERICAL, noise: NUMERICAL},
      'label',
    );

    trainer.startTraining();

    const state = store.getState();
    expect(state.accuracyCheckPredictedLabels).toEqual(
      state.accuracyCheckLabels,
    );
    // minNumSamples is pinned here rather than read from the trainer: the
    // library default of 3 collapses a set this size to a single leaf.
    expect(state.hyperparameters).toEqual({maxDepth: 1, minNumSamples: 1});
  });

  /*
    The complement of the tie case, and the reason it is not enough on its own:
    a sweep that always returned the first candidate would pass that test. Here
    `x` separates A from {B, C} but cannot tell B from C, so one split scores
    50% and two score 100%.
  */
  test('a deeper tree wins when one split cannot separate the label', () => {
    const combinations = [
      {label: 'A', x: '0', y: '0'},
      {label: 'A', x: '0', y: '1'},
      {label: 'B', x: '1', y: '0'},
      {label: 'C', x: '1', y: '1'},
    ];
    const rows = [];
    for (let i = 0; i < 5; i++) {
      rows.push(...combinations);
    }
    // The reserved rows are the last two, one B and one C, so a tree that
    // cannot separate them scores 50%.
    const data = [
      ...rows.slice(0, 18),
      {label: 'B', x: '1', y: '0'},
      {label: 'C', x: '1', y: '1'},
    ];
    const {store, trainer} = setUp(
      data,
      {label: CATEGORICAL, x: NUMERICAL, y: NUMERICAL},
      'label',
    );

    trainer.startTraining();

    const state = store.getState();
    expect(state.hyperparameters).toEqual({maxDepth: 2, minNumSamples: 1});
    expect(state.accuracyCheckPredictedLabels).toEqual(
      state.accuracyCheckLabels,
    );
  });
});

describe('DecisionTreeTrainer: regression', () => {
  /*
    The reason to prefer a regression tree over the KNN "regression" it
    replaces. A leaf holds rows whose labels differ, and the tree returns their
    mean, so a prediction can be a value that appears in no training row. KNN
    always returns one of the labels it was given.
  */
  test('a prediction can fall between the observed label values', () => {
    const data = [
      {price: '10', size: '1'},
      {price: '20', size: '1'},
      {price: '10', size: '2'},
      {price: '20', size: '2'},
      {price: '80', size: '9'},
      {price: '90', size: '9'},
      {price: '80', size: '8'},
      {price: '90', size: '8'},
      {price: '10', size: '1'},
      {price: '90', size: '9'},
    ];
    const {store, trainer} = setUp(
      data,
      {price: NUMERICAL, size: NUMERICAL},
      'price',
    );

    trainer.startTraining();

    const prediction = predictWith(store, trainer, {size: 1});
    const observedLabels = store.getState().trainingLabels.map(Number);

    expect(observedLabels).not.toContain(prediction);
    expect(prediction).toBeGreaterThan(10);
    expect(prediction).toBeLessThan(20);
  });
});

describe('DecisionTreeTrainer: JSON round-trip', () => {
  /*
    `getTrainedModelDataToSave` stores `toJSON()`, and App Lab reloads it with
    the matching static `load`. The round trip has to survive `JSON.stringify`,
    which is what the save path puts it through.
  */
  function roundTrip(model, Kind, rows) {
    const json = JSON.parse(JSON.stringify(model.toJSON()));
    return Kind.load(json).predict(rows);
  }

  test('a classification tree reloads and predicts identically', () => {
    const data = [
      {animal: 'bird', legs: '2', tail: 'yes'},
      {animal: 'dog', legs: '4', tail: 'yes'},
      {animal: 'snake', legs: '0', tail: 'no'},
      {animal: 'bird', legs: '2', tail: 'no'},
      {animal: 'dog', legs: '4', tail: 'no'},
      {animal: 'snake', legs: '0', tail: 'yes'},
      {animal: 'bird', legs: '2', tail: 'yes'},
      {animal: 'dog', legs: '4', tail: 'yes'},
      {animal: 'snake', legs: '0', tail: 'no'},
      {animal: 'dog', legs: '4', tail: 'no'},
    ];
    const {store, trainer} = setUp(
      data,
      {animal: CATEGORICAL, legs: NUMERICAL, tail: CATEGORICAL},
      'animal',
    );

    trainer.startTraining();

    const model = store.getState().trainedModel;
    const rows = store.getState().trainingExamples;

    expect(roundTrip(model, DecisionTreeClassifier, rows)).toEqual(
      model.predict(rows),
    );
  });

  test('a regression tree reloads and predicts identically', () => {
    const data = [
      {price: '10', size: '1'},
      {price: '20', size: '1'},
      {price: '80', size: '9'},
      {price: '90', size: '9'},
      {price: '10', size: '2'},
      {price: '20', size: '2'},
      {price: '80', size: '8'},
      {price: '90', size: '8'},
      {price: '10', size: '1'},
      {price: '90', size: '9'},
    ];
    const {store, trainer} = setUp(
      data,
      {price: NUMERICAL, size: NUMERICAL},
      'price',
    );

    trainer.startTraining();

    const model = store.getState().trainedModel;
    const rows = store.getState().trainingExamples;

    expect(roundTrip(model, DecisionTreeRegression, rows)).toEqual(
      model.predict(rows),
    );
  });
});
