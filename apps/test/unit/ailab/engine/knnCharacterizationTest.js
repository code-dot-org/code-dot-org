/*
  Characterization tests for the KNN trainer, on the datasets the lab ships.

  These tests record what the lab does today. They do not say what it should do.
  Every expected value below was recorded from a run, not chosen by hand, so a
  failure here means a change of behavior and not necessarily a defect. If a
  later change moves one of these values, update it in the same commit and say
  why in the pull request description.

  The trainer interface work will refactor every file these tests touch, and this 
  suite is the check that it changes no behavior.

  The data comes from `static/skins/ailab/datasets`, which is what a level
  loads. The lab
  fetches those files over HTTP, so these tests read them from disk and then
  push them through the lab's own CSV cleaning and metadata handling.
*/
import fs from 'fs';
import KNN from 'ml-knn';
import path from 'path';

import {ColumnTypes, TestDataLocations} from '@cdo/apps/ailab/engine/constants';
import {parseCSV} from '@cdo/apps/ailab/engine/csvReaderWrapper';
import {getPercentCorrect} from '@cdo/apps/ailab/engine/helpers/accuracy';
import I18n from '@cdo/apps/ailab/engine/i18n';
import {
  resetState,
  setColumnsByDataType,
  setImportedMetadata,
  setReserveLocation,
  setSelectedCSV,
  setSelectedJSON,
} from '@cdo/apps/ailab/engine/redux';
import {getTrainedModelDataToSave} from '@cdo/apps/ailab/engine/selectors/saveSelectors';
import {store} from '@cdo/apps/ailab/engine/store';
import train from '@cdo/apps/ailab/engine/train';
import {initialProject} from '@cdo/apps/ailab/engine/types';

import {projectFromRun} from './renderWithProviders';

const DIR = path.join(__dirname, '../../../../static/skins/ailab/datasets');

const SAVED_MODEL_KEYS = [
  'datasetDetails',
  'featureNumberKey',
  'features',
  'hyperparameters',
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
    fs.readFileSync(path.join(DIR, `${id}.json`), 'utf8')
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
      setColumnsByDataType(field.id, field.type || ColumnTypes.CATEGORICAL)
    )
  );
  // Set explicitly rather than relying on the initial state, so a change of
  // default cannot silently make these tests non-deterministic.
  store.dispatch(setReserveLocation(TestDataLocations.END));

  const project = {
    ...initialProject,
    labelColumn: metadata.defaultLabelColumn,
    selectedFeatures:
      features ||
      Object.keys(store.getState().data[0]).filter(
        column => column !== metadata.defaultLabelColumn
      ),
  };

  train.init(store, project);
  const run = train.onClickTrain();
  return {
    state: store.getState(),
    trainedModel: run?.trainedModel,
    project: projectFromRun(project, run),
  };
}

/*
  `getTrainedModelDataToSave` reaches `getDatasetDetails`, which localizes the 
  dataset description and the two context fields, and `I18n.t` throws when 
  nothing has initialized it. 
*/
beforeAll(() => {
  I18n.initI18n();
});

afterAll(() => {
  I18n.reset();
});

/*
  Guards every number below. An edit to a shipped CSV changes the split and the
  accuracy, and this test says so directly instead of leaving a puzzle.
*/
describe('shipped dataset fingerprints', () => {
  test('shapes_v1_toy is 100 clean rows over 6 columns', () => {
    const {state, project} = load('shapes_v1_toy');

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
    expect(project.labelColumn).toBe('shape');
  });

  test('jeans is 80 clean rows with a numerical label', () => {
    const {state, project} = load('jeans');

    expect(state.data.length).toBe(80);
    expect(state.removedRowsCount).toBe(0);
    expect(project.labelColumn).toBe('Price in dollars');
    expect(project.selectedFeatures.length).toBe(13);
  });
});

describe('KNN characterization: shapes_v1_toy, a categorical label', () => {
  test('records every feature selected', () => {
    const {state, trainedModel, project} = load('shapes_v1_toy');
    const saved = getTrainedModelDataToSave(state, project, trainedModel);

    expect(project.hyperparameters).toEqual({k: 1});
    expect(getPercentCorrect(state, project)).toBe('90.00');
    expect(saved.selectedTrainer).toBe('knnClassify');
    expect(saved.hyperparameters).toEqual({k: 1});
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
    // The curriculum level that loads it sets requireAccuracy to 100, and lab2
    // keeps Continue disabled until the latest trained model reaches it.
    const {state, project} = load('shapes_v1_toy', ['sides']);

    expect(getPercentCorrect(state, project)).toBe('100.00');
    expect(project.hyperparameters).toEqual({k: 1});
  });

  test('records a sweep that does not choose the smallest k', () => {
    const {state, trainedModel, project} = load('shapes_v1_toy', [
      'sides',
      'border color',
      'fill color',
    ]);

    expect(project.hyperparameters).toEqual({k: 7});
    expect(getPercentCorrect(state, project)).toBe('100.00');

    const saved = getTrainedModelDataToSave(state, project, trainedModel);
    expect(saved.hyperparameters).toEqual({k: 7});
  });
});

describe('KNN characterization: jeans, a numerical label', () => {
  test('records the chosen k, the accuracy, and the predictions', () => {
    const {state, trainedModel, project} = load('jeans');
    const saved = getTrainedModelDataToSave(state, project, trainedModel);

    // A numerical label under 100 rows takes the minimal k, without a sweep.
    expect(project.hyperparameters).toEqual({k: 1});
    expect(saved.selectedTrainer).toBe('knnRegress');
    expect(saved.hyperparameters).toEqual({k: 1});
    expect(getPercentCorrect(state, project)).toBe('62.50');
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
    const {state, project} = load('jeans');

    // Nothing normalizes a feature, so `Cotton contents` (0-100) and the pocket
    // measurements (single digits) contribute to the distance at their own
    // scale. A trainer that scales features would move the accuracy above.
    expect(project.selectedFeatures).toContain('Cotton contents');
    expect(project.selectedFeatures).toContain('Front rivet height');
    expect(getPercentCorrect(state, project)).toBe('62.50');
  });
});

describe('KNN characterization: save and reload', () => {
  test('a serialized model reloads and predicts identically', () => {
    const {state, trainedModel: model} = load('shapes_v1_toy');
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
