import $ from 'jquery';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

$(document).ready(() => {
  analyticsReporter.sendEvent(
    EVENTS.SIGN_UP_STARTED_EVENT,
    {source: 'section code sign up form'},
    PLATFORMS.STATSIG
  );

  document
    .getElementById('create_and_register')
    .addEventListener('click', () => {
      analyticsReporter.sendEvent(
        EVENTS.SIGN_UP_FINISHED_EVENT,
        {
          source: 'section code sign up form',
          'user type': 'student',
          'has school': false,
          'has marketing value selected': true,
        },
        PLATFORMS.STATSIG
      );
    });
});
