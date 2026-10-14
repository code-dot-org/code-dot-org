/*
  A saved project carries no model — it is rebuilt from the dataset, the
  columns, the hyperparameters the run settled on, and the rows it was graded
  against. These check that what comes back is the model the student had.
*/
import {createStore} from 'redux';

import {ColumnTypes, TestDataLocations} from '../../src/constants';
import rootReducer, {
  setColumnsByDataType,
  setImportedData,
  setMode,
  setReserveLocation,
} from '../../src/redux';
import train from '../../src/train';
import {initialProject} from '../../src/types';

/*
  Twenty rows, so a 10% split reserves two rather than one, and deliberately
  inconsistent: if `legs` settled the answer every time, every split would
  produce the same model and these tests could not tell one from another.
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
});
