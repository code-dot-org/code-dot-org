import {analyticsReporter} from '@code-dot-org/core/metrics';

/**
 * Sends an analytics event to the analytics reporter.
 *
 * @param eventName - The name of the event to send.
 * @param labType - An optional string representing the lab type.
 * @param payload - An optional object containing additional key-value pairs to include in the event payload.
 */
export function sendLabAnalyticsEvent(
  eventName: string,
  payload?: Record<string, string>,
) {
  analyticsReporter.sendEvent(eventName, payload || {});
}
