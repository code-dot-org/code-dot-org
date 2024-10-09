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

    // Renders button that sends the user to the Finish Account page
    screen.getByRole('button', {name: locale.create_my_account()});
  });

  it('renders password error message when passwords do not match', () => {
    renderDefault();

    const passwordInput = screen.getByLabelText(locale.password());
    const confirmPasswordInput = screen.getByLabelText(
      locale.confirm_password()
    );

    // No confirm password error message on first load
    expect(screen.queryByText(i18n.passwordsMustMatch())).toBeNull();

    // Error message should appear when first password is filled in and
    // user has begun typing confirm password but it does not yet match
    fireEvent.change(passwordInput, {target: {value: 'password'}});
    fireEvent.change(confirmPasswordInput, {target: {value: 'pass'}});
    screen.getByText(i18n.passwordsMustMatch());

    // Error message should disappear when first and second passwords match
    fireEvent.change(confirmPasswordInput, {target: {value: 'password'}});
    expect(screen.queryByText(i18n.passwordsMustMatch())).toBeNull();
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

  it('gives email invalid message if given invalid email and create account pressed', async () => {
    await waitFor(() => {
      renderDefault();
    });

    const emailInput = screen.getByLabelText(locale.email_address());
    await waitFor(() => {
      fireEvent.change(emailInput, {target: {value: 'invalidEmail'}});
    });
    const password = 'password';
    const passwordInput = screen.getByLabelText(locale.password());
    const confirmPasswordInput = screen.getByLabelText(
      locale.confirm_password()
    );
    fireEvent.change(passwordInput, {target: {value: password}});
    fireEvent.change(confirmPasswordInput, {target: {value: password}});

    const finishSignUpButton = screen.getByRole('button', {
      name: locale.create_my_account(),
    }) as HTMLButtonElement;
    await waitFor(() => {
      expect(finishSignUpButton).not.toBeDisabled();
    });

    // Confirm we don't have an error message yet
    expect(screen.queryByText(i18n.censusInvalidEmail())).toBeNull();

    // Click create account button
    fireEvent.click(finishSignUpButton);
    // Confirm we have an error message
    expect(screen.queryByText(i18n.censusInvalidEmail()));
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
    const beginSignUpParams = {
      new_sign_up: true,
      user: {
        email: email,
        password: password,
        password_confirmation: password,
      },
    };

    fireEvent.change(emailInput, {
      target: {value: email},
    });
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
      expect(fetchCall.args[0]).toEqual('/users/begin_sign_up');
      expect(fetchCall.args[1]?.body).toEqual(
        JSON.stringify(beginSignUpParams)
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
    const beginSignUpParams = {
      new_sign_up: true,
      user: {
        email: email,
        password: password,
        password_confirmation: password,
      },
    };

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
      expect(fetchCall.args[0]).toEqual('/users/begin_sign_up');
      expect(fetchCall.args[1]?.body).toEqual(
        JSON.stringify(beginSignUpParams)
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

    // Checks that the page is displaying student-facing LMS content
    screen.getByText(locale.does_your_school_use_an_lms());
    screen.getByText(locale.ask_your_teacher_lms());
    screen.getByAltText('Canvas logo');
    screen.getByAltText('Schoology logo');
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

    // Checks that the page is displaying teacher-facing LMS content
    screen.getByText(locale.using_lms_platforms());
    screen.getByText(locale.access_detailed_instructions());
    screen.getByText('Canvas', {selector: 'span'});
    screen.getByText('Schoology', {selector: 'span'});
  });

  it('email is stored in sessionStorage', async () => {
    await waitFor(() => {
      renderDefault();
    });

    const emailInput = screen.getByLabelText(locale.email_address());

    // Session storage starts empty
    expect(sessionStorage.getItem(EMAIL_SESSION_KEY)).toBe(null);

    await waitFor(() => {
      fireEvent.change(emailInput, {target: {value: 'invalidEmail'}});
    });
    expect(sessionStorage.getItem(EMAIL_SESSION_KEY)).toBe('invalidEmail');
  });
});
