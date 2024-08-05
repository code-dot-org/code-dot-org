import $ from 'jquery';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/utils/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/utils/AnalyticsReporter';

$(document).ready(() => {
  analyticsReporter.sendEvent(EVENTS.SIGN_UP_STARTED_EVENT, {}, PLATFORMS.BOTH);

  document
    .getElementById('signup_form_submit')
    .addEventListener('click', () => {
      logUserLoginType('email');
    });
  document
    .getElementById('google_oauth2-sign-in')
    .addEventListener('click', () => {
      logUserLoginType('google');
    });
  document
    .getElementById('microsoft_v2_auth-sign-in')
    .addEventListener('click', () => {
      logUserLoginType('microsoft');
    });
  document.getElementById('facebook-sign-in').addEventListener('click', () => {
    logUserLoginType('facebook');
  });
});

function logUserLoginType(loginType) {
  analyticsReporter.sendEvent(
    EVENTS.SIGN_UP_LOGIN_TYPE_PICKED_EVENT,
    {
      'user login type': loginType,
    },
    PLATFORMS.BOTH
  );
}
