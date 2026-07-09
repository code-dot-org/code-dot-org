import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import SignInPage, {SignInPageProps} from '@cdo/apps/signIn/SignInPage';

const DEFAULT_PROPS: SignInPageProps = {
  title: 'Have an account already? Sign in',
  hashedEmail: '',
  loginValue: '',
  signInPath: '/users/sign_in',
  loginLabel: 'Email address or username',
  passwordLabel: 'Password',
  signInLabel: 'Sign in',
  signUpLabel: 'Sign up',
  signUpPath: '/users/sign_up/account_type',
  showSignUp: true,
  forgotPasswordPath: '/users/password/new',
  forgotPasswordLabel: 'Forgot password?',
  userReturnTo: null,
};

describe('SignInPage', () => {
  beforeAll(() => {
    // SignInForm's RailsAuthenticityToken reads these meta tags.
    document.head.innerHTML =
      '<meta name="csrf-param" content="authenticity_token">' +
      '<meta name="csrf-token" content="test-token">';
  });

  it('renders the title as a heading and the sign-in form together', () => {
    render(<SignInPage {...DEFAULT_PROPS} />);

    screen.getByRole('heading', {name: DEFAULT_PROPS.title});
    screen.getByLabelText(DEFAULT_PROPS.loginLabel);
    screen.getByRole('button', {name: DEFAULT_PROPS.signInLabel});
  });
});
