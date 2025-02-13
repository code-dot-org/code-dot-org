import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

export const logOnResize = (labType?: string) => {
  analyticsReporter.sendEvent(
    EVENTS.LAB2_RESIZE_DRAG_START,
    {labType},
    PLATFORMS.STATSIG
  );
};
