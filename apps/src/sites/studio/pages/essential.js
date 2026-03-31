import {initializeCore} from '@code-dot-org/core';
import {observabilityPlugin} from '@code-dot-org/core/observability';

import DCDO from '@cdo/apps/dcdo';
import {isUnsupportedBrowser} from '@cdo/apps/util/browser-detector';

const corePlugins = [];

if (DCDO.get('frontend-observability-enabled', false)) {
  corePlugins.push(observabilityPlugin);
}

initializeCore({plugins: corePlugins});

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
