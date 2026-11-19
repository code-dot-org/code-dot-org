import {useCallback, useEffect, useRef} from 'react';

import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {LevelProperties} from '../types';

import {useLevelActivityMetrics} from './useLevelActivityMetrics';

// Flat: the analytics service cannot filter or group by a nested key.
export type LevelSessionDetails = Record<string, string | number | boolean>;

export interface LevelSessionMetricsOptions {
  /** Nothing is sent while this is false. Defaults to true. */
  enabled?: boolean;
  /** Lab-specific values to send with the session-end event. */
  getSessionDetails?: () => LevelSessionDetails;
}

export interface LevelSessionMetrics {
  /** Call on any student action. Sends LEVEL_ACTIVITY at the first one. */
  reportActivity: () => void;
  /** Sends LEVEL_COMPLETED with `details`, once per visit. */
  reportCompleted: (details?: LevelSessionDetails) => void;
}

const newVisit = () => ({
  startedAt: Date.now(),
  active: false,
  completed: false,
  ended: false,
});

/**
 * Analytics for one visit to a level: LEVEL_ACTIVITY at the student's first
 * action, LEVEL_COMPLETED when the lab reports completion, and
 * LEVEL_SESSION_END when the visit ends, if the student did anything. A
 * visit ends when the level changes, the lab unmounts, or the page is left,
 * whichever comes first.
 *
 * Nothing is sent for a standalone project, which LEVEL_ACTIVITY leaves out
 * as well.
 */
export function useLevelSessionMetrics(
  levelProperties: LevelProperties,
  options: LevelSessionMetricsOptions = {}
): LevelSessionMetrics {
  const {enabled = true, getSessionDetails} = options;
  const logLevelActivity = useLevelActivityMetrics(levelProperties);
  const unitName = useAppSelector(state => state.progress.scriptName) ?? '';
  const {id: levelId, name: levelName, isProjectLevel} = levelProperties;

  const visit = useRef(newVisit());
  // Read through a ref so the returned functions never change identity.
  const latest = useRef({
    logLevelActivity,
    getSessionDetails,
    unitName,
    counted: enabled && !isProjectLevel,
    level: {levelId, levelName},
  });
  latest.current = {
    logLevelActivity,
    getSessionDetails,
    unitName,
    counted: enabled && !isProjectLevel,
    level: {levelId, levelName},
  };

  const reportActivity = useCallback(() => {
    if (!latest.current.counted) {
      return;
    }
    visit.current.active = true;
    latest.current.logLevelActivity();
  }, []);

  const reportCompleted = useCallback((details: LevelSessionDetails = {}) => {
    if (!latest.current.counted || visit.current.completed) {
      return;
    }
    visit.current.completed = true;
    sendLab2AnalyticsEvent(EVENTS.LEVEL_COMPLETED, {
      ...details,
      unitName: latest.current.unitName,
      ...latest.current.level,
    });
  }, []);

  useEffect(() => {
    const thisVisit = newVisit();
    visit.current = thisVisit;
    // Not read from `latest`, which describes the next level by cleanup time.
    const level = {levelId, levelName};
    const end = () => {
      if (!thisVisit.active || thisVisit.ended) {
        return;
      }
      thisVisit.ended = true;
      sendLab2AnalyticsEvent(EVENTS.LEVEL_SESSION_END, {
        ...latest.current.getSessionDetails?.(),
        durationSeconds: Math.round((Date.now() - thisVisit.startedAt) / 1000),
        completed: thisVisit.completed,
        unitName: latest.current.unitName,
        ...level,
      });
    };
    // Mobile browsers often skip beforeunload; capture runs this pagehide
    // listener before the analytics client's, which sends the queue.
    window.addEventListener('beforeunload', end);
    window.addEventListener('pagehide', end, true);
    return () => {
      window.removeEventListener('beforeunload', end);
      window.removeEventListener('pagehide', end, true);
      end();
    };
  }, [levelId, levelName]);

  return {reportActivity, reportCompleted};
}
