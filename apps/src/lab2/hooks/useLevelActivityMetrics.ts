import {useCallback, useEffect, useRef} from 'react';

import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
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
  const signedIn =
    useAppSelector(state => state.currentUser.signInState) === 'SignedIn' ||
    false;
  const scriptName = useAppSelector(state => state.progress.scriptName);

  const hasLoggedRef = useRef(false);

  useEffect(() => {
    hasLoggedRef.current = false;
  }, [levelProperties.id]);

  const logLevelActivity = useCallback(() => {
    if (hasLoggedRef.current) {
      return;
    }
    if (levelProperties.isProjectLevel) {
      return;
    }

    hasLoggedRef.current = true;

    sendLab2AnalyticsEvent(EVENTS.LEVEL_ACTIVITY, {
      signedIn: signedIn,
      unitName: scriptName ?? '',
      levelId: levelProperties.id,
      levelName: levelProperties.name,
    });
  }, [
    levelProperties.id,
    levelProperties.isProjectLevel,
    levelProperties.name,
    signedIn,
    scriptName,
  ]);

  return logLevelActivity;
}
