import {useCallback, useEffect, useRef} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {LevelProperties} from '@cdo/apps/lab2/types';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

interface AnalyticsPayload {
  levelType?: string;
  mode?: string;
  channelId?: string;
  levelPath?: string;
  scriptName?: string;
}

/** Reports the "Dance Party Session End" analytics event. */
export default function useReportAnalytics(
  levelProperties: LevelProperties,
  channelId?: string
) {
  const startTimeRef = useRef<number | null>(null);
  const analyticsPayload = useRef<AnalyticsPayload>({});

  const reportSessionEnd = useCallback(() => {
    if (startTimeRef.current === null) {
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logWarning('Analytics session end reported without a start time.');
      return;
    }

    const duration = Date.now() - startTimeRef.current;
    analyticsReporter.sendEvent(EVENTS.DANCE_PARTY_SESSION_END, {
      ...analyticsPayload.current,
      durationSeconds: duration / 1000,
    });
  }, []);

  const viewMode = useAppSelector(state => {
    const isReadOnly = isReadOnlyWorkspace(state);
    const isPlayView = state.lab.isShareView;
    return isPlayView ? 'Share' : isReadOnly ? 'View' : 'Edit';
  });

  const scriptName =
    useAppSelector(state => state.progress.scriptName) || undefined;

  useEffect(() => {
    analyticsPayload.current.scriptName = scriptName;
  }, [scriptName]);

  useEffect(() => {
    analyticsPayload.current.mode = viewMode;
  }, [viewMode]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    analyticsPayload.current.channelId = channelId;
    analyticsPayload.current.levelType = levelProperties.isProjectLevel
      ? 'Standalone Project'
      : 'Level';
    analyticsPayload.current.levelPath = window.location.pathname;

    window.addEventListener('beforeunload', reportSessionEnd);
    return () => {
      window.removeEventListener('beforeunload', reportSessionEnd);
      reportSessionEnd();
    };
  }, [
    reportSessionEnd,
    levelProperties.id,
    channelId,
    levelProperties.isProjectLevel,
  ]);
}
