import $ from 'jquery';

import {PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

// Log page visits on document.ready.
$(document).ready(() => {
  const eventLogger = document.getElementById('analytics-event-log-helper');
  const pageVisitEventName = eventLogger?.dataset?.eventName;
  analyticsReporter.sendEvent(pageVisitEventName, {}, PLATFORMS.STATSIG);
});
