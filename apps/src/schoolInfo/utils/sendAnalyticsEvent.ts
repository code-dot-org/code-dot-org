import {PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';

export function sendAnalyticsEvent(
  eventName: string,
  data: Record<string, string>
) {
  analyticsReporter.sendEvent(eventName, data, PLATFORMS.BOTH);
}
