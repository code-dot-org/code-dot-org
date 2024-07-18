import $ from 'jquery';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

$(document).ready(() => {
  // Log when a user submits the admins email signup form.
  document.addEventListener('submitsAdminForm', () => {
    analyticsReporter.sendEvent(EVENTS.ADMIN_INTEREST_FORM_SUBMIT_EVENT);
  });
});
