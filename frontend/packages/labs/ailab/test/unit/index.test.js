import {act} from '@testing-library/react';

import {parseCSV} from '../../src/csvReaderWrapper';
import I18n from '../../src/i18n';
import {loadLevel, mount, startOver, unmount} from '../../src/index';
import {
  setAccuracyCheckExamples,
  setColumnsByDataType,
  setCurrentPanel,
  setHistoricResult,
  setImportedData,
  setLabelColumn,
  setTrainedModel,
} from '../../src/redux';
import {SNAPSHOT_VERSION} from '../../src/snapshot';
import {store} from '../../src/store';

import {ANIMAL_COLUMNS, ANIMALS} from './levelStore';

vi.mock('../../src/csvReaderWrapper');
vi.mock('../../src/jsonReaderWrapper');

const ZOO_MODE = {datasets: ['zoo']};

const SAVED_WORK = {
  version: SNAPSHOT_VERSION,
  datasetId: 'zoo',
  labelColumn: 'animal',
  selectedFeatures: ['legs'],
  trained: false,
  splitSeed: undefined,
  modelSaved: false,
  trainedModelDetails: {},
  historicResults: [
    {label: 'animal', features: [], accuracy: '50.00', correct: 1, total: 2},
  ],
  currentPanel: 'datasetView',
};

function loadAnimals() {
  store.dispatch(setImportedData(ANIMALS, false));
  Object.entries(ANIMAL_COLUMNS).forEach(([column, type]) =>
    store.dispatch(setColumnsByDataType(column, type)),
  );
  return Promise.resolve();
}

beforeEach(() => I18n.initI18n());
afterEach(() => I18n.reset());

describe('startOver', () => {
  beforeEach(() => {
    loadLevel(undefined);
    store.dispatch(setLabelColumn('animal'));
    store.dispatch(setCurrentPanel('results'));
    store.dispatch(setAccuracyCheckExamples([[4]]));
    store.dispatch(setTrainedModel({}));
    store.dispatch(setHistoricResult('animal', ['legs'], '80.00'));
  });

  test('keeps the results of models already trained', () => {
    startOver();

    expect(store.getState().historicResults).toEqual([
      {label: 'animal', features: ['legs'], accuracy: '80.00'},
    ]);
  });

  test('resets everything else to the start of the level', () => {
    startOver();

    expect(store.getState().labelColumn).toBeUndefined();
    expect(store.getState().currentPanel).toBe('datasetView');
    expect(store.getState().accuracyCheckExamples).toEqual([]);
    expect(store.getState().trainedModel).toBeUndefined();
  });

  test("reloads the level's mode", () => {
    loadLevel({hideSave: true});

    startOver();

    expect(store.getState().mode).toEqual({hideSave: true});
  });
});

describe('loadLevel', () => {
  test('clears the results of the previous level', () => {
    store.dispatch(setHistoricResult('animal', ['legs'], '80.00'));

    loadLevel(undefined);

    expect(store.getState().historicResults).toEqual([]);
  });
});

describe('saving work', () => {
  let onStateChange;

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    vi.mocked(parseCSV).mockImplementation(loadAnimals);
    onStateChange = vi.fn();
    act(() =>
      mount({
        assetPath: '/',
        onContinue: () => {},
        saveTrainedModel: () => {},
        onStateChange,
      }),
    );
  });

  afterEach(() => {
    act(() => unmount());
    vi.mocked(parseCSV).mockReset();
  });

  test('restores saved work without reporting it as a change', async () => {
    await act(() => loadLevel(ZOO_MODE, SAVED_WORK));

    expect(store.getState().labelColumn).toBe('animal');
    expect(store.getState().selectedFeatures).toEqual(['legs']);
    expect(onStateChange).not.toHaveBeenCalled();
  });

  test('reports changes the student makes', async () => {
    await act(() => loadLevel(ZOO_MODE));

    act(() => store.dispatch(setLabelColumn('animal')));

    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({datasetId: 'zoo', labelColumn: 'animal'}),
    );
  });

  test('reports the cleared work after Start Over', async () => {
    await act(() => loadLevel(ZOO_MODE, SAVED_WORK));

    await act(() => startOver());

    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        labelColumn: undefined,
        selectedFeatures: [],
        historicResults: SAVED_WORK.historicResults,
      }),
    );
  });

  test('a load overtaken by a newer one does not restore its work', async () => {
    let finishFirstLoad;
    vi.mocked(parseCSV).mockImplementationOnce(
      () => new Promise(resolve => (finishFirstLoad = resolve)),
    );
    const firstLoad = loadLevel(ZOO_MODE, SAVED_WORK);

    await act(() => loadLevel(ZOO_MODE));
    finishFirstLoad();
    await act(() => firstLoad);

    expect(store.getState().labelColumn).toBeUndefined();
  });
});
