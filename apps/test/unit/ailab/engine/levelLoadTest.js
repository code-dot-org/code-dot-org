import I18n from '@cdo/apps/ailab/engine/i18n';
import {loadLevel} from '@cdo/apps/ailab/engine/levelLoad';
import {
  setAccuracyCheckExamples,
  setCurrentPanel,
} from '@cdo/apps/ailab/engine/redux';
import {store} from '@cdo/apps/ailab/engine/store';

jest.mock('@cdo/apps/ailab/engine/csvReaderWrapper');
jest.mock('@cdo/apps/ailab/engine/jsonReaderWrapper');

beforeEach(() => I18n.initI18n());
afterEach(() => I18n.reset());

describe('loadLevel', () => {
  beforeEach(() => {
    loadLevel(undefined);
    store.dispatch(setCurrentPanel('results'));
    store.dispatch(setAccuracyCheckExamples([[4]]));
  });

  test('resets the lab to the start of the level', () => {
    loadLevel(undefined);

    expect(store.getState().currentPanel).toBe('selectDataset');
    expect(store.getState().accuracyCheckExamples).toEqual([]);
  });

  test('counts the reset, so the contexts clear', () => {
    const before = store.getState().resetCount;

    loadLevel(undefined);

    expect(store.getState().resetCount).toBe(before + 1);
  });

  test("takes the level's mode", () => {
    loadLevel({hideSave: true});

    expect(store.getState().mode).toEqual({hideSave: true});
  });

  test('reserves random rows for testing unless the mode asks for the last rows', () => {
    loadLevel(undefined);
    expect(store.getState().reserveLocation).toBe('random');

    loadLevel({reserveLastRows: true});
    expect(store.getState().reserveLocation).toBe('end');
  });
});
