import {useCallback, useEffect, useRef} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {LevelProperties} from '../types';

/**
 * Custom hook that provides a callback to log LEVEL_ACTIVITY or PROJECT_ACTIVITY
 * analytics events when a user performs their first activity in a Lab2 environment.
 *
 * This hook returns a callback function that labs should call when activity occurs.
 * The callback will log exactly once per level, preventing duplicate events.
 *
 * @param levelProperties - Level properties containing isProjectLevel, id, and name
 * @returns A callback function to invoke when level activity occurs
 *
 * @example
 * const logLevelActivity = useLevelActivityMetrics(levelProperties);
 * // Call when user performs their first activity
 * logLevelActivity();
 */
export function useLevelActivityMetrics(
  levelProperties: LevelProperties
): () => void {
  const signedIn = useAppSelector(state => state.currentUser.signInState);
  const scriptName = useAppSelector(state => state.progress.scriptName);

  const hasLoggedRef = useRef(false);

  useEffect(() => {
    hasLoggedRef.current = false;
  }, [levelProperties.id]);

  const logLevelActivity = useCallback(() => {
    if (hasLoggedRef.current) {
      return;
    }

    hasLoggedRef.current = true;

    const eventName = levelProperties.isProjectLevel
      ? EVENTS.PROJECT_ACTIVITY
      : EVENTS.LEVEL_ACTIVITY;

    analyticsReporter.sendEvent(eventName, {
      signedIn,
      unitName: scriptName,
      levelId: levelProperties.id,
      levelName: levelProperties.name,
      appName: levelProperties.appName,
    });
  }, [
    levelProperties.isProjectLevel,
    levelProperties.id,
    levelProperties.name,
    levelProperties.appName,
    signedIn,
    scriptName,
  ]);

  return logLevelActivity;
}
