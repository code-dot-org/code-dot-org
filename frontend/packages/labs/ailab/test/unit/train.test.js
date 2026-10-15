import {createStore} from 'redux';

import {ColumnTypes, TestDataLocations} from '../../src/constants';
import {getConvertedPredictedLabel} from '../../src/helpers/valueConversion';
import rootReducer, {
  getTrainingResults,
  setImportedData,
  setColumnsByDataType,
  setMode,
  setReserveLocation,
  setTestData,
} from '../../src/redux';
import train from '../../src/train';
import {initialProject} from '../../src/types';

import {levelProject, levelStore} from './levelStore';

describe('train functions', () => {
  test('train and predict with numerical data', async () => {
    const store = createStore(rootReducer);

    const data = [
      {temperature: '0', cost: '20', rain: '1000'},
      {temperature: '50', cost: '25', rain: '1010'},
      {temperature: '100', cost: '30', rain: '1020'},
      {temperature: '150', cost: '35', rain: '1030'},
    ];

    store.dispatch(setImportedData(data, false));
    store.dispatch(setColumnsByDataType('cost', ColumnTypes.NUMERICAL));
    store.dispatch(setColumnsByDataType('rain', ColumnTypes.NUMERICAL));
    store.dispatch(setColumnsByDataType('temperature', ColumnTypes.NUMERICAL));
    const project = {
      ...initialProject,
      labelColumn: 'cost',
      selectedFeatures: ['temperature', 'rain'],
    };

    train.init(store, project);
    const {trainedModel} = train.onClickTrain();

    store.dispatch(setTestData('temperature', 10));
    store.dispatch(setTestData('rain', 1010));

    train.onClickPredict(trainedModel, project);

    const predictedValue = getConvertedPredictedLabel(
      store.getState(),
      project,
    );

    expect(predictedValue).toBe(20);
  });

  test('train and predict with categorical data', async () => {
    const store = createStore(rootReducer);

    const data = [
      {color: 'blue', flavor: 'sour', texture: 'crunchy'},
      {color: 'green', flavor: 'sweet', texture: 'crunchy'},
      {color: 'green', flavor: 'sweet', texture: 'crunchy'},
      {color: 'yellow', flavor: 'sweet', texture: 'crunchy'},
      {color: 'blue', flavor: 'sweet', texture: 'soft'},
    ];

    store.dispatch(setImportedData(data, false));
    store.dispatch(setColumnsByDataType('color', ColumnTypes.CATEGORICAL));
    store.dispatch(setColumnsByDataType('flavor', ColumnTypes.CATEGORICAL));
    store.dispatch(setColumnsByDataType('texture', ColumnTypes.CATEGORICAL));
    const project = {
      ...initialProject,
      labelColumn: 'color',
      selectedFeatures: ['flavor', 'texture'],
    };

    train.init(store, project);
    const {trainedModel} = train.onClickTrain();

    store.dispatch(setTestData('flavor', 'sweet'));
    store.dispatch(setTestData('texture', 'crunchy'));

    train.onClickPredict(trainedModel, project);

    const predictedLabel = getConvertedPredictedLabel(
      store.getState(),
      project,
    );

    expect(predictedLabel).toBe('green');
  });
});

