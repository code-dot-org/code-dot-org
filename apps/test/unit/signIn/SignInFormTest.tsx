import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import SignInForm, {SignInFormProps} from '@cdo/apps/signIn/SignInForm';
import {USER_RETURN_TO_SESSION_KEY} from '@cdo/apps/signUpFlow/signUpFlowConstants';

const DEFAULT_PROPS: SignInFormProps = {
  hashedEmail: 'hashed-abc',
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

describe('SignInForm', () => {
  beforeAll(() => {
    // RailsAuthenticityToken reads these meta tags; provide them so it renders
    // the token input instead of logging a missing-tags error.
    document.head.innerHTML =
      '<meta name="csrf-param" content="authenticity_token">' +
      '<meta name="csrf-token" content="test-token">';
  });

  beforeEach(() => {
    sessionStorage.clear();
  });

  function renderForm(overrides: Partial<SignInFormProps> = {}) {
    return render(<SignInForm {...DEFAULT_PROPS} {...overrides} />);
  }

  it('renders login and password fields and the sign-in button', () => {
    renderForm();

    expect(screen.getByLabelText(DEFAULT_PROPS.loginLabel)).toHaveAttribute(
      'name',
      'user[login]'
    );
    expect(screen.getByLabelText(DEFAULT_PROPS.passwordLabel)).toHaveAttribute(
      'name',
      'user[password]'
    );
    // Required for a11y: native `required` => implicit aria-required, announced
    // by screen readers and enforced on empty submit.
    expect(screen.getByLabelText(DEFAULT_PROPS.loginLabel)).toBeRequired();
    expect(screen.getByLabelText(DEFAULT_PROPS.passwordLabel)).toBeRequired();
    screen.getByRole('button', {name: DEFAULT_PROPS.signInLabel});
  });

  it('posts to signInPath (preserves the regional/localized action)', () => {
    renderForm({signInPath: '/fa/users/sign_in'});
    const form = screen
      .getByRole('button', {name: DEFAULT_PROPS.signInLabel})
      .closest('form');
    expect(form).toHaveAttribute('action', '/fa/users/sign_in');
    expect(form).toHaveAttribute('method', 'post');
    // Must NOT be id="new_user": devise/sessions/new.js hooks that form's
    // submit to hash the email, which breaks this React-native POST.
    expect(form).not.toHaveAttribute('id', 'new_user');
  });

  it('threads the hashed_email through as a hidden field, unchanged', () => {
    renderForm({hashedEmail: 'server-set-hash'});
    const hidden = screen.getByDisplayValue('server-set-hash');
    expect(hidden).toHaveAttribute('name', 'user[hashed_email]');
    expect(hidden).toHaveAttribute('type', 'hidden');
  });

  it('renders the sign-up button and fires the analytics event on click', () => {
    const sendEventSpy = jest.spyOn(analyticsReporter, 'sendEvent');
    renderForm();

    fireEvent.click(screen.getByText(DEFAULT_PROPS.signUpLabel));

    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.LOGIN_PAGE_CREATE_ACCOUNT_CLICKED,
      {}
    );
    sendEventSpy.mockRestore();
  });

  it('does not render the sign-up button when showSignUp is false', () => {
    renderForm({showSignUp: false});
    expect(screen.queryByText(DEFAULT_PROPS.signUpLabel)).toBeNull();
  });

  it('points the forgot-password link at forgotPasswordPath', () => {
    renderForm({
      forgotPasswordPath: '/users/password/new',
      forgotPasswordLabel: 'Forgot password?',
    });
    expect(
      screen.getByRole('link', {name: 'Forgot password?'})
    ).toHaveAttribute('href', '/users/password/new');
  });

  it('omits the forgot-password link when no path is provided', () => {
    renderForm({forgotPasswordPath: undefined});
    expect(
      screen.queryByText(DEFAULT_PROPS.forgotPasswordLabel as string)
    ).toBeNull();
  });

  it('writes userReturnTo to sessionStorage on mount when set', () => {
    renderForm({userReturnTo: '/home'});
    expect(sessionStorage.getItem(USER_RETURN_TO_SESSION_KEY)).toBe('/home');
  });

  it('does not write userReturnTo to sessionStorage when absent', () => {
    renderForm({userReturnTo: null});
    expect(sessionStorage.getItem(USER_RETURN_TO_SESSION_KEY)).toBeNull();
  });

  it('pre-populates the login field with loginValue', () => {
    renderForm({loginValue: 'teacher@example.com'});
    expect(screen.getByLabelText(DEFAULT_PROPS.loginLabel)).toHaveValue(
      'teacher@example.com'
    );
  });
});
