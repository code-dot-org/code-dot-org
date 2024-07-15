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
  const createAccountButton = document.querySelector('#create_account_button');
  const createAccountButtonDesktop = document.querySelector(
    '#create_account_button.desktop'
  );
  const signInButtonDesktop = document.querySelector('#signin_button.desktop');
  const hamburgerButtons = document.querySelector('#hamburger-sign-up-buttons');
  const signUpPage = window.location.pathname.includes('/users/sign_up');

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
    // Hide the Create account button if in the Control bucket
    createAccountButton ? (createAccountButton.style.display = 'none') : null;
    // Hide the Sign in and Create account buttons in the hamburger
    hamburgerButtons ? (hamburgerButtons.style.display = 'none') : null;
  }
});
