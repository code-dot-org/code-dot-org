import $ from 'jquery';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

// Log visits to .erb file pages on document.ready.
$(document).ready(() => {
  const eventLogger = document.getElementById('analytics-event-log-helper');
  const pageVisitEventName = eventLogger?.dataset?.eventName;
  if (pageVisitEventName) {
    logEvent(pageVisitEventName);
  }
});

// Log the given event if not nil
function logEvent(eventName, properties) {
  const event = EVENTS[eventName];
  if (event) {
    analyticsReporter.sendEvent(event, properties);
  }
}
