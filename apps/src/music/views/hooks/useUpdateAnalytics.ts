import {useEffect} from 'react';

import {getCurrentLevel} from '@cdo/apps/code-studio/progressReduxSelectors';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {Channel, LevelProperties} from '@cdo/apps/lab2/types';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import AnalyticsReporter from '../../analytics/AnalyticsReporter';

/**
 * A hook for updating the {@link AnalyticsReporter} when relevant redux state changes and attaching callbacks
 * to browser and lifecycle events.
 */
function useUpdateAnalytics(analyticsReporter: AnalyticsReporter) {
  /**
   * Effect that runs on initial mount
   *   - Starts a new analytics session.
   *   - Attaches lifecycle event listeners to start and end sessions when the level changes.
   *   - Attaches a 'beforeunload' event listener to end the session when the user navigates away from the page.
   */
  useEffect(() => {
    analyticsReporter.startSession();

    const startSession = async (
      levelProperties: LevelProperties,
      channel: Channel | undefined
    ) => {
      if (levelProperties.appName !== 'music') {
        return;
      }

      await analyticsReporter.startSession();
      analyticsReporter.setProjectProperty(
        'levelType',
        levelProperties.isProjectLevel ? 'Standalone Project' : 'Level'
      );
      analyticsReporter.setProjectProperty('channelId', channel?.id);
    };

    const endSession = () => {
      if (analyticsReporter.isSessionInProgress()) {
        analyticsReporter.endSession();
      }
    };

    // Add lifecycle event listeners to start and end sessions.
    const lifecycleNotifier = Lab2Registry.getInstance().getLifecycleNotifier();
    lifecycleNotifier.addListener(
      LifecycleEvent.LevelLoadCompleted,
      startSession
    );

    lifecycleNotifier.addListener(
      LifecycleEvent.LevelChangeRequested,
      endSession
    );

    // Also attach a listener to end the session if necessary when the level is reloaded without
    // changing levels, which can happen when the view as user is changed via the Teacher Panel.
    lifecycleNotifier.addListener(LifecycleEvent.LevelLoadStarted, endSession);

    // TODO: the 'beforeunload' callback is advised against as it is not guaranteed to fire on mobile browsers. However,
    // we need a way of reporting analytics when the user navigates away from the page. Check with Amplitude for the
    // correct approach.
    window.addEventListener('beforeunload', endSession);

    return () => {
      window.removeEventListener('beforeunload', endSession);
      lifecycleNotifier.removeListener(
        LifecycleEvent.LevelLoadCompleted,
        startSession
      );
      lifecycleNotifier.removeListener(
        LifecycleEvent.LevelChangeRequested,
        endSession
      );
      lifecycleNotifier.removeListener(
        LifecycleEvent.LevelLoadStarted,
        endSession
      );
    };
  }, [analyticsReporter]);

  const sessionInProgress = analyticsReporter.isSessionInProgress();

  // Update user and project properties whenever they change.

  const {userId, userType, signInState} = useAppSelector(
    state => state.currentUser
  );
  useEffect(() => {
    sessionInProgress &&
      analyticsReporter.setUserProperties(userId, userType, signInState);
  }, [analyticsReporter, sessionInProgress, userId, userType, signInState]);

  const channelId = useAppSelector(state => state.lab.channel?.id);
  useEffect(() => {
    sessionInProgress &&
      analyticsReporter.setProjectProperty('channelId', channelId);
  }, [sessionInProgress, channelId, analyticsReporter]);

  const levelType = useAppSelector(state =>
    state.lab.levelProperties?.isProjectLevel ? 'Standalone Project' : 'Level'
  );
  useEffect(() => {
    sessionInProgress &&
      analyticsReporter.setProjectProperty('levelType', levelType);
  }, [sessionInProgress, levelType, analyticsReporter]);

  const viewMode = useAppSelector(state => {
    const isReadOnly = isReadOnlyWorkspace(state);
    const isPlayView = state.lab.isShareView;
    return isPlayView ? 'Share' : isReadOnly ? 'View' : 'Edit';
  });
  useEffect(() => {
    sessionInProgress && analyticsReporter.setProjectProperty('mode', viewMode);
  }, [sessionInProgress, viewMode, analyticsReporter]);

  const levelPath = useAppSelector(state => getCurrentLevel(state)?.path);
  useEffect(() => {
    sessionInProgress &&
      analyticsReporter.setProjectProperty('levelPath', levelPath);
  }, [sessionInProgress, levelPath, analyticsReporter]);

  const scriptName =
    useAppSelector(state => state.progress.scriptName) || undefined;
  useEffect(() => {
    sessionInProgress &&
      analyticsReporter.setProjectProperty('scriptName', scriptName);
  }, [sessionInProgress, scriptName, analyticsReporter]);

  const packId = useAppSelector(state => state.music.packId || undefined);
  useEffect(() => {
    sessionInProgress && analyticsReporter.setSelectedPack(packId);
  }, [sessionInProgress, packId, analyticsReporter]);
}

export default useUpdateAnalytics;
