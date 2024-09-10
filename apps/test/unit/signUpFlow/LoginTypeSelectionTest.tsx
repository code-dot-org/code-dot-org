import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

import locale from '@cdo/apps/signUpFlow/locale';
import LoginTypeSelection from '@cdo/apps/signUpFlow/LoginTypeSelection';
import {
  ACCOUNT_TYPE_SESSION_KEY,
  EMAIL_SESSION_KEY,
} from '@cdo/apps/signUpFlow/signUpFlowConstants';
import i18n from '@cdo/locale';

jest.mock('@cdo/apps/util/AuthenticityTokenStore', () => ({
  getAuthenticityToken: jest.fn().mockReturnValue('authToken'),
}));

describe('LoginTypeSelection', () => {
  afterEach(() => {
    sessionStorage.clear();
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

    // Renders inputs and reminder for field validations
    screen.getByText(locale.email_address());
    screen.getByText(locale.password());
    screen.getByText(locale.confirm_password());
    screen.getByText(locale.minimum_six_chars());
    screen.getByText(i18n.censusInvalidEmail());
    screen.getByText(i18n.passwordsMustMatch());

    // Renders button that sends the user to the Finish Account page
    screen.getByRole('button', {name: locale.create_my_account()});
  });

  it('enables the confirm button only when all inputs are valid', () => {
    renderDefault();

    const emailInput = screen.getByLabelText(locale.email_address());
    const passwordInput = screen.getByLabelText(locale.password());
    const confirmPasswordInput = screen.getByLabelText(
      locale.confirm_password()
    );

    const finishSignUpButton = screen.getByRole('button', {
      name: locale.create_my_account(),
    }) as HTMLButtonElement;

    expect(finishSignUpButton).toBeDisabled();

    // Verify that the button is only enabled when all fields are valid
    fireEvent.change(emailInput, {target: {value: 'myrandomemail@gmail.com'}});
    expect(finishSignUpButton).toBeDisabled();

    fireEvent.change(passwordInput, {target: {value: 'password'}});
    expect(finishSignUpButton).toBeDisabled();

    fireEvent.change(confirmPasswordInput, {target: {value: 'password'}});
    expect(finishSignUpButton).not.toBeDisabled();
  });

  it('clicks the create account button when Enter is pressed if the button is enabled', () => {
    renderDefault();

    const emailInput = screen.getByLabelText(locale.email_address());
    const passwordInput = screen.getByLabelText(locale.password());
    const confirmPasswordInput = screen.getByLabelText(
      locale.confirm_password()
    );

    const finishSignUpButton = screen.getByRole('button', {
      name: locale.create_my_account(),
    }) as HTMLButtonElement;

    // Mock the click handler
    const handleClick = jest.fn();
    finishSignUpButton.onclick = handleClick;

    // Simulate pressing Enter when button is not enabled
    fireEvent.keyDown(document, {key: 'Enter', code: 'Enter', charCode: 13});

    // Verify the button's click handler was never called
    expect(handleClick).not.toHaveBeenCalled();

    // Ensure the button is enabled
    fireEvent.change(emailInput, {target: {value: 'myrandomemail@gmail.com'}});
    fireEvent.change(passwordInput, {target: {value: 'password'}});
    fireEvent.change(confirmPasswordInput, {target: {value: 'password'}});
    expect(finishSignUpButton).not.toBeDisabled();

    // Simulate pressing Enter
    fireEvent.keyDown(document, {key: 'Enter', code: 'Enter', charCode: 13});

    // Verify the button's click handler was called
    expect(handleClick).toHaveBeenCalled();
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

  it('valid email is stored in sessionStorage', () => {
    renderDefault();
    const emailInput = screen.getByLabelText(locale.email_address());

    // Session storage starts empty
    expect(sessionStorage.getItem(EMAIL_SESSION_KEY)).toBe(null);

    // Session storage doesn't update for an invalid email
    fireEvent.change(emailInput, {target: {value: 'invalidEmail'}});
    expect(sessionStorage.getItem(EMAIL_SESSION_KEY)).toBe(null);

    // Session storage updates for valid email
    fireEvent.change(emailInput, {target: {value: 'validEmail@email.com'}});
    expect(sessionStorage.getItem(EMAIL_SESSION_KEY)).toBe(
      'validEmail@email.com'
    );
  });
});
