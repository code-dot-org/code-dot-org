import {act, renderHook} from '@testing-library/react-hooks';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import {useLevelActivityMetrics} from '@cdo/apps/lab2/hooks/useLevelActivityMetrics';
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

describe('useLevelActivityMetrics', () => {
  let store: Store;

  beforeEach(() => {
    stubRedux();
    registerReducers({
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

    return renderHook(() => useLevelActivityMetrics(levelProperties), {
      wrapper,
    });
  };

  describe('Hook Return Value Tests', () => {
    it('returns a function', () => {
      const {result} = renderHookWithRedux(defaultLevelProperties);

      expect(typeof result.current).toBe('function');
    });

    it('does not trigger analytics when hook is initialized', () => {
      renderHookWithRedux(defaultLevelProperties);

      expect(mockAnalyticsReporter.sendEvent).not.toHaveBeenCalled();
    });

    it('hook initializes without errors', () => {
      const {result} = renderHookWithRedux(defaultLevelProperties);

      expect(result.error).toBeUndefined();
      expect(mockAnalyticsReporter.sendEvent).not.toHaveBeenCalled();
    });
  });

  describe('Callback Invocation Tests', () => {
    it('logs LEVEL_ACTIVITY event when callback is invoked for non-project level', () => {
      const {result} = renderHookWithRedux(defaultLevelProperties);

      act(() => {
        result.current();
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

    it('logs PROJECT_ACTIVITY event when callback is invoked for project level', () => {
      const {result} = renderHookWithRedux(projectLevelProperties);

      act(() => {
        result.current();
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
      const {result} = renderHookWithRedux(defaultLevelProperties);

      act(() => {
        result.current();
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
    it('ensures analytics fires exactly once even if callback is invoked multiple times', () => {
      const {result} = renderHookWithRedux(defaultLevelProperties);

      act(() => {
        result.current();
        result.current();
        result.current();
      });

      expect(mockAnalyticsReporter.sendEvent).toHaveBeenCalledTimes(1);
    });

    it('verifies hasLoggedRef prevents duplicate events', () => {
      const {result} = renderHookWithRedux(defaultLevelProperties);

      act(() => {
        result.current();
      });

      act(() => {
        result.current();
      });

      expect(mockAnalyticsReporter.sendEvent).toHaveBeenCalledTimes(1);
    });
  });

  describe('Level Change Reset Tests', () => {
    it('resets logging flag when levelProperties.id changes', () => {
      const {result: result1} = renderHookWithRedux(defaultLevelProperties);

      act(() => {
        result1.current();
      });

      expect(mockAnalyticsReporter.sendEvent).toHaveBeenCalledTimes(1);

      const wrapper = ({children}: {children: React.ReactNode}) => (
        <Provider store={store}>{children}</Provider>
      );

      const {result: result2} = renderHook(
        () => useLevelActivityMetrics(differentLevelProperties),
        {wrapper}
      );

      act(() => {
        result2.current();
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
      const {result: result1} = renderHookWithRedux(defaultLevelProperties);

      act(() => {
        result1.current();
      });

      const {result: result2} = renderHookWithRedux(projectLevelProperties);

      act(() => {
        result2.current();
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
