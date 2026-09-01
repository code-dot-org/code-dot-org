/*
  Characterization tests for the KNN trainer, on the datasets the lab ships.

  These tests record what the lab does today. They do not say what it should do.
  Every expected value below was recorded from a run, not chosen by hand, so a
  failure here means a change of behavior and not necessarily a defect. If a
  later change moves one of these values, update it in the same commit and say
  why in the pull request description.

  The trainer interface work will refactor every file these tests touch, and this 
  suite is the check that it changes no behavior.

  The data comes from `public/datasets`, which is what a level loads. The lab
  fetches those files over HTTP, so these tests read them from disk and then
  push them through the lab's own CSV cleaning and metadata handling.
*/
import fs from 'fs';
import KNN from 'ml-knn';
import path from 'path';

import {ColumnTypes, TestDataLocations} from '../../src/constants';
import {parseCSV} from '../../src/csvReaderWrapper';
import {getPercentCorrect} from '../../src/helpers/accuracy';
import I18n from '../../src/i18n';
import {
  addSelectedFeature,
  getTrainedModelDataToSave,
  resetState,
  setColumnsByDataType,
  setImportedMetadata,
  setLabelColumn,
  setReserveLocation,
  setSelectedCSV,
  setSelectedJSON,
} from '../../src/redux';
import {store} from '../../src/store';
import train from '../../src/train';

// vitest runs with the package root as cwd; see vitest.config.ts.
const DIR = path.join(process.cwd(), 'public', 'datasets');

const SAVED_MODEL_KEYS = [
  'datasetDetails',
  'featureNumberKey',
  'features',
  'kValue',
  'label',
  'name',
  'potentialMisuses',
  'potentialUses',
  'selectedTrainer',
  'summaryStat',
  'trainedModel',
];

/*
  Loads a shipped dataset the way a level does: the metadata gives the column
  types and the label, and the reserved rows come from the end of the file.
  `features` defaults to every column except the label.
*/
function load(id, features) {
  const csv = fs.readFileSync(path.join(DIR, `${id}.csv`), 'utf8');
  const metadata = JSON.parse(
    fs.readFileSync(path.join(DIR, `${id}.json`), 'utf8'),
  );

  store.dispatch(resetState());
  train.reset();
  // A string here is what makes `isUserUploaded` false, as it is for a level.
  store.dispatch(setSelectedCSV(`${id}.csv`));
  store.dispatch(setSelectedJSON(`${id}.json`));
  parseCSV(csv, false, false);
  store.dispatch(setImportedMetadata(metadata));
  metadata.fields.forEach(field =>
    store.dispatch(
      setColumnsByDataType(field.id, field.type || ColumnTypes.CATEGORICAL),
    ),
  );
  // Set explicitly rather than relying on the initial state, so a change of
  // default cannot silently make these tests non-deterministic.
  store.dispatch(setReserveLocation(TestDataLocations.END));
  store.dispatch(setLabelColumn(metadata.defaultLabelColumn));

  const chosen =
    features ||
    Object.keys(store.getState().data[0]).filter(
      column => column !== metadata.defaultLabelColumn,
    );
  chosen.forEach(column => store.dispatch(addSelectedFeature(column)));

  train.init(store);
  train.onClickTrain(store);
  return store.getState();
}

/*
  `getTrainedModelDataToSave` reaches `getDatasetDetails`, which localizes the 
  dataset description and the two context fields, and `I18n.t` throws when 
  nothing has initialized it. 
*/
beforeAll(() => {
  I18n.initI18n();
});

/*
  Guards every number below. An edit to a shipped CSV changes the split and the
  accuracy, and this test says so directly instead of leaving a puzzle.
*/
describe('shipped dataset fingerprints', () => {
  test('shapes_v1_toy is 100 clean rows over 6 columns', () => {
    const state = load('shapes_v1_toy');

    expect(state.data.length).toBe(100);
    expect(state.removedRowsCount).toBe(0);
    expect(Object.keys(state.data[0])).toEqual([
      'sides',
      'border color',
      'fill color',
      'background color',
      'size',
      'shape',
    ]);
    expect(state.labelColumn).toBe('shape');
  });

  test('jeans is 80 clean rows with a numerical label', () => {
    const state = load('jeans');

    expect(state.data.length).toBe(80);
    expect(state.removedRowsCount).toBe(0);
    expect(state.labelColumn).toBe('Price in dollars');
    expect(state.selectedFeatures.length).toBe(13);
  });
});

