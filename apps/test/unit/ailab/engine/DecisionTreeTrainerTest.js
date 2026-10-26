/*
  The last 10% of each dataset below is reserved for the accuracy check, so the
  row order matters to every expected value here.
*/
import {DecisionTreeClassifier, DecisionTreeRegression} from 'ml-cart';
import {createStore} from 'redux';

import {ColumnTypes} from '@cdo/apps/ailab/engine/constants';
import {
  convertValueForTraining,
  getConvertedPredictedLabel,
} from '@cdo/apps/ailab/engine/helpers/valueConversion';
import rootReducer, {
  setImportedData,
  setColumnsByDataType,
  setMode,
  setTestData,
} from '@cdo/apps/ailab/engine/redux';
import train from '@cdo/apps/ailab/engine/train';
import {buildTrainer} from '@cdo/apps/ailab/engine/trainers';
import {defaultProject} from '@cdo/apps/ailab/engine/types';

function setUp(data, columns, label, mode = {}) {
  const store = createStore(rootReducer);

  store.dispatch(setMode({trainer: 'decisionTree', ...mode}));
  store.dispatch(setImportedData(data, false));
  Object.entries(columns).forEach(([column, type]) =>
    store.dispatch(setColumnsByDataType(column, type))
  );
  const project = {
    ...defaultProject,
    labelColumn: label,
    selectedFeatures: Object.keys(columns).filter(column => column !== label),
  };

  train.reset();
  train.init(store, project);

  return {store, project, trainer: buildTrainer(store, project)};
}

// Mirrors `prepareTestData` in train.ts, which is not exported.
function predictWith(store, project, trainer, trainedModel, testValues) {
  Object.entries(testValues).forEach(([feature, value]) =>
    store.dispatch(setTestData(feature, value))
  );
  const state = store.getState();
  trainer.predict(
    trainedModel,
    project.selectedFeatures.map(feature =>
      convertValueForTraining(state, project, state.testData[feature], feature)
    )
  );
  return getConvertedPredictedLabel(store.getState(), project);
}

const NUMERICAL = ColumnTypes.NUMERICAL;
const CATEGORICAL = ColumnTypes.CATEGORICAL;

describe('DecisionTreeTrainer: the full train and predict flow', () => {
  test('trains a classification tree and predicts a categorical label', () => {
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
    const {store, project, trainer} = setUp(
      data,
      {animal: CATEGORICAL, legs: NUMERICAL, tail: CATEGORICAL},
      'animal'
    );

    const {trainedModel} = trainer.startTraining();

    expect(trainedModel).toBeDefined();
    expect(
      predictWith(store, project, trainer, trainedModel, {
        legs: 4,
        tail: 'yes',
      })
    ).toBe('dog');
    expect(
      predictWith(store, project, trainer, trainedModel, {legs: 0, tail: 'no'})
    ).toBe('snake');
  });

  test('batchPredict returns no labels before training', () => {
    const {trainer} = setUp(
      [
        {animal: 'bird', legs: '2'},
        {animal: 'dog', legs: '4'},
      ],
      {animal: CATEGORICAL, legs: NUMERICAL},
      'animal'
    );

    expect(trainer.batchPredict(undefined, [[2]])).toEqual([]);
  });
});

