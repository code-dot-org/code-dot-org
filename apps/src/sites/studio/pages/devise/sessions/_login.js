import $ from 'jquery';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import statsigReporter from '@cdo/apps/metrics/StatsigReporter';

$(document).ready(() => {
  analyticsReporter.sendEvent(EVENTS.LOGIN_PAGE_VISITED, {}, PLATFORMS.STATSIG);

  const isInSignupExperiment = statsigReporter.getIsInExperiment(
    'new_sign_up_v1',
    'showNewFlow',
    false
  );
  const signupLink = document.getElementById('signup-link');

  if (isInSignupExperiment) {
    signupLink.href = 'https://studio.code.org/users/new_sign_up/account_type';
  }

  document.getElementById('user_signup').addEventListener('click', () => {
    analyticsReporter.sendEvent(
      EVENTS.LOGIN_PAGE_CREATE_ACCOUNT_CLICKED,
      {},
      PLATFORMS.STATSIG
    );
  });
});
