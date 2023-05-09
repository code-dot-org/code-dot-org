/**
 * Report an event to Google Analytics.
 * trackEvent is provided by _analytics.html.haml in most cases.
 * In those where it isn't, we want this call to be a simple no-op.
 */
export default function trackEvent(...args) {
  if (IN_UNIT_TEST || IN_STORYBOOK) {
    // We should silently no-op in tests, but in other places we actually
    // want this call to fail if window.trackEvent is not available.
    return;
  }
  window.trackEvent(...args);
}
