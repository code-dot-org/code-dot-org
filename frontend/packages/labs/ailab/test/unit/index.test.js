import {act} from '@testing-library/react';

import I18n from '../../src/i18n';
import {initAll, loadLevel, startOver, unmount} from '../../src/index';
import {
  setAccuracyCheckExamples,
  setCurrentPanel,
  setHistoricResult,
  setLabelColumn,
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
  });

  test('counts the reset, so the training data context clears', () => {
    const before = store.getState().resetCount;

    startOver();

    expect(store.getState().resetCount).toBe(before + 1);
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

// The component suites render panels directly, so only this reaches the
// provider nesting that mount() sets up.
describe('mount', () => {
  test('renders the app under the training data provider', () => {
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);

    act(() => {
      initAll({
        assetPath: './',
        onContinue: () => {},
        saveTrainedModel: () => {},
      });
    });

    expect(root.querySelector('#train-panel')).not.toBeNull();

    act(() => unmount());
    root.remove();
  });
});
