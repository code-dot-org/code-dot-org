import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import FinishStudentAccount from '@cdo/apps/signUpFlow/FinishStudentAccount';
import locale from '@cdo/apps/signUpFlow/locale';
import {
  IS_PARENT_SESSION_KEY,
  PARENT_EMAIL_SESSION_KEY,
  PARENT_EMAIL_OPT_IN_SESSION_KEY,
  USER_AGE_SESSION_KEY,
  USER_STATE_SESSION_KEY,
  USER_GENDER_SESSION_KEY,
} from '@cdo/apps/signUpFlow/signUpFlowConstants';

describe('FinishStudentAccount', () => {
  const ageOptions = [
    {value: '', text: ''},
    {value: '4', text: '4'},
    {value: '5', text: '5'},
    {value: '6', text: '6'},
  ];

  const usStateOptions = [
    {value: '', text: ''},
    {value: 'AZ', text: 'Arizona'},
    {value: 'NY', text: 'New York'},
    {value: 'WA', text: 'Washington'},
  ];

  afterEach(() => {
    sessionStorage.clear();
  });

  function renderDefault(usIp: boolean = true) {
    render(
      <FinishStudentAccount
        ageOptions={ageOptions}
        usIp={usIp}
        usStateOptions={usStateOptions}
      />
    );
  }

  it('renders finish student account page fields', () => {
    renderDefault();

    // Renders page title
    screen.getByText(locale.finish_creating_student_account());

    // Renders student questions
    screen.getByText(locale.i_am_a_parent_or_guardian());
    screen.getByText(locale.display_name_eg());
    screen.getByText(locale.what_is_your_age());
    screen.getByText(locale.what_state_are_you_in());
    screen.getByText(locale.what_is_your_gender());

    // Renders button that finishes sign-up
    screen.getByText(locale.go_to_my_account());

    // Does not render parent questions if parent checkbox is unchecked
    expect(screen.queryByText(locale.parent_guardian_email())).toBe(null);
    expect(screen.queryByText(locale.keep_me_updated())).toBe(null);
  });

  it('renders finish student account page fields with parent fields when parent checkbox is checked', () => {
    renderDefault();

    // Click parent checkbox
    fireEvent.click(screen.getAllByRole('checkbox')[0]);

    // Renders page title
    screen.getByText(locale.finish_creating_student_account());

    // Renders parent questions
    screen.getByText(locale.parent_guardian_email());
    screen.getByText(locale.keep_me_updated());

    // Renders student questions
    screen.getByText(locale.i_am_a_parent_or_guardian());
    screen.getByText(locale.display_name_eg());
    screen.getByText(locale.what_is_your_age());
    screen.getByText(locale.what_state_are_you_in());
    screen.getByText(locale.what_is_your_gender());

    // Renders button that finishes sign-up
    screen.getByText(locale.go_to_my_account());
  });

  it('userAge is tracked in sessionStorage', () => {
    renderDefault();
    const userAgeInput = screen.getAllByRole('combobox')[0];

    expect(sessionStorage.getItem(USER_AGE_SESSION_KEY)).toBe(null);

    fireEvent.change(userAgeInput, {target: {value: '5'}});
    expect(sessionStorage.getItem(USER_AGE_SESSION_KEY)).toBe('5');
  });

  it('userState is tracked in sessionStorage', () => {
    renderDefault();
    const userStateInput = screen.getAllByRole('combobox')[1];

    expect(sessionStorage.getItem(USER_STATE_SESSION_KEY)).toBe(null);

    fireEvent.change(userStateInput, {target: {value: 'WA'}});
    expect(sessionStorage.getItem(USER_STATE_SESSION_KEY)).toBe('WA');
  });

  it('userGender is tracked in sessionStorage', () => {
    renderDefault();
    const userGender = 'Female';
    const userGenderInput = screen.getAllByRole('textbox')[1];

    expect(sessionStorage.getItem(USER_GENDER_SESSION_KEY)).toBe(null);

    fireEvent.change(userGenderInput, {target: {value: userGender}});
    expect(sessionStorage.getItem(USER_GENDER_SESSION_KEY)).toBe(userGender);
  });

  it('userParentEmail is tracked in sessionStorage', () => {
    renderDefault();

    // Click parent checkbox to show parent email field
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    expect(sessionStorage.getItem(IS_PARENT_SESSION_KEY)).toBe('true');

    // Check parent email field
    const userParentEmail = 'parent@adult.com';
    const userParentEmailInput = screen.getAllByRole('textbox')[0];

    expect(sessionStorage.getItem(PARENT_EMAIL_SESSION_KEY)).toBe(null);

    fireEvent.change(userParentEmailInput, {target: {value: userParentEmail}});
    expect(sessionStorage.getItem(PARENT_EMAIL_SESSION_KEY)).toBe(
      userParentEmail
    );
  });

  it('userParentEmailOptIn is tracked in sessionStorage', () => {
    renderDefault();

    // Click parent checkbox to show parent email opt-in field
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    expect(sessionStorage.getItem(IS_PARENT_SESSION_KEY)).toBe('true');

    // Check parent email opt-in field
    expect(sessionStorage.getItem(PARENT_EMAIL_OPT_IN_SESSION_KEY)).toBe(null);

    fireEvent.click(screen.getAllByRole('checkbox')[1]);
    expect(sessionStorage.getItem(PARENT_EMAIL_OPT_IN_SESSION_KEY)).toBe(
      'true'
    );
  });

  it('finish student signup button starts disabled', () => {
    renderDefault();

    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    });
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe('true');
  });

  it('leaving the displayName field empty shows error message and disabled submit button until display name is entered', () => {
    renderDefault();
    const displayNameInput = screen.getAllByDisplayValue('')[1];
    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    });

    // Set other required fields
    const ageInput = screen.getAllByRole('combobox')[0];
    const stateInput = screen.getAllByRole('combobox')[1];
    fireEvent.change(ageInput, {target: {value: '6'}});
    fireEvent.change(stateInput, {target: {value: 'WA'}});

    // Error message doesn't show and button is disabled by default
    expect(screen.queryByText(locale.display_name_error_message())).toBe(null);
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe('true');

    // Enter display name
    fireEvent.change(displayNameInput, {target: {value: 'FirstName'}});

    // Error does not show and button is enabled when display name is entered
    expect(screen.queryByText(locale.display_name_error_message())).toBe(null);
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe(null);

    // Clear display name
    fireEvent.change(displayNameInput, {target: {value: ''}});

    // Error shows and button is disabled with empty display name
    screen.getByText(locale.display_name_error_message());
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe('true');
  });

  it('leaving the age field empty shows error message and disabled submit button until age is entered', () => {
    renderDefault();
    const ageInput = screen.getAllByRole('combobox')[0];
    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    });

    // Set other required fields
    const displayNameInput = screen.getAllByDisplayValue('')[1];
    const stateInput = screen.getAllByRole('combobox')[1];
    fireEvent.change(displayNameInput, {target: {value: 'FirstName'}});
    fireEvent.change(stateInput, {target: {value: 'WA'}});

    // Error message doesn't show and button is disabled by default
    expect(screen.queryByText(locale.age_error_message())).toBe(null);
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe('true');

    // Enter age
    fireEvent.change(ageInput, {target: {value: '6'}});

    // Error does not show and button is enabled when age is entered
    expect(screen.queryByText(locale.age_error_message())).toBe(null);
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe(null);

    // Clear age
    fireEvent.change(ageInput, {target: {value: ''}});

    // Error shows and button is disabled with empty age
    screen.getByText(locale.age_error_message());
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe('true');
  });

  it('leaving the state field empty shows error message and disabled submit button until state is entered for US users', () => {
    renderDefault();
    const stateInput = screen.getAllByRole('combobox')[1];
    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    });

    // Set other required fields
    const displayNameInput = screen.getAllByDisplayValue('')[1];
    const ageInput = screen.getAllByRole('combobox')[0];
    fireEvent.change(displayNameInput, {target: {value: 'FirstName'}});
    fireEvent.change(ageInput, {target: {value: '6'}});

    // Error message doesn't show and button is disabled by default
    expect(screen.queryByText(locale.state_error_message())).toBe(null);
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe('true');

    // Enter state
    fireEvent.change(stateInput, {target: {value: 'WA'}});

    // Error does not show and button is enabled when state is entered
    expect(screen.queryByText(locale.state_error_message())).toBe(null);
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe(null);

    // Clear state
    fireEvent.change(stateInput, {target: {value: ''}});

    // Error shows and button is disabled with empty state
    screen.getByText(locale.state_error_message());
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe('true');
  });

  it('state field is not required if user is not detected in the U.S.', () => {
    renderDefault(false);
    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    });

    // Set all required fields (which excludes 'state' in this case)
    const displayNameInput = screen.getAllByDisplayValue('')[1];
    const ageInput = screen.getAllByRole('combobox')[0];
    fireEvent.change(displayNameInput, {target: {value: 'FirstName'}});
    fireEvent.change(ageInput, {target: {value: '6'}});

    // Button is enabled without having to enter anything for 'state'
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe(null);
  });

  it('parentEmail error shows if parent checkbox is selected and parentEmail is selected then cleared', () => {
    renderDefault();
    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    });

    // Set other required fields
    const displayNameInput = screen.getAllByDisplayValue('')[1];
    const stateInput = screen.getAllByRole('combobox')[1];
    const ageInput = screen.getAllByRole('combobox')[0];
    fireEvent.change(displayNameInput, {target: {value: 'FirstName'}});
    fireEvent.change(stateInput, {target: {value: 'WA'}});
    fireEvent.change(ageInput, {target: {value: '6'}});

    // Button is enabled after required fields are filled before parent checkbox is checked
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe(null);

    // Check parent checkbox
    fireEvent.click(screen.getAllByRole('checkbox')[0]);

    // Error message doesn't show and button is disabled after parent checkbox is checked
    const parentEmailInput = screen.getAllByDisplayValue('')[1];
    expect(screen.queryByText(locale.email_error_message())).toBe(null);
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe('true');

    // Enter state
    fireEvent.change(parentEmailInput, {target: {value: 'parent@email.com'}});

    // Error does not show and button is enabled when email is entered
    expect(screen.queryByText(locale.email_error_message())).toBe(null);
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe(null);

    // Clear state
    fireEvent.change(parentEmailInput, {target: {value: ''}});

    // Error shows and button is disabled with empty email
    screen.getByText(locale.email_error_message());
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe('true');
  });
});
