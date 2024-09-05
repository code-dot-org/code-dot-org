import $ from 'jquery';

import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';

// Log page visits on document.ready.
$(document).ready(() => {
  const eventLogger = document.getElementById('analytics-event-log-helper');
  const pageVisitEventName = eventLogger?.dataset?.eventName;
  analyticsReporter.sendEvent(pageVisitEventName);
});
