import I18n from '../../src/i18n';
import {loadLevel, startOver} from '../../src/index';
import {
  setAccuracyCheckExamples,
  setCurrentPanel,
  setHistoricResult,
  setLabelColumn,
  setTrainedModel,
} from '../../src/redux';
import {store} from '../../src/store';

vi.mock('../../src/csvReaderWrapper');
vi.mock('../../src/jsonReaderWrapper');

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
