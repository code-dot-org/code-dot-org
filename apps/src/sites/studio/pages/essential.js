import {isUnsupportedBrowser} from '@cdo/apps/util/browser-detector';

// Prevent filtered errors from being passed to New Relic. Return true when New
// Relic should ignore the error.
if (window.newrelic) {
  window.newrelic.setErrorHandler(function (err) {
    // Remove errors from unsupportenewrelicnd IE versions
    if (isUnsupportedBrowser()) {
      return true;
    }
    // Filter out errors with no stack trace (these aren't actionable yet)
    if (!err.stack || err.stack.length < 1) {
      return true;
    }
  });
}
