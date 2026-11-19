import {useCallback, useEffect, useRef} from 'react';

import {useLevelActivityMetrics} from '@cdo/apps/lab2/hooks/useLevelActivityMetrics';
import {LevelProperties} from '@cdo/apps/lab2/types';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {ARROW_AND_SPACE_KEYS, isOnScreenGameKey} from './playBar';

export interface LevelAnalytics {
  reportActivity: () => void;
  /** Sends the level-complete event with `details`, once per visit. */
  reportCompleted: (details: Record<string, unknown>) => void;
}

/**
 * Analytics for one visit to a level: the shared Level Activity event at the
 * student's first action, an event when they complete the level, and an
 * event when the visit ends, if the student did anything. A visit runs from
 * this hook's mount to its unmount, or to the page unload if that comes
 * first.
 *
 * Nothing is sent while `enabled` is false, or for a standalone project,
 * which the shared event leaves out as well.
 */
export default function useLevelAnalytics(
  levelProperties: LevelProperties,
  playing: boolean,
  enabled: boolean
): LevelAnalytics {
  const logLevelActivity = useLevelActivityMetrics(levelProperties);
  const unitName = useAppSelector(state => state.progress.scriptName) ?? '';

  const visit = useRef({
    startedAt: Date.now(),
    active: false,
    completed: false,
    ended: false,
    keyboardPresses: 0,
    buttonPresses: 0,
  });
  // Read through a ref so that `send` and `counted` never change. The effect
  // that ends the visit depends on them, and its cleanup would end the visit
  // early if they did.
  const latest = useRef({logLevelActivity, levelProperties, unitName, enabled});
  latest.current = {logLevelActivity, levelProperties, unitName, enabled};

  const send = useCallback(
    (eventName: string, payload: Record<string, unknown>) => {
      const {levelProperties, unitName} = latest.current;
      analyticsReporter.sendEvent(
        eventName,
        {
          ...payload,
          unitName,
          levelId: levelProperties.id,
          levelName: levelProperties.name,
        },
        true
      );
    },
    []
  );

  const counted = useCallback(
    () =>
      latest.current.enabled && !latest.current.levelProperties.isProjectLevel,
    []
  );

  const reportActivity = useCallback(() => {
    if (!counted()) {
      return;
    }
    visit.current.active = true;
    latest.current.logLevelActivity();
  }, [counted]);

  const reportCompleted = useCallback(
    (details: Record<string, unknown>) => {
      if (!counted() || visit.current.completed) {
        return;
      }
      visit.current.completed = true;
      send(EVENTS.HOAI2026_LEVEL_COMPLETE, details);
    },
    [counted, send]
  );

  // p5 listens for keys on window, so a game key seen here reached the game.
  useEffect(() => {
    if (!playing) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (!ARROW_AND_SPACE_KEYS.has(event.key) || event.repeat) {
        return;
      }
      if (isOnScreenGameKey(event)) {
        visit.current.buttonPresses++;
      } else {
        visit.current.keyboardPresses++;
      }
      reportActivity();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [playing, reportActivity]);

  useEffect(() => {
    const end = () => {
      const {active, ended, startedAt, completed} = visit.current;
      if (!counted() || !active || ended) {
        return;
      }
      visit.current.ended = true;
      send(EVENTS.HOAI2026_LEVEL_SESSION_END, {
        durationSeconds: Math.round((Date.now() - startedAt) / 1000),
        completed,
        keyboardPresses: visit.current.keyboardPresses,
        buttonPresses: visit.current.buttonPresses,
      });
    };
    // beforeunload comes before pagehide, when the analytics client sends
    // what it has queued.
    window.addEventListener('beforeunload', end);
    return () => {
      window.removeEventListener('beforeunload', end);
      end();
    };
  }, [counted, send]);

  return {reportActivity, reportCompleted};
}
