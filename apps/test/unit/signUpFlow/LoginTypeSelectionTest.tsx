import {render, screen} from '@testing-library/react';
import React from 'react';

import locale from '@cdo/apps/signUpFlow/locale';
import LoginTypeSelection from '@cdo/apps/signUpFlow/LoginTypeSelection';
import {ACCOUNT_TYPE_SESSION_KEY} from '@cdo/apps/signUpFlow/signUpFlowConstants';

jest.mock('@cdo/apps/util/AuthenticityTokenStore', () => ({
  getAuthenticityToken: jest.fn().mockReturnValue('authToken'),
}));

describe('LoginTypeSelection', () => {
  afterEach(() => {
    sessionStorage.removeItem(ACCOUNT_TYPE_SESSION_KEY);
  });

  function renderDefault() {
    render(<LoginTypeSelection />);
  }

  it('renders headers, buttons and inputs', () => {
    renderDefault();
    // Renders page title
    screen.getByText(locale.pick_your_login_method());
    screen.getByText(locale.sign_up_with());

    // Renders lms buttons
    screen.getByText(locale.sign_up_google());
    screen.getByText(locale.sign_up_microsoft());
    screen.getByText(locale.sign_up_facebook());

    // Renders inputs and reminder for password length
    screen.getByText(locale.email_address());
    screen.getByText(locale.password());
    screen.getByText(locale.confirm_password());
    screen.getByText(locale.minimum_six_chars());

    // Renders button that sends the user to the Finish Account page
    screen.getByRole('button', {name: locale.create_my_account()});
  });

  it('if user selected student then finish sign up button sends user to finish student page', () => {
    sessionStorage.setItem(ACCOUNT_TYPE_SESSION_KEY, 'student');
    renderDefault();

    const finishSignUpButton = screen.getByRole('button', {
      name: locale.create_my_account(),
    });
    expect(
      finishSignUpButton
        .toString()
        .includes("href: '/users/new_sign_up/finish_student_account'")
    ).toBeTruthy;
  });

  it('if user selected teacher then finish sign up button sends user to finish teacher page', () => {
    sessionStorage.setItem(ACCOUNT_TYPE_SESSION_KEY, 'teacher');
    renderDefault();

    const finishSignUpButton = screen.getByRole('button', {
      name: locale.create_my_account(),
    });
    expect(
      finishSignUpButton
        .toString()
        .includes("href: '/users/new_sign_up/finish_teacher_account'")
    ).toBeTruthy;
  });
});
