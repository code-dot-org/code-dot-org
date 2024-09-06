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
    [
      IS_PARENT_SESSION_KEY,
      PARENT_EMAIL_SESSION_KEY,
      PARENT_EMAIL_OPT_IN_SESSION_KEY,
      USER_AGE_SESSION_KEY,
      USER_STATE_SESSION_KEY,
      USER_GENDER_SESSION_KEY,
    ].forEach((session_key: string) => {
      sessionStorage.removeItem(session_key);
    });
  });

  function renderDefault() {
    render(
      <FinishStudentAccount
        ageOptions={ageOptions}
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

  it('displayName error shows if name is entered then deleted', () => {
    renderDefault();
    const displayNameInput = screen.getAllByDisplayValue('')[1];

    // Error message doesn't show by default
    expect(screen.queryByText(locale.display_name_error_message())).toBe(null);

    // Enter display name
    fireEvent.change(displayNameInput, {target: {value: 'FirstName'}});

    // Error message doesn't show when display name is entered
    expect(screen.queryByText(locale.display_name_error_message())).toBe(null);

    // Clear display name
    fireEvent.change(displayNameInput, {target: {value: ''}});

    // Error shows with empty display name
    screen.getByText(locale.display_name_error_message());
  });

  it('age error shows if age is selected then cleared', () => {
    renderDefault();
    const ageInput = screen.getAllByRole('combobox')[0];

    // Error message doesn't show by default
    expect(screen.queryByText(locale.age_error_message())).toBe(null);

    // Enter age
    fireEvent.change(ageInput, {target: {value: '6'}});

    // Error message doesn't show when age is selected
    expect(screen.queryByText(locale.age_error_message())).toBe(null);

    // Clear age
    fireEvent.change(ageInput, {target: {value: ''}});

    // Error shows with empty age
    screen.getByText(locale.age_error_message());
  });

  it('state error shows if state is selected then cleared', () => {
    renderDefault();
    const stateInput = screen.getAllByRole('combobox')[1];

    // Error message doesn't show by default
    expect(screen.queryByText(locale.state_error_message())).toBe(null);

    // Enter state
    fireEvent.change(stateInput, {target: {value: 'WA'}});

    // Error message doesn't show when state is selected
    expect(screen.queryByText(locale.state_error_message())).toBe(null);

    // Clear state
    fireEvent.change(stateInput, {target: {value: ''}});

    // Error shows with empty state
    screen.getByText(locale.state_error_message());
  });

  it('parentEmail error shows if parent checkbox is selected and parentEmail is selected then cleared', () => {
    renderDefault();

    // Check parent checkbox
    fireEvent.click(screen.getAllByRole('checkbox')[0]);

    // Error message doesn't show by default
    const parentEmailInput = screen.getAllByDisplayValue('')[1];
    expect(screen.queryByText(locale.email_error_message())).toBe(null);

    // Enter state
    fireEvent.change(parentEmailInput, {target: {value: 'parent@email.com'}});

    // Error message doesn't show when state is selected
    expect(screen.queryByText(locale.email_error_message())).toBe(null);

    // Clear state
    fireEvent.change(parentEmailInput, {target: {value: ''}});

    // Error shows with empty state
    screen.getByText(locale.email_error_message());
  });

  it('finish student signup button starts disabled', () => {
    renderDefault();

    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    });
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe('true');
  });

  it('finish student signup button is disabled until required fields are entered without errors', () => {
    renderDefault();

    // Cause an error in each required field by filling it in then clearing it
    fireEvent.click(screen.getAllByRole('checkbox')[0]);

    const parentEmailInput = screen.getAllByDisplayValue('')[1];
    fireEvent.change(parentEmailInput, {target: {value: 'parent@email.com'}});
    fireEvent.change(parentEmailInput, {target: {value: ''}});

    const displayNameInput = screen.getAllByDisplayValue('')[3];
    fireEvent.change(displayNameInput, {target: {value: 'FirstName'}});
    fireEvent.change(displayNameInput, {target: {value: ''}});

    const ageInput = screen.getAllByRole('combobox')[0];
    fireEvent.change(ageInput, {target: {value: '6'}});
    fireEvent.change(ageInput, {target: {value: ''}});

    const stateInput = screen.getAllByRole('combobox')[1];
    fireEvent.change(stateInput, {target: {value: 'WA'}});
    fireEvent.change(stateInput, {target: {value: ''}});

    screen.getByText(locale.display_name_error_message());
    screen.getByText(locale.email_error_message());
    screen.getByText(locale.age_error_message());
    screen.getByText(locale.state_error_message());

    // Finish student signup button is disabled
    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    });
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe('true');

    // Fill in fields to remove errors
    fireEvent.change(parentEmailInput, {target: {value: 'parent@email.com'}});
    fireEvent.change(displayNameInput, {target: {value: 'FirstName'}});
    fireEvent.change(ageInput, {target: {value: '6'}});
    fireEvent.change(stateInput, {target: {value: 'WA'}});

    expect(screen.queryByText(locale.display_name_error_message())).toBe(null);
    expect(screen.queryByText(locale.email_error_message())).toBe(null);
    expect(screen.queryByText(locale.age_error_message())).toBe(null);
    expect(screen.queryByText(locale.state_error_message())).toBe(null);

    // Finish student signup button is now enabled
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe(null);
  });
});
