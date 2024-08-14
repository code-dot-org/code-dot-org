import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import FinishStudentAccount from '@cdo/apps/signUpFlow/FinishStudentAccount';
import locale from '@cdo/apps/signUpFlow/locale';
import {
  IS_PARENT_SESSION_KEY,
  PARENT_EMAIL_SESSION_KEY,
  PARENT_EMAIL_OPT_IN_SESSION_KEY,
  USER_NAME_SESSION_KEY,
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
    sessionStorage.removeItem(USER_NAME_SESSION_KEY);
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

  it('userName is tracked in sessionStorage', () => {
    renderDefault();
    const userName = 'Glen Powell';
    const userNameInput = screen.getAllByRole('textbox')[0];

    expect(sessionStorage.getItem(USER_NAME_SESSION_KEY)).toBe(null);

    fireEvent.change(userNameInput, {target: {value: userName}});
    expect(sessionStorage.getItem(USER_NAME_SESSION_KEY)).toBe(userName);
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
});
