import {PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

export function sendCodebridgeAnalyticsEvent(
  eventName: string,
  labType?: string,
  payload?: Record<string, string>
) {
  const fullPayload = payload ? {labType, ...payload} : {labType};
  analyticsReporter.sendEvent(eventName, fullPayload, PLATFORMS.STATSIG);
}
