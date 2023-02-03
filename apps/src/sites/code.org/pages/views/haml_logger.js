import $ from 'jquery';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

// Log visits to the following pages found in .erb files on document.ready.
$(document).ready(() => {
  const hamlLogger = document.getElementById('haml-logger');
  const sourcePageId = hamlLogger?.dataset?.eventName;
  logEvent(EVENTS[sourcePageId]);
});

// Log the given event if not nil
function logEvent(eventName) {
  if (eventName) {
    analyticsReporter.sendEvent(eventName);
  }
}
