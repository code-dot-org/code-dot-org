import {PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {RootState} from '@cdo/apps/types/redux';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

// This thunk sends aichat analytics events to Amplitude and Statsig.
// The event is sent for authorized users and if skipAccessCheck is true,
// then the event is sent regardless of user aichat access.
export const sendAnalytics =
  (event: string, properties: object, skipAccessCheck = false) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const aichatState = state.aichat;
    const labState = state.lab;
    const progressState = state.progress;
    const clientType = aichatState.clientType;
    const userHasAichatAccess = aichatState.userHasAichatAccess;

    // Only check `userHasAichatAccess` for AI Chat.
    if (
      clientType !== AiChatClientTypes.AI_CHAT_LAB ||
      userHasAichatAccess ||
      skipAccessCheck
    ) {
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

      analyticsReporter.sendEvent(
        event,
        allProperties,

        // Only log to Amplitude for AI Chat otherwise just log to Statsig.
        clientType === AiChatClientTypes.AI_CHAT_LAB
          ? PLATFORMS.BOTH
          : PLATFORMS.STATSIG
      );
    }
  };
