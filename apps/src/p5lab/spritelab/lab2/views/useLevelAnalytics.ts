import {useCallback, useEffect, useRef} from 'react';

import {useLevelActivityMetrics} from '@cdo/apps/lab2/hooks/useLevelActivityMetrics';
import {LevelProperties} from '@cdo/apps/lab2/types';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {ARROW_AND_SPACE_KEYS, isOnScreenGameKey} from './playBar';

/** Where the student is: a unit level, the unit's free play level, or a
    standalone project. */
export type LabContext = 'progression' | 'freeplay' | 'standalone';

export interface LevelAnalytics {
  reportActivity: () => void;
  /** Sends the level-complete event with `details`, once per visit. */
  reportCompleted: (details: Record<string, unknown>) => void;
  /** Sends an event about something the student did, in a standalone
      project too. `value` is the value Statsig breaks results down by. */
  reportEvent: (
    eventName: string,
    payload: Record<string, unknown>,
    value?: string
  ) => void;
}

// TODO: move into a shared lab2 hook; Dance Party's useReportAnalytics tracks a visit the same way.
/**
 * Analytics for one visit to a level: the shared Level Activity event at the
 * student's first action, an event when they complete the level, and an
 * event when the visit ends, if the student did anything. A visit runs from
 * this hook's mount to its unmount, or to the page unload if that comes
 * first.
 *
 * Nothing is sent while `enabled` is false. Of the visit's three events, a
 * standalone project sends only the one when the visit ends: it has nothing
 * to complete, and the shared event leaves it out.
 *
 * While this hook is mounted, `labContext` is set as a project property, so
 * every event sent with `includeProjectProperties` carries it, including
 * events sent outside this hook.
 */
export default function useLevelAnalytics(
  levelProperties: LevelProperties,
  playing: boolean,
  enabled: boolean,
  labContext: LabContext
): LevelAnalytics {
  const logLevelActivity = useLevelActivityMetrics(levelProperties);
  const unitName = useAppSelector(state => state.progress.scriptName) ?? '';

  const visit = useRef({
    startedAt: Date.now(),
    active: false,
    completed: false,
    ended: false,
    keyboardPressesWhilePlaying: 0,
    buttonPressesWhilePlaying: 0,
  });
  // Read through a ref so that `send` never changes. The effect that ends
  // the visit depends on it, and its cleanup would end the visit early if it
  // did.
  const latest = useRef({logLevelActivity, levelProperties, unitName, enabled});
  latest.current = {logLevelActivity, levelProperties, unitName, enabled};

  useEffect(() => {
    analyticsReporter.setProjectProperty('labContext', labContext);
    return () => analyticsReporter.setProjectProperty('labContext', undefined);
  }, [labContext]);

  const send = useCallback(
    (eventName: string, payload: Record<string, unknown>, value?: string) => {
      const {levelProperties, unitName} = latest.current;
      analyticsReporter.sendEvent(
        eventName,
        {
          ...payload,
          unitName,
          levelId: levelProperties.id,
          levelName: levelProperties.name,
        },
        true,
        value
      );
    },
    []
  );

  const reportEvent = useCallback(
    (eventName: string, payload: Record<string, unknown>, value?: string) => {
      if (latest.current.enabled) {
        send(eventName, payload, value);
      }
    },
    [send]
  );

  const inUnit = useCallback(
    () => !latest.current.levelProperties.isProjectLevel,
    []
  );

  const reportActivity = useCallback(() => {
    if (!latest.current.enabled) {
      return;
    }
    visit.current.active = true;
    if (inUnit()) {
      latest.current.logLevelActivity();
    }
  }, [inUnit]);

  const reportCompleted = useCallback(
    (details: Record<string, unknown>) => {
      if (!latest.current.enabled || !inUnit() || visit.current.completed) {
        return;
      }
      visit.current.completed = true;
      send(EVENTS.HOAI2026_LEVEL_COMPLETE, details);
    },
    [inUnit, send]
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
        visit.current.buttonPressesWhilePlaying++;
      } else {
        visit.current.keyboardPressesWhilePlaying++;
      }
      reportActivity();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [playing, reportActivity]);

  useEffect(() => {
    const end = () => {
      const {active, ended, startedAt, completed} = visit.current;
      if (!latest.current.enabled || !active || ended) {
        return;
      }
      visit.current.ended = true;
      send(EVENTS.HOAI2026_LEVEL_SESSION_END, {
        durationSeconds: Math.round((Date.now() - startedAt) / 1000),
        completed,
        keyboardPressesWhilePlaying: visit.current.keyboardPressesWhilePlaying,
        buttonPressesWhilePlaying: visit.current.buttonPressesWhilePlaying,
      });
    };
    // beforeunload comes before pagehide, when the analytics client sends
    // what it has queued.
    window.addEventListener('beforeunload', end);
    return () => {
      window.removeEventListener('beforeunload', end);
      end();
    };
  }, [send]);

  return {reportActivity, reportCompleted, reportEvent};
}
