import {PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {RootState} from '@cdo/apps/types/redux';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

// This thunk sends aichat analytics events to Amplitude and Statsig.
// The event is sent for authorized users and if skipAccessCheck is true,
// then the event is sent regardless of user aichat access.
export const sendAnalytics =
  (event: string, properties: object, skipAccessCheck = false) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const userHasAichatAccess = getState().aichat.userHasAichatAccess;
    if (userHasAichatAccess || skipAccessCheck) {
      analyticsReporter.sendEvent(event, properties, PLATFORMS.BOTH);
    }
  };