// Cancel undoes only the Redux half of a run; ProjectContext and
// TrainingDataContext undo theirs, and useTrainingRun drives all three.
describe('train.cancel', () => {
  const trainOnce = (store, project) => {
    train.init(store, project);
    train.onClickTrain();
  };

  test('puts back the results from before the cancelled run', () => {
    const store = levelStore({});
    trainOnce(store, levelProject());
    const before = getTrainingResults(store.getState());

    trainOnce(store, levelProject());

    train.cancel();
    expect(getTrainingResults(store.getState())).toEqual(before);
  });

  /*
    A cancelled run restores the model trained before it, so a prediction has
    to be built from that model's columns. Reusing the cancelled run's columns
    feeds it values for features it never saw.
  */
  test('predicts with the restored model, not the cancelled run', () => {
    const store = createStore(rootReducer);
    const data = [
      {animal: 'bird', legs: '2', tail: 'yes'},
      {animal: 'dog', legs: '4', tail: 'yes'},
      {animal: 'snake', legs: '0', tail: 'no'},
      {animal: 'bird', legs: '2', tail: 'no'},
      {animal: 'dog', legs: '4', tail: 'no'},
      {animal: 'snake', legs: '0', tail: 'yes'},
    ];
    store.dispatch(setImportedData(data, false));
    store.dispatch(setColumnsByDataType('animal', ColumnTypes.CATEGORICAL));
    store.dispatch(setColumnsByDataType('legs', ColumnTypes.NUMERICAL));
    store.dispatch(setColumnsByDataType('tail', ColumnTypes.CATEGORICAL));

    const onLegs = {
      ...initialProject,
      labelColumn: 'animal',
      selectedFeatures: ['legs'],
    };
    const onLegsAndTail = {...onLegs, selectedFeatures: ['legs', 'tail']};

    train.init(store, onLegs);
    const {trainedModel} = train.onClickTrain();
    store.dispatch(setTestData('legs', 0));
    train.onClickPredict(trainedModel, onLegs);
    const predicted = getConvertedPredictedLabel(store.getState(), onLegs);

    // A second run on different columns, which the student then cancels.
    train.init(store, onLegsAndTail);
    train.onClickTrain();
    train.cancel();

    train.onClickPredict(trainedModel, onLegs);

    expect(getConvertedPredictedLabel(store.getState(), onLegs)).toBe(
      predicted,
    );
  });
});

describe('the accuracy-check split', () => {
  // How train.init divides a dataset of this many rows.
  const splitOf = rowCount => {
    const store = createStore(rootReducer);
    const rows = Array.from({length: rowCount}, (_unused, index) => ({
      animal: index % 2 ? 'bird' : 'dog',
      legs: String(index),
    }));

    store.dispatch(setImportedData(rows, false));
    store.dispatch(setColumnsByDataType('animal', ColumnTypes.CATEGORICAL));
    store.dispatch(setColumnsByDataType('legs', ColumnTypes.NUMERICAL));
    train.init(store, {
      ...initialProject,
      labelColumn: 'animal',
      selectedFeatures: ['legs'],
    });

    const {accuracyCheckExamples, trainingExamples} = store.getState();
    return {
      heldBack: accuracyCheckExamples.length,
      trainedOn: trainingExamples.length,
    };
  };

  test('rounds the held-back count up', () => {
    expect(splitOf(21)).toEqual({heldBack: 3, trainedOn: 18});
  });

  // Rounding to nearest would leave a small dataset nothing to grade against.
  test('holds a row back even when a tenth of the dataset is under one', () => {
    expect(splitOf(4)).toEqual({heldBack: 1, trainedOn: 3});
  });
});

/*
  Twenty rows, so a 10% split reserves two rather than one, and deliberately
  inconsistent: if `legs` settled the answer every time, every split would
  produce the same model and the refit tests could not tell one from another.
*/
const ROWS = [
  {animal: 'bird', legs: '2', tail: 'yes'},
  {animal: 'dog', legs: '4', tail: 'yes'},
  {animal: 'snake', legs: '0', tail: 'no'},
  {animal: 'bird', legs: '2', tail: 'no'},
  {animal: 'dog', legs: '4', tail: 'no'},
  {animal: 'snake', legs: '0', tail: 'yes'},
  {animal: 'dog', legs: '2', tail: 'yes'},
  {animal: 'bird', legs: '4', tail: 'no'},
  {animal: 'snake', legs: '2', tail: 'no'},
  {animal: 'bird', legs: '0', tail: 'yes'},
  {animal: 'dog', legs: '0', tail: 'no'},
  {animal: 'snake', legs: '4', tail: 'yes'},
  {animal: 'bird', legs: '2', tail: 'yes'},
  {animal: 'dog', legs: '4', tail: 'no'},
  {animal: 'snake', legs: '0', tail: 'yes'},
  {animal: 'dog', legs: '2', tail: 'no'},
  {animal: 'bird', legs: '4', tail: 'yes'},
  {animal: 'snake', legs: '2', tail: 'yes'},
  {animal: 'bird', legs: '0', tail: 'no'},
  {animal: 'dog', legs: '0', tail: 'yes'},
];

