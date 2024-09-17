import $ from 'jquery';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

$(document).ready(() => {
  analyticsReporter.sendEvent(EVENTS.LOGIN_PAGE_VISITED, {}, PLATFORMS.STATSIG);

  document.getElementById('user_signup').addEventListener('click', () => {
    analyticsReporter.sendEvent(
      EVENTS.LOGIN_PAGE_CREATE_ACCOUNT_CLICKED,
      {},
      PLATFORMS.STATSIG
    );
  });
});
