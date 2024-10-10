import {PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

/**
 * Sends an Codebridge analytics event to the analytics reporter.
 *
 * @param eventName - The name of the event to send.
 * @param labType - An optional string representing the lab type.
 * @param payload - An optional object containing additional key-value pairs to include in the event payload.
 */
export function sendCodebridgeAnalyticsEvent(
  eventName: string,
  labType?: string,
  payload?: Record<string, string>
) {
  const fullPayload = payload ? {labType, ...payload} : {labType};
  analyticsReporter.sendEvent(eventName, fullPayload, PLATFORMS.STATSIG);
}
