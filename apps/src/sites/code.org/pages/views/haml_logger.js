import $ from 'jquery';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

// Log visits to .md.partial file pages specified in `visit_partial_event_logger.erb`.
document.addEventListener('logVisitInPartial', e => {
  logEvent(e?.detail?.eventName);
});

// Log visits to .erb file pages on document.ready.
$(document).ready(() => {
  const eventLogger = document.getElementById('haml-logger');
  const pageVisitEventName = eventLogger?.dataset?.eventName;
  if (pageVisitEventName) {
    logEvent(pageVisitEventName);
  }
});

// Log the given event if not nil
function logEvent(eventName) {
  const event = EVENTS[eventName];
  if (event) {
    analyticsReporter.sendEvent(event);
  }
}
