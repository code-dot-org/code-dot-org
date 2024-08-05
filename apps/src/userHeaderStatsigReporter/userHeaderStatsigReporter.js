import statsigReporter from '../metrics/StatsigReporter';

if (document.readyState !== 'loading') {
  console.log('Document is ready');
  runStatsigReporter();
} else {
  document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM content has loaded');
    console.log(`Document ready state: ${document.readyState}`);
    runStatsigReporter();
  });
}

function runStatsigReporter() {
  console.log('Running Statsig Reporter');
  const createAccountButton = document.querySelector('#create_account_button');
  const createAccountButtonDesktop = document.querySelector(
    '#create_account_button.desktop'
  );
  const signInButtonDesktop = document.querySelector('#signin_button.desktop');
  const hamburgerButtons = document.querySelector('#hamburger-sign-up-buttons');
  const signUpPage = window.location.pathname.includes('/users/sign_up');

  const isInCreateAccountButtonExperiment = statsigReporter.getIsInExperiment(
    'create_account_button_2',
    'showCreateAccountButton',
    false
  );

  function showCreateAccountButton() {
    return isInCreateAccountButtonExperiment;
  }

  // This function is only called for the Create Account A/B Test experiment
  function handleWindowResize() {
    if (window.innerWidth < 425) {
      signInButtonDesktop.style.display = 'none';
      createAccountButtonDesktop.style.display = 'none';
      hamburgerButtons.style.display = 'block';
    } else {
      signInButtonDesktop.style.display = 'block';
      createAccountButtonDesktop.style.display = 'block';
      hamburgerButtons.style.display = 'none';
    }
  }

  if (
    showCreateAccountButton() &&
    createAccountButton &&
    hamburgerButtons &&
    !signUpPage
  ) {
    // Show the Create Account button in the Test bucket
    createAccountButton.style.display = 'block';
    // Hide the Sign in and Create account buttons if the screen size is <425px
    window.addEventListener('resize', handleWindowResize);
    handleWindowResize();
  } else {
    // Hide the Create account button in the Control bucket
    createAccountButton ? (createAccountButton.style.display = 'none') : null;
    // Hide the Sign in and Create account buttons in the hamburger
    hamburgerButtons ? (hamburgerButtons.style.display = 'none') : null;
  }
}
