import $ from 'jquery';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import statsigReporter from '@cdo/apps/metrics/StatsigReporter';

$(document).ready(() => {
  analyticsReporter.sendEvent(EVENTS.SIGN_UP_STARTED_EVENT, {}, PLATFORMS.BOTH);

  const isInSignupExperiment = statsigReporter.getIsInExperiment(
    'new_sign_up_v1',
    'showNewFlow',
    false
  );

  if (isInSignupExperiment) {
    window.location.href =
      'https://studio.code.org/users/new_sign_up/account_type';
  }

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
