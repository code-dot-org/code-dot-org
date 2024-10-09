import $ from 'jquery';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

$(document).ready(() => {
  analyticsReporter.sendEvent(
    EVENTS.SIGN_UP_STARTED_EVENT,
    {sectionCodeSignUpForm: true},
    PLATFORMS.STATSIG
  );

  document
    .getElementById('create_and_register')
    .addEventListener('click', () => {
      analyticsReporter.sendEvent(
        EVENTS.SIGN_UP_FINISHED_EVENT,
        {sectionCodeSignUpForm: true},
        PLATFORMS.STATSIG
      );
    });
});
