export const ANALYTICS_EVENTS = {
  CERTIFICATE_DOWNLOADED: 'Certificate Downloaded',
  CERTIFICATE_SHARED: 'Certificate Shared',
} as const;

/**
 * TODO(task 5.3): the legacy pages emit CERTIFICATE_SHARED through the Statsig
 * browser SDK (apps/src/metrics/StatsigReporter.js), which posts to Statsig's
 * cloud endpoint with an SDK client key — there is no frontend/-native
 * analytics integration to reuse yet. No-op until one exists.
 */
export function sendAnalyticsEvent(
  eventName: string,
  payload: Record<string, string> = {},
): void {
  void eventName;
  void payload;
}
