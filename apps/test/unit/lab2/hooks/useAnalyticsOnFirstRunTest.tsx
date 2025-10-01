import {act, renderHook} from '@testing-library/react-hooks';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import {useAnalyticsOnFirstRun} from '@cdo/apps/lab2/hooks/useAnalyticsOnFirstRun';
import lab2System, {setHasRun} from '@cdo/apps/lab2/redux/systemRedux';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

jest.mock('@cdo/apps/metrics/AnalyticsReporter');
const mockAnalyticsReporter = analyticsReporter as jest.Mocked<
  typeof analyticsReporter
>;

const mockCurrentUser = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: any = {signInState: 'signedIn'},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: any
) => state;
const mockProgress = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: any = {scriptName: 'test-script'},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: any
) => state;

interface LevelProperties {
  isProjectLevel?: boolean;
  id?: number;
  name?: string;
}

const defaultLevelProperties: LevelProperties = {
  isProjectLevel: false,
  id: 123,
  name: 'Test Level',
};

const projectLevelProperties: LevelProperties = {
  isProjectLevel: true,
  id: 456,
  name: 'Project Level',
};

const differentLevelProperties: LevelProperties = {
  isProjectLevel: false,
  id: 789,
  name: 'Different Level',
};

describe('useAnalyticsOnFirstRun', () => {
  let store: Store;

  beforeEach(() => {
    stubRedux();
    registerReducers({
      lab2System,
      currentUser: mockCurrentUser,
      progress: mockProgress,
    });
    store = getStore();
    jest.clearAllMocks();
  });

  afterEach(() => {
    restoreRedux();
  });

  const renderHookWithRedux = (levelProperties: LevelProperties) => {
    const wrapper = ({children}: {children: React.ReactNode}) => (
      <Provider store={store}>{children}</Provider>
    );

    return renderHook(() => useAnalyticsOnFirstRun(levelProperties), {
      wrapper,
    });
  };

  describe('Initial State Tests', () => {
    it('does not trigger analytics when hasRun is false initially', () => {
      renderHookWithRedux(defaultLevelProperties);

      expect(mockAnalyticsReporter.sendEvent).not.toHaveBeenCalled();
    });

    it('hook initializes without errors', () => {
      const {result} = renderHookWithRedux(defaultLevelProperties);

      expect(result.error).toBeUndefined();
      expect(mockAnalyticsReporter.sendEvent).not.toHaveBeenCalled();
    });
  });

  describe('First Run Analytics Tests', () => {
    it('logs LEVEL_ACTIVITY event when isProjectLevel is false', () => {
      renderHookWithRedux(defaultLevelProperties);

      act(() => {
        store.dispatch(setHasRun(true));
      });

      expect(mockAnalyticsReporter.sendEvent).toHaveBeenCalledWith(
        EVENTS.LEVEL_ACTIVITY,
        {
          signedIn: 'signedIn',
          unitName: 'test-script',
          levelId: 123,
          levelName: 'Test Level',
        }
      );
      expect(mockAnalyticsReporter.sendEvent).toHaveBeenCalledTimes(1);
    });

    it('logs PROJECT_ACTIVITY event when isProjectLevel is true', () => {
      renderHookWithRedux(projectLevelProperties);

      act(() => {
        store.dispatch(setHasRun(true));
      });

      expect(mockAnalyticsReporter.sendEvent).toHaveBeenCalledWith(
        EVENTS.PROJECT_ACTIVITY,
        {
          signedIn: 'signedIn',
          unitName: 'test-script',
          levelId: 456,
          levelName: 'Project Level',
        }
      );
      expect(mockAnalyticsReporter.sendEvent).toHaveBeenCalledTimes(1);
    });

    it('includes complete payload with all required fields', () => {
      renderHookWithRedux(defaultLevelProperties);

      act(() => {
        store.dispatch(setHasRun(true));
      });

      expect(mockAnalyticsReporter.sendEvent).toHaveBeenCalledWith(
        EVENTS.LEVEL_ACTIVITY,
        expect.objectContaining({
          signedIn: expect.any(String),
          unitName: expect.any(String),
          levelId: expect.any(Number),
          levelName: expect.any(String),
        })
      );
    });
  });

  describe('Duplicate Prevention Tests', () => {
    it('ensures analytics fires exactly once even if hasRun toggles multiple times', () => {
      renderHookWithRedux(defaultLevelProperties);

      act(() => {
        store.dispatch(setHasRun(true));
      });

      act(() => {
        store.dispatch(setHasRun(false));
      });

      act(() => {
        store.dispatch(setHasRun(true));
      });

      expect(mockAnalyticsReporter.sendEvent).toHaveBeenCalledTimes(1);
    });

    it('verifies hasLoggedRef prevents duplicate events', () => {
      renderHookWithRedux(defaultLevelProperties);

      // Trigger multiple times rapidly
      act(() => {
        store.dispatch(setHasRun(true));
        store.dispatch(setHasRun(true));
        store.dispatch(setHasRun(true));
      });

      expect(mockAnalyticsReporter.sendEvent).toHaveBeenCalledTimes(1);
    });
  });

  describe('Level Change Reset Tests', () => {
    it('resets logging flag when levelProperties.id changes', () => {
      renderHookWithRedux(defaultLevelProperties);

      act(() => {
        store.dispatch(setHasRun(true));
      });

      expect(mockAnalyticsReporter.sendEvent).toHaveBeenCalledTimes(1);

      act(() => {
        store.dispatch(setHasRun(false));
      });

      renderHookWithRedux(differentLevelProperties);

      act(() => {
        store.dispatch(setHasRun(true));
      });

      expect(mockAnalyticsReporter.sendEvent).toHaveBeenCalledTimes(2);
      expect(mockAnalyticsReporter.sendEvent).toHaveBeenLastCalledWith(
        EVENTS.LEVEL_ACTIVITY,
        {
          signedIn: 'signedIn',
          unitName: 'test-script',
          levelId: 789,
          levelName: 'Different Level',
        }
      );
    });

    it('can log again for new level after reset', () => {
      renderHookWithRedux(defaultLevelProperties);

      act(() => {
        store.dispatch(setHasRun(true));
      });

      renderHookWithRedux(projectLevelProperties);

      act(() => {
        store.dispatch(setHasRun(false));
        store.dispatch(setHasRun(true));
      });

      expect(mockAnalyticsReporter.sendEvent).toHaveBeenCalledTimes(2);

      expect(mockAnalyticsReporter.sendEvent).toHaveBeenLastCalledWith(
        EVENTS.PROJECT_ACTIVITY,
        expect.objectContaining({
          levelId: 456,
          levelName: 'Project Level',
        })
      );
    });
  });
});