const COLUMNS = {
  animal: ColumnTypes.CATEGORICAL,
  legs: ColumnTypes.NUMERICAL,
  tail: ColumnTypes.CATEGORICAL,
};

const PROJECT = {
  ...initialProject,
  labelColumn: 'animal',
  selectedFeatures: ['legs', 'tail'],
};

function loadedStore(mode, reserveLocation) {
  const store = createStore(rootReducer);
  store.dispatch(setMode(mode));
  store.dispatch(setImportedData(ROWS, false));
  Object.entries(COLUMNS).forEach(([column, type]) =>
    store.dispatch(setColumnsByDataType(column, type)),
  );
  store.dispatch(setReserveLocation(reserveLocation));
  return store;
}

// What a save would hold after the student trained.
function trainAndSave(mode, reserveLocation) {
  const store = loadedStore(mode, reserveLocation);
  train.reset();
  train.init(store, PROJECT);
  const run = train.onClickTrain();
  return {
    store,
    run,
    saved: {
      ...PROJECT,
      hyperparameters: run.hyperparameters,
      accuracyCheckRowIndices: run.accuracyCheckRowIndices,
      historicResults: [run.historicResult],
    },
  };
}

const cases = [
  ['a nearest neighbour model', undefined],
  ['a decision tree', {trainer: 'decisionTree'}],
];
const splits = [
  ['the last rows', TestDataLocations.END],
  ['a random selection of rows', TestDataLocations.RANDOM],
];