describe('KNN characterization: shapes_v1_toy, a categorical label', () => {
  test('records every feature selected', () => {
    const state = load('shapes_v1_toy');
    const saved = getTrainedModelDataToSave(state);

    expect(state.kValue).toBe(1);
    expect(getPercentCorrect(state)).toBe('90.00');
    expect(saved.selectedTrainer).toBe('knnClassify');
    expect(saved.kValue).toBe(1);
    // Asserted here to prove `load` mirrors a level rather than a user upload;
    // `datasetDetails.test.js` covers the flag itself.
    expect(saved.datasetDetails.isUserUploaded).toBe(false);
    expect(Object.keys(saved).sort()).toEqual(SAVED_MODEL_KEYS);
    expect(state.accuracyCheckExamples.length).toBe(10);
    expect(state.accuracyCheckLabels).toEqual([1, 0, 1, 1, 2, 1, 1, 1, 2, 1]);
    expect(state.accuracyCheckPredictedLabels).toEqual([
      1, 0, 1, 1, 2, 1, 2, 1, 2, 1,
    ]);
  });

  test('records the accuracy the shapes level requires', () => {
    // `sides` fixes `shape` in this dataset: 0 circle, 3 triangle, 4 square.
    // The curriculum level that loads it sets requireAccuracy to 100, so this
    // number is the one that decides whether a student can continue.
    const state = load('shapes_v1_toy', ['sides']);

    expect(getPercentCorrect(state)).toBe('100.00');
    expect(state.kValue).toBe(1);
  });

  test('records a sweep that does not choose the smallest k', () => {
    const state = load('shapes_v1_toy', [
      'sides',
      'border color',
      'fill color',
    ]);

    expect(state.kValue).toBe(7);
    expect(getPercentCorrect(state)).toBe('100.00');
  });
});

describe('KNN characterization: jeans, a numerical label', () => {
  test('records the chosen k, the accuracy, and the predictions', () => {
    const state = load('jeans');
    const saved = getTrainedModelDataToSave(state);

    // A numerical label under 100 rows takes the minimal k, without a sweep.
    expect(state.kValue).toBe(1);
    expect(saved.selectedTrainer).toBe('knnRegress');
    expect(getPercentCorrect(state)).toBe('62.50');
    expect(state.accuracyCheckLabels).toEqual([
      48, 48, 58, 48, 89.95, 92.95, 94.95, 94.95,
    ]);
    // Every prediction is a price the model has already seen, because KNN
    // returns a training label rather than a value between two of them.
    expect(state.accuracyCheckPredictedLabels).toEqual([
      59.5, 98, 59.95, 59.95, 99, 99, 49.95, 78,
    ]);
  });

  test('records that the 13 features are unscaled', () => {
    const state = load('jeans');

    // Nothing normalizes a feature, so `Cotton contents` (0-100) and the pocket
    // measurements (single digits) contribute to the distance at their own
    // scale. A trainer that scales features would move the accuracy above.
    expect(state.selectedFeatures).toContain('Cotton contents');
    expect(state.selectedFeatures).toContain('Front rivet height');
    expect(getPercentCorrect(state)).toBe('62.50');
  });
});

describe('KNN characterization: save and reload', () => {
  test('a serialized model reloads and predicts identically', () => {
    const state = load('shapes_v1_toy');
    const model = state.trainedModel;
    const rows = state.accuracyCheckExamples;

    // JSON.parse(JSON.stringify(...)) is what the save path does to the model,
    // so the reload has to survive it.
    const json = JSON.parse(JSON.stringify(model.toJSON()));
    const reloaded = KNN.load(json);

    expect(Object.keys(json).sort()).toEqual([
      'classes',
      'isEuclidean',
      'k',
      'kdTree',
      'name',
    ]);
    expect(reloaded.predict(rows)).toEqual(model.predict(rows));
    expect(reloaded.predict(rows)).toEqual([1, 0, 1, 1, 2, 1, 2, 1, 2, 1]);
  });
});
