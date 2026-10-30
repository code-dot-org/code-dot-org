import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import getScriptData from '@cdo/apps/util/getScriptData';

// Execute after page has fully loaded so the Statsig/Amplitude event only fires on full page load
$(() => {
  const sessionId = getScriptData('sessionId');
  analyticsReporter.sendEvent(EVENTS.WORKSHOP_ATTENDANCE_MARKED_EVENT, {
    user_logged_own_attendance: true,
    session_id: sessionId,
  });
});
