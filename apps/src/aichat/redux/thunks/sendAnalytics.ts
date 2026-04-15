import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {RootState} from '@cdo/apps/types/redux';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

// This thunk sends aichat analytics events to Amplitude and Statsig.
export const sendAnalytics =
  (event: string, properties: object) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const aichatState = state.aichat;
    const labState = state.lab;
    const progressState = state.progress;
    const clientType = aichatState.clientType;

    const allProperties = {
      ...properties,
      clientType,
      aiTutorMode: labState.levelProperties?.aiTutorMode,
      appType: labState.levelProperties?.appName,
      levelId: labState.levelProperties?.id,
      levelName: labState.levelProperties?.name,
      scriptId: labState.scriptId,
      scriptName: progressState.scriptName,
      courseName: progressState.courseName,
      channel: labState.channel?.id,
      levelPath: window.location.pathname,
    };

    analyticsReporter.sendEvent(event, allProperties);
  };
