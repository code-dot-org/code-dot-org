import $ from 'jquery';

import {EVENTS} from '@cdo/apps/metrics/utils/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/utils/AnalyticsReporter';

$(document).ready(() => {
  // Log when a user submits the admins email signup form.
  document.addEventListener('submitsAdminForm', () => {
    analyticsReporter.sendEvent(EVENTS.ADMIN_INTEREST_FORM_SUBMIT_EVENT);
  });
});
