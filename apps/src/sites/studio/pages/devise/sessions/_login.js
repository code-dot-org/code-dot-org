import $ from 'jquery';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {USER_RETURN_TO_SESSION_KEY} from '@cdo/apps/signUpFlow/signUpFlowConstants';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  analyticsReporter.sendEvent(EVENTS.LOGIN_PAGE_VISITED, {}, PLATFORMS.BOTH);

  const userReturnTo = getScriptData('userReturnTo');

  if (userReturnTo) {
    sessionStorage.setItem(USER_RETURN_TO_SESSION_KEY, userReturnTo);
  }

  document.getElementById('user_signup').addEventListener('click', () => {
    analyticsReporter.sendEvent(
      EVENTS.LOGIN_PAGE_CREATE_ACCOUNT_CLICKED,
      {},
      PLATFORMS.BOTH
    );
  });

  document.getElementById('signin-button').addEventListener('click', () => {
    analyticsReporter.sendEvent(
      EVENTS.LOGIN_PAGE_SIGN_IN_CLICKED,
      {},
      PLATFORMS.BOTH
    );
  });

  document
    .getElementById('google_oauth2-sign-in')
    .addEventListener('click', () => {
      analyticsReporter.sendEvent(
        EVENTS.LOGIN_PAGE_OAUTH_CLICKED,
        {provider: 'google'},
        PLATFORMS.BOTH
      );
    });

  document.getElementById('facebook-sign-in').addEventListener('click', () => {
    analyticsReporter.sendEvent(
      EVENTS.LOGIN_PAGE_OAUTH_CLICKED,
      {provider: 'facebook'},
      PLATFORMS.BOTH
    );
  });

  document
    .getElementById('microsoft_v2_auth-sign-in')
    .addEventListener('click', () => {
      analyticsReporter.sendEvent(
        EVENTS.LOGIN_PAGE_OAUTH_CLICKED,
        {provider: 'microsoft'},
        PLATFORMS.BOTH
      );
    });

  document.getElementById('clever-sign-in').addEventListener('click', () => {
    analyticsReporter.sendEvent(
      EVENTS.LOGIN_PAGE_OAUTH_CLICKED,
      {provider: 'clever'},
      PLATFORMS.BOTH
    );
  });
});
