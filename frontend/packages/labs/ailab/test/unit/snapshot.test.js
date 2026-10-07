import {ColumnTypes, TestDataLocations} from '../../src/constants';
import {
  addSelectedFeature,
  resetState,
  setColumnsByDataType,
  setCurrentPanel,
  setDatasetId,
  setHighlightColumn,
  setImportedData,
  setLabelColumn,
  setMode,
  setReserveLocation,
  setSaveStatus,
  setTrainedModelDetail,
} from '../../src/redux';
import {
  restoreSnapshot,
  selectSnapshot,
  startOverSnapshot,
} from '../../src/snapshot';
import {store} from '../../src/store';
import train from '../../src/train';

import {ANIMAL_COLUMNS, ANIMALS} from './levelStore';

// Every row differs, so different test splits hold different rows.
const NUMBERED = Array.from({length: 30}, (_, index) => ({
  kind: `kind${index % 3}`,
  size: String(index),
}));
const NUMBERED_COLUMNS = {
  kind: ColumnTypes.CATEGORICAL,
  size: ColumnTypes.NUMERICAL,
};

function loadDataset(
  mode,
  data = ANIMALS,
  columns = ANIMAL_COLUMNS,
  datasetId = 'animals',
) {
  store.dispatch(resetState());
  train.reset();
  store.dispatch(setMode(mode));
  store.dispatch(
    setReserveLocation(
      mode?.randomizeTestData
        ? TestDataLocations.RANDOM
        : TestDataLocations.END,
    ),
  );
  store.dispatch(setDatasetId(datasetId));
  store.dispatch(setImportedData(data, false));
  Object.entries(columns).forEach(([column, type]) =>
    store.dispatch(setColumnsByDataType(column, type)),
  );
}

function trainOn(label, features) {
  store.dispatch(setLabelColumn(label));
  features.forEach(feature => store.dispatch(addSelectedFeature(feature)));
  train.init(store);
  train.onClickTrain();
}

describe('selectSnapshot', () => {
  beforeEach(() => loadDataset(undefined));

  test('keeps its identity across changes that are not saved', () => {
    const before = selectSnapshot(store.getState());

    store.dispatch(setHighlightColumn('legs'));

    expect(selectSnapshot(store.getState())).toBe(before);
  });

  test('records a model trained on the current columns', () => {
    trainOn('animal', ['legs']);

    expect(selectSnapshot(store.getState())).toMatchObject({
      datasetId: 'animals',
      labelColumn: 'animal',
      selectedFeatures: ['legs'],
      trained: true,
    });
  });

  test('does not count a model trained on other columns', () => {
    trainOn('animal', ['legs']);
    store.dispatch(setLabelColumn('legs'));

    expect(selectSnapshot(store.getState()).trained).toBe(false);
  });
});

describe('restoreSnapshot', () => {
  let saved;

  beforeEach(() => {
    loadDataset(undefined);
    trainOn('animal', ['legs']);
    store.dispatch(setCurrentPanel('results'));
    store.dispatch(setTrainedModelDetail('name', 'Legs', false));
    saved = selectSnapshot(store.getState());
    loadDataset(undefined);
  });

  test('retrains the saved model and returns to its panel', () => {
    restoreSnapshot(saved);

    const state = store.getState();
    expect(state.labelColumn).toBe('animal');
    expect(state.selectedFeatures).toEqual(['legs']);
    expect(state.trainedModel).toBeDefined();
    expect(state.historicResults).toEqual(saved.historicResults);
    expect(state.trainedModelDetails).toEqual({name: 'Legs'});
    expect(state.currentPanel).toBe('results');
  });

  test('does not add a result for the retraining', () => {
    restoreSnapshot(saved);

    expect(store.getState().historicResults).toHaveLength(1);
  });

  test('restores a successful model save', () => {
    restoreSnapshot({...saved, modelSaved: true});

    expect(store.getState().saveStatus).toBe('success');
  });

  test('ignores a snapshot of another dataset', () => {
    restoreSnapshot({...saved, datasetId: 'other'});

    expect(store.getState().labelColumn).toBeUndefined();
    expect(store.getState().historicResults).toEqual([]);
  });

  test('drops columns the dataset no longer has', () => {
    restoreSnapshot({...saved, selectedFeatures: ['legs', 'wings']});

    expect(store.getState().selectedFeatures).toEqual(['legs']);
  });

  test('returns to the dataset without a model to show', () => {
    restoreSnapshot({...saved, trained: false});

    expect(store.getState().trainedModel).toBeUndefined();
    expect(store.getState().currentPanel).toBe('datasetView');
  });

  test('returns to the dataset from a panel that is no longer available', () => {
    loadDataset({hideSave: true});

    restoreSnapshot({...saved, currentPanel: 'saveModel'});

    expect(store.getState().currentPanel).toBe('datasetView');
  });
});

describe('random test split', () => {
  test('a restored model is tested on the same rows', () => {
    const mode = {randomizeTestData: true};
    loadDataset(mode, NUMBERED, NUMBERED_COLUMNS, 'numbered');
    trainOn('kind', ['size']);
    const {accuracyCheckExamples, historicResults} = store.getState();
    const saved = selectSnapshot(store.getState());

    loadDataset(mode, NUMBERED, NUMBERED_COLUMNS, 'numbered');
    restoreSnapshot(saved);

    expect(saved.splitSeed).toEqual(expect.any(Number));
    expect(store.getState().accuracyCheckExamples).toEqual(
      accuracyCheckExamples,
    );
    expect(store.getState().historicResults).toEqual(historicResults);
  });
});

describe('startOverSnapshot', () => {
  test('keeps only the past results', () => {
    loadDataset(undefined);
    trainOn('animal', ['legs']);
    store.dispatch(setSaveStatus('success'));

    expect(startOverSnapshot(store.getState())).toMatchObject({
      datasetId: 'animals',
      labelColumn: undefined,
      selectedFeatures: [],
      trained: false,
      modelSaved: false,
      historicResults: store.getState().historicResults,
    });
  });
});
