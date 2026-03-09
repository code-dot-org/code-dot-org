import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

/**
 * Sends an analytics event to the analytics reporter.
 *
 * @param eventName - The name of the event to send.
 * @param payload - An optional object containing additional key-value pairs to include in the event payload.
 */
export function sendLab2AnalyticsEvent(
  eventName: string,
  payload?: Record<string, string | number | boolean>
) {
  analyticsReporter.sendEvent(eventName, payload, true);
}
