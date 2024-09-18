import {render, screen, waitFor, fireEvent} from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import locale from '@cdo/apps/signUpFlow/locale';
import LoginTypeSelection from '@cdo/apps/signUpFlow/LoginTypeSelection';
import {
  ACCOUNT_TYPE_SESSION_KEY,
  EMAIL_SESSION_KEY,
} from '@cdo/apps/signUpFlow/signUpFlowConstants';
import {navigateToHref} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

jest.mock('@cdo/apps/util/AuthenticityTokenStore', () => ({
  getAuthenticityToken: jest.fn().mockReturnValue('authToken'),
}));

jest.mock('@cdo/apps/utils', () => ({
  ...jest.requireActual('@cdo/apps/utils'),
  navigateToHref: jest.fn(),
}));

const navigateToHrefMock = navigateToHref as jest.Mock;

describe('LoginTypeSelection', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  function renderDefault() {
    render(<LoginTypeSelection />);
  }

  it('renders headers, buttons and inputs', async () => {
    await waitFor(() => {
      renderDefault();
    });

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

  it('enables the confirm button only when all inputs are valid', async () => {
    await waitFor(() => {
      renderDefault();
    });

    const emailInput = screen.getByLabelText(locale.email_address());
    const passwordInput = screen.getByLabelText(locale.password());
    const confirmPasswordInput = screen.getByLabelText(
      locale.confirm_password()
    );

    const finishSignUpButton = screen.getByRole('button', {
      name: locale.create_my_account(),
    }) as HTMLButtonElement;
    await waitFor(() => {
      expect(finishSignUpButton).toBeDisabled();
    });

    // Verify that the button is only enabled when all fields are valid
    fireEvent.change(emailInput, {
      target: {value: 'myrandomemail@gmail.com'},
    });
    await waitFor(() => {
      expect(finishSignUpButton).toBeDisabled();
    });

    fireEvent.change(passwordInput, {target: {value: 'password'}});
    await waitFor(() => {
      expect(finishSignUpButton).toBeDisabled();
    });

    fireEvent.change(confirmPasswordInput, {target: {value: 'password'}});
    await waitFor(() => {
      expect(finishSignUpButton).not.toBeDisabled();
    });
  });

  it('clicking the create account button triggers fetch call and redirects user', async () => {
    const fetchSpy = sinon.stub(window, 'fetch');
    fetchSpy.returns(Promise.resolve(new Response()));

    await waitFor(() => {
      renderDefault();
    });

    // Set up create account button onClick jest function
    const finishSignUpButton = screen.getByRole('button', {
      name: locale.create_my_account(),
    }) as HTMLButtonElement;
    const handleClick = jest.fn();
    finishSignUpButton.onclick = handleClick;

    // Fill in required fields
    const email = 'myrandomemail@gmail.com';
    const password = 'password';
    const emailInput = screen.getByLabelText(locale.email_address());
    const passwordInput = screen.getByLabelText(locale.password());
    const confirmPasswordInput = screen.getByLabelText(
      locale.confirm_password()
    );

    fireEvent.change(emailInput, {
      target: {value: email},
    });
    fireEvent.change(passwordInput, {target: {value: password}});
    fireEvent.change(passwordInput, {target: {value: password}});
    fireEvent.change(confirmPasswordInput, {target: {value: password}});
    await waitFor(() => {
      expect(finishSignUpButton).not.toBeDisabled();
    });

    // Click create account button
    fireEvent.click(finishSignUpButton);

    await waitFor(() => {
      // Verify the button's click handler was called
      expect(handleClick).toHaveBeenCalled();

      // Verify the button's fetch method was called
      expect(fetchSpy).toHaveBeenCalled;
      const fetchCall = fetchSpy.getCall(0);
      expect(fetchCall.args[0]).toEqual(
        `/users/begin_sign_up?new_sign_up=true&email=${email}&password=${password}&password_confirmation=${password}`
      );

      // Verify the user is redirected to the finish sign up page
      expect(navigateToHrefMock).toHaveBeenCalledWith(
        '/users/new_sign_up/finish_student_account'
      );
    });

    fetchSpy.restore();
  });

  it('clicks the create account button when Enter is pressed if the button is enabled', async () => {
    const fetchSpy = sinon.stub(window, 'fetch');
    fetchSpy.returns(Promise.resolve(new Response()));

    await waitFor(() => {
      renderDefault();
    });

    const email = 'myrandomemail@gmail.com';
    const password = 'password';
    const emailInput = screen.getByLabelText(locale.email_address());
    const passwordInput = screen.getByLabelText(locale.password());
    const confirmPasswordInput = screen.getByLabelText(
      locale.confirm_password()
    );

    // Set up create account button onClick jest function
    const finishSignUpButton = screen.getByRole('button', {
      name: locale.create_my_account(),
    }) as HTMLButtonElement;
    const handleClick = jest.fn();
    finishSignUpButton.onclick = handleClick;

    // Simulate pressing Enter when button is not enabled
    fireEvent.keyDown(document, {key: 'Enter', code: 'Enter', charCode: 13});

    // Verify the button's click handler was never called
    await waitFor(() => {
      expect(handleClick).not.toHaveBeenCalled();
    });

    // Ensure the button is enabled
    fireEvent.change(emailInput, {
      target: {value: email},
    });
    fireEvent.change(passwordInput, {target: {value: password}});
    fireEvent.change(passwordInput, {target: {value: password}});
    fireEvent.change(confirmPasswordInput, {target: {value: password}});

    await waitFor(() => {
      expect(finishSignUpButton).not.toBeDisabled();
    });

    // Simulate pressing Enter
    fireEvent.keyDown(document, {key: 'Enter', code: 'Enter', charCode: 13});

    await waitFor(() => {
      // Verify the button's click handler was called
      expect(handleClick).toHaveBeenCalled();

      // Verify the button's fetch method was called
      expect(fetchSpy).toHaveBeenCalled;
      const fetchCall = fetchSpy.getCall(0);
      expect(fetchCall.args[0]).toEqual(
        `/users/begin_sign_up?new_sign_up=true&email=${email}&password=${password}&password_confirmation=${password}`
      );

      // Verify the user is redirected to the finish sign up page
      expect(navigateToHrefMock).toHaveBeenCalledWith(
        '/users/new_sign_up/finish_student_account'
      );
    });

    fetchSpy.restore();
  });

  it('if user selected student then finish sign up button sends user to finish student page', async () => {
    sessionStorage.setItem(ACCOUNT_TYPE_SESSION_KEY, 'student');
    await waitFor(() => {
      renderDefault();
    });

    const finishSignUpButton = screen.getByRole('button', {
      name: locale.create_my_account(),
    });
    expect(
      finishSignUpButton
        .toString()
        .includes("href: '/users/new_sign_up/finish_student_account'")
    ).toBeTruthy;
  });

  it('if user selected teacher then finish sign up button sends user to finish teacher page', async () => {
    sessionStorage.setItem(ACCOUNT_TYPE_SESSION_KEY, 'teacher');
    await waitFor(() => {
      renderDefault();
    });

    const finishSignUpButton = screen.getByRole('button', {
      name: locale.create_my_account(),
    });
    expect(
      finishSignUpButton
        .toString()
        .includes("href: '/users/new_sign_up/finish_teacher_account'")
    ).toBeTruthy;
  });

  it('valid email is stored in sessionStorage', async () => {
    await waitFor(() => {
      renderDefault();
    });

    const emailInput = screen.getByLabelText(locale.email_address());

    // Session storage starts empty
    expect(sessionStorage.getItem(EMAIL_SESSION_KEY)).toBe(null);

    // Session storage doesn't update for an invalid email
    await waitFor(() => {
      fireEvent.change(emailInput, {target: {value: 'invalidEmail'}});
    });
    expect(sessionStorage.getItem(EMAIL_SESSION_KEY)).toBe(null);

    // Session storage updates for valid email
    await waitFor(() => {
      fireEvent.change(emailInput, {target: {value: 'validEmail@email.com'}});
    });
    expect(sessionStorage.getItem(EMAIL_SESSION_KEY)).toBe(
      'validEmail@email.com'
    );
  });
});