/*
  A saved project carries no model. It is rebuilt from the dataset, the columns,
  the hyperparameters the run settled on, and the rows it was graded against.
*/
describe('train.refit', () => {
  describe.each(cases)('%s', (_label, mode) => {
    describe.each(splits)('graded against %s', (_split, reserveLocation) => {
      test('predicts exactly as the saved model did', () => {
        const {store, run, saved} = trainAndSave(mode, reserveLocation);
        const probes = store.getState().trainingExamples;

        train.reset();
        const refit = train.refit(loadedStore(mode, reserveLocation), saved);

        expect(refit.trainedModel.predict(probes)).toEqual(
          run.trainedModel.predict(probes),
        );
      });

      test('reports the same accuracy as the saved run', () => {
        const {run, saved} = trainAndSave(mode, reserveLocation);

        train.reset();
        const refit = train.refit(loadedStore(mode, reserveLocation), saved);

        expect(refit.historicResult).toEqual(run.historicResult);
        expect(refit.hyperparameters).toEqual(run.hyperparameters);
      });

      test('holds back the same rows', () => {
        const {store, saved} = trainAndSave(mode, reserveLocation);
        const before = store.getState();

        train.reset();
        const refitStore = loadedStore(mode, reserveLocation);
        train.refit(refitStore, saved);

        const after = refitStore.getState();
        expect(after.accuracyCheckExamples).toEqual(
          before.accuracyCheckExamples,
        );
        expect(after.accuracyCheckLabels).toEqual(before.accuracyCheckLabels);
        expect(after.trainingExamples).toEqual(before.trainingExamples);
      });
    });
  });

  test('a random split differs between runs, so the saved one is the only way back', () => {
    const first = trainAndSave(undefined, TestDataLocations.RANDOM).saved
      .accuracyCheckRowIndices;
    const splitsSeen = new Set([first.join()]);
    for (let attempt = 0; attempt < 20; attempt++) {
      splitsSeen.add(
        trainAndSave(
          undefined,
          TestDataLocations.RANDOM,
        ).saved.accuracyCheckRowIndices.join(),
      );
    }
    expect(splitsSeen.size).toBeGreaterThan(1);
  });

  // 200 runs reserve 400 rows between them, so a row that can be drawn will
  // be. The last row is the one an off-by-one would quietly exclude.
  test('can hold back any row, including the last one', () => {
    const seen = new Set();
    for (let attempt = 0; attempt < 200; attempt++) {
      trainAndSave(
        undefined,
        TestDataLocations.RANDOM,
      ).saved.accuracyCheckRowIndices.forEach(index => seen.add(index));
    }

    expect([...seen].sort((a, b) => a - b)).toEqual(
      Array.from({length: ROWS.length}, (_unused, index) => index),
    );
  });

  test('builds what the saved hyperparameters ask for, without sweeping again', () => {
    const {run, saved} = trainAndSave(
      {trainer: 'decisionTree'},
      TestDataLocations.END,
    );
    // The sweep settles on maxDepth 1 for this fixture, so asking for a deeper
    // tree is the only way to tell a rebuild apart from a second sweep.
    const deeper = {...saved, hyperparameters: {maxDepth: 8}};

    train.reset();
    const refit = train.refit(
      loadedStore({trainer: 'decisionTree'}, TestDataLocations.END),
      deeper,
    );

    expect(refit.hyperparameters).toEqual({maxDepth: 8});
    expect(refit.trainedModel.toJSON()).not.toEqual(run.trainedModel.toJSON());
  });

  test('cannot rebuild a project that never trained', () => {
    const store = loadedStore(undefined, TestDataLocations.END);
    expect(train.refit(store, PROJECT)).toBeUndefined();
  });

  // Half a saved run is no more use than none: the hyperparameters say what to
  // build and the row indices say what to build it on.
  test.each([
    ['hyperparameters', {accuracyCheckRowIndices: [18, 19]}],
    ['the rows it was graded against', {hyperparameters: {k: 3}}],
  ])('cannot rebuild a project saved without %s', (_missing, half) => {
    const store = loadedStore(undefined, TestDataLocations.END);
    expect(train.refit(store, {...PROJECT, ...half})).toBeUndefined();
  });

  /*
    A level's dataset can change under a saved project, leaving indices that
    name rows it no longer has.
  */
  test.each([
    ['names a row the dataset no longer has', [18, ROWS.length]],
    ['names a row before the first', [-1, 19]],
    ['names no rows at all', []],
    ['leaves no rows to train on', ROWS.map((_unused, index) => index)],
  ])('cannot rebuild from a split that %s', (_reason, indices) => {
    const {saved} = trainAndSave(undefined, TestDataLocations.END);

    train.reset();
    const refit = train.refit(loadedStore(undefined, TestDataLocations.END), {
      ...saved,
      accuracyCheckRowIndices: indices,
    });

    expect(refit).toBeUndefined();
  });

  /*
    An author can change a level's trainer after students have saved work, so
    the saved hyperparameters need not be the ones this trainer understands.
  */
  describe('a project saved under the other trainer', () => {
    const savedUnder = (mode, hyperparameters) => ({
      ...trainAndSave(mode, TestDataLocations.END).saved,
      hyperparameters,
    });

    test('is not rebuilt as a nearest neighbour model', () => {
      const saved = savedUnder({trainer: 'decisionTree'}, {maxDepth: 3});

      train.reset();
      expect(
        train.refit(loadedStore(undefined, TestDataLocations.END), saved),
      ).toBeUndefined();
    });

    test('is not rebuilt as a decision tree', () => {
      const saved = savedUnder(undefined, {k: 5});

      train.reset();
      expect(
        train.refit(
          loadedStore({trainer: 'decisionTree'}, TestDataLocations.END),
          saved,
        ),
      ).toBeUndefined();
    });
  });
});