describe('DecisionTreeTrainer: the maxDepth sweep', () => {
  // jest.config.js clears mocks between tests but does not restore them.
  afterEach(() => jest.restoreAllMocks());

  /*
    One feature separates the label completely, so a depth of 1 is already
    perfect. Every candidate with a greater depth ties with it. The sweep must keep the
    shallowest of them.
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
      'label'
    );

    const run = trainer.startTraining();

    const state = store.getState();
    expect(state.accuracyCheckPredictedLabels).toEqual(
      state.accuracyCheckLabels
    );
    expect(run.hyperparameters).toEqual({maxDepth: 1});
  });

  // A depth-1 tree splits on x, so it gets one of the last two rows wrong.
  function setUpTwoSplitLabel(mode) {
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
    const data = [
      ...rows.slice(0, 18),
      {label: 'B', x: '1', y: '0'},
      {label: 'C', x: '1', y: '1'},
    ];
    return setUp(
      data,
      {label: CATEGORICAL, x: NUMERICAL, y: NUMERICAL},
      'label',
      mode
    );
  }

  // Catches what the tie case can't: a sweep that keeps its first candidate.
  test('a deeper tree wins when one split cannot separate the label', () => {
    const {store, trainer} = setUpTwoSplitLabel();

    const run = trainer.startTraining();

    const state = store.getState();
    expect(run.hyperparameters).toEqual({maxDepth: 2});
    expect(state.accuracyCheckPredictedLabels).toEqual(
      state.accuracyCheckLabels
    );
  });

  test("a level's maxDepth replaces the sweep", () => {
    const {store, trainer} = setUpTwoSplitLabel({
      hyperparameters: {maxDepth: 1},
    });

    const run = trainer.startTraining();

    const state = store.getState();
    expect(run.hyperparameters).toEqual({maxDepth: 1});
    expect(state.accuracyCheckPredictedLabels).not.toEqual(
      state.accuracyCheckLabels
    );
  });

  /*
    A level can name a depth the sweep would never try, and a saved run of it
    still has to come back when the student reopens their project.
  */
  test("rebuilds a level's maxDepth from outside the sweep", () => {
    const {trainer} = setUpTwoSplitLabel({hyperparameters: {maxDepth: 4}});
    expect(trainer.startTraining().hyperparameters).toEqual({maxDepth: 4});

    expect(trainer.rebuild({maxDepth: 4})).toBeDefined();
  });

  // Pinning a depth does not strand the runs students saved before it.
  test('rebuilds a swept depth after the level pinned another', () => {
    const {trainer} = setUpTwoSplitLabel({hyperparameters: {maxDepth: 4}});
    trainer.startTraining();

    expect(trainer.rebuild({maxDepth: 2})).toBeDefined();
  });

  test('rebuilds any whole depth, the sweep being only what it tries first', () => {
    const {trainer} = setUpTwoSplitLabel({hyperparameters: {maxDepth: 4}});
    trainer.startTraining();

    expect(trainer.rebuild({maxDepth: 7})).toBeDefined();
  });

  test.each([
    ['below one', 0],
    ['negative', -1],
    ['fractional', 1.5],
  ])('declines a depth that is %s', (_name, maxDepth) => {
    const {trainer} = setUpTwoSplitLabel({hyperparameters: {maxDepth: 4}});
    trainer.startTraining();

    expect(trainer.rebuild({maxDepth})).toBeUndefined();
  });

  /*
    The range check cannot know every value an algorithm will refuse, so a
    throw from one has to reach the student as a retrain, not a blank lab.
  */
  test('declines rather than throwing when the build fails', () => {
    const {trainer} = setUpTwoSplitLabel({hyperparameters: {maxDepth: 4}});
    trainer.startTraining();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // Own property, so the shared prototype survives this test.
    trainer.buildModel = () => {
      throw new TypeError('the algorithm refused this one');
    };

    expect(trainer.rebuild({maxDepth: 4})).toBeUndefined();
  });
});

describe('DecisionTreeTrainer: regression', () => {
  /*
    A leaf holds rows whose labels differ, and the tree returns their
    mean, so a prediction can be a value that appears in no training row. 
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
    const {store, project, trainer} = setUp(
      data,
      {price: NUMERICAL, size: NUMERICAL},
      'price'
    );

    const {trainedModel} = trainer.startTraining();

    const prediction = predictWith(store, project, trainer, trainedModel, {
      size: 1,
    });
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
      'animal'
    );

    const {trainedModel: model} = trainer.startTraining();
    const rows = store.getState().trainingExamples;

    expect(roundTrip(model, DecisionTreeClassifier, rows)).toEqual(
      model.predict(rows)
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
      'price'
    );

    const {trainedModel: model} = trainer.startTraining();
    const rows = store.getState().trainingExamples;

    expect(roundTrip(model, DecisionTreeRegression, rows)).toEqual(
      model.predict(rows)
    );
  });
});
