import $ from 'jquery';

import statsigReporter from '@cdo/apps/metrics/StatsigReporter';

$(document).ready(() => {
  const isInSignupExperiment = statsigReporter.getIsInExperiment(
    'new_sign_up_v1',
    'showNewFlow',
    false
  );
  const signupLink = document.getElementById('sign-in-button');

  if (isInSignupExperiment) {
    signupLink.href = 'https://studio.code.org/users/new_sign_up/account_type';
  }
});
