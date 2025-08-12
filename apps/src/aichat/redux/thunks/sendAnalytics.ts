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
    const clientType = getState().aichat.clientType;
    const userHasAichatAccess = getState().aichat.userHasAichatAccess;

    // Only check `userHasAichatAccess` for AI Chat.
    if (
      clientType !== AiChatClientTypes.AI_CHAT_LAB ||
      userHasAichatAccess ||
      skipAccessCheck
    ) {
      const propertiesWithClientType = {
        ...properties,
        clientType,
      };
      analyticsReporter.sendEvent(
        event,
        propertiesWithClientType,

        // Only log to Amplitude for AI Chat otherwise just log to Statsig.
        clientType === AiChatClientTypes.AI_CHAT_LAB
          ? PLATFORMS.BOTH
          : PLATFORMS.STATSIG
      );
    }
  };
