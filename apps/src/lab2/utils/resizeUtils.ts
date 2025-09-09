import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

export const logOnResize = (
  labType?: string,
  payload?: Record<string, string>
) => {
  const fullPayload = payload ? {labType, ...payload} : {labType};
  analyticsReporter.sendEvent(
    EVENTS.LAB2_RESIZE_DRAG_START,
    fullPayload,
    PLATFORMS.STATSIG
  );
};
