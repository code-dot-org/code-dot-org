import {act} from '@testing-library/react';

import I18n from '../../src/i18n';
import {initAll, loadLevel, startOver, unmount} from '../../src/index';
import {setAccuracyCheckExamples, setCurrentPanel} from '../../src/redux';
import {store} from '../../src/store';

vi.mock('../../src/csvReaderWrapper');
vi.mock('../../src/jsonReaderWrapper');

beforeEach(() => I18n.initI18n());
afterEach(() => I18n.reset());

describe('startOver', () => {
  beforeEach(() => {
    loadLevel(undefined);
    store.dispatch(setCurrentPanel('results'));
    store.dispatch(setAccuracyCheckExamples([[4]]));
  });

  test('asks the reset to keep the results already earned', () => {
    startOver();

    expect(store.getState().resetKeepsHistoricResults).toBe(true);
  });

  test('resets everything else to the start of the level', () => {
    startOver();

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
  test('asks the reset to drop the previous level’s results', () => {
    startOver();

    loadLevel(undefined);

    expect(store.getState().resetKeepsHistoricResults).toBe(false);
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
