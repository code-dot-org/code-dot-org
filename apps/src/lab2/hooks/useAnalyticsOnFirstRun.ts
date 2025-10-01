import {useEffect, useRef} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

interface LevelProperties {
  isProjectLevel?: boolean;
  id?: number;
  name?: string;
}

/**
 * Custom hook that automatically logs LEVEL_ACTIVITY or PROJECT_ACTIVITY
 * analytics events when a user first runs their code in a Lab2 environment.
 *
 * This hook watches the lab2System.hasRun state and logs exactly once
 * when it transitions from false to true.
 *
 * @param levelProperties - Level properties containing isProjectLevel, id, and name
 */
export function useAnalyticsOnFirstRun(levelProperties: LevelProperties) {
  const hasRun = useAppSelector(state => state.lab2System.hasRun);
  const signedIn = useAppSelector(state => state.currentUser.signInState);
  const scriptName = useAppSelector(state => state.progress.scriptName);

  // Track whether we've already logged to prevent duplicate events
  const hasLoggedRef = useRef(false);

  useEffect(() => {
    // Log analytics when hasRun becomes true for the first time
    if (hasRun && !hasLoggedRef.current) {
      hasLoggedRef.current = true;

      const eventName = levelProperties.isProjectLevel
        ? EVENTS.PROJECT_ACTIVITY
        : EVENTS.LEVEL_ACTIVITY;

      analyticsReporter.sendEvent(eventName, {
        signedIn,
        unitName: scriptName,
        levelId: levelProperties.id,
        levelName: levelProperties.name,
      });
    }
  }, [
    hasRun,
    levelProperties.isProjectLevel,
    levelProperties.id,
    levelProperties.name,
    signedIn,
    scriptName,
  ]);

  // Reset flag when level changes
  useEffect(() => {
    hasLoggedRef.current = false;
  }, [levelProperties.id]);
}
