/* global window */

/**
 * Report an event to Google Analytics.
 * trackEvent is provided by _analytics.html.haml in most cases.
 * In those where it isn't, we want this call to be a simple no-op.
 */
export default function trackEvent(...args) {
  if (typeof window.trackEvent === 'function') {
      window.trackEvent(...args);
  }
}
