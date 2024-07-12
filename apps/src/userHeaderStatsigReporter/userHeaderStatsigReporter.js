import statsigReporter from '../lib/util/StatsigReporter';

const isInCreateAccountButtonExperiment = statsigReporter.getIsInExperiment(
  'create_account_button',
  'showCreateAccountButton',
  false
);

export function showCreateAccountButton() {
  console.log(isInCreateAccountButtonExperiment);
  return isInCreateAccountButtonExperiment;
}

document.addEventListener('DOMContentLoaded', function () {
  if (
    showCreateAccountButton() &&
    // Hide this on the Sign Up page
    !window.location.pathname.includes('/users/sign_up')
  ) {
    // Show the Create Account button if in the Test bucket
    document.querySelector('#create_account_button').style.display = 'block';
  } else {
    // Hide the Create Account button if in the Control bucket
    document.querySelector('#create_account_button').style.display = 'none';
  }
});
