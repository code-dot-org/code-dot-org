import $ from 'jquery';

import statsigReporter from '@cdo/apps/metrics/StatsigReporter';

$(document).ready(() => {
  const isInSignupExperiment = statsigReporter.getIsInExperiment(
    'signup_test',
    'showNewFlow',
    false
  );
  const signupLink = document.getElementById('signup-link');

  if (isInSignupExperiment) {
    signupLink.href = 'https://studio.code.org/users/new_sign_up/account_type';
  }
});
