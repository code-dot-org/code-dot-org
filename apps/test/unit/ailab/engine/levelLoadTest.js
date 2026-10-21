import I18n from '@cdo/apps/ailab/engine/i18n';
import {loadLevel, startOver} from '@cdo/apps/ailab/engine/levelLoad';
import {
  setAccuracyCheckExamples,
  setCurrentPanel,
} from '@cdo/apps/ailab/engine/redux';
import {store} from '@cdo/apps/ailab/engine/store';

jest.mock('@cdo/apps/ailab/engine/csvReaderWrapper');
jest.mock('@cdo/apps/ailab/engine/jsonReaderWrapper');

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

    expect(store.getState().currentPanel).toBe('selectDataset');
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

  test('reserves random rows for testing unless the mode asks for the last rows', () => {
    loadLevel(undefined);
    expect(store.getState().reserveLocation).toBe('random');

    loadLevel({reserveLastRows: true});
    expect(store.getState().reserveLocation).toBe('end');
  });
});
