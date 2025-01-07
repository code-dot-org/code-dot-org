import $ from 'jquery';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {USER_RETURN_TO_SESSION_KEY} from '@cdo/apps/signUpFlow/signUpFlowConstants';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  analyticsReporter.sendEvent(EVENTS.LOGIN_PAGE_VISITED, {}, PLATFORMS.STATSIG);

  const userReturnTo = getScriptData('userReturnTo');

  if (userReturnTo) {
    sessionStorage.setItem(USER_RETURN_TO_SESSION_KEY, userReturnTo);
  }

  document.getElementById('user_signup').addEventListener('click', () => {
    analyticsReporter.sendEvent(
      EVENTS.LOGIN_PAGE_CREATE_ACCOUNT_CLICKED,
      {},
      PLATFORMS.STATSIG
    );
  });
});
