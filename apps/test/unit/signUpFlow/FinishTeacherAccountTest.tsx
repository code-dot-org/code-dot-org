import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import FinishTeacherAccount from '@cdo/apps/signUpFlow/FinishTeacherAccount';
import locale from '@cdo/apps/signUpFlow/locale';
import {
  SCHOOL_ID_SESSION_KEY,
  SCHOOL_ZIP_SESSION_KEY,
  SCHOOL_NAME_SESSION_KEY,
} from '@cdo/apps/signUpFlow/signUpFlowConstants';
import i18n from '@cdo/locale';

describe('FinishTeacherAccount', () => {
  afterEach(() => {
    [
      SCHOOL_ID_SESSION_KEY,
      SCHOOL_ZIP_SESSION_KEY,
      SCHOOL_NAME_SESSION_KEY,
    ].forEach((session_key: string) => {
      sessionStorage.removeItem(session_key);
    });
  });

  function renderDefault(usIp: boolean = true) {
    render(<FinishTeacherAccount usIp={usIp} />);
  }

  it('renders finish teacher account page with school zip when usIp is true', () => {
    renderDefault(true);

    // Renders page title
    screen.getByText(locale.finish_creating_teacher_account());

    // Renders questions shown regardless of usIp
    screen.getByText(locale.what_do_you_want_to_be_called());
    screen.getByText(i18n.whatCountry());
    screen.getByText(locale.keep_me_updated());

    // Renders school zip and select school questions if usIp is true
    screen.getByText(i18n.enterYourSchoolZip());
    screen.getByText(i18n.selectYourSchool());
    expect(screen.queryByText(i18n.schoolOrganizationQuestion())).toBe(null);

    // Renders button that finishes sign-up
    screen.getByText(locale.go_to_my_account());
  });

  it('renders finish teacher account page with school name when usIp is false', () => {
    renderDefault(false);

    // Renders page title
    screen.getByText(locale.finish_creating_teacher_account());

    // Renders questions shown regardless of usIp
    screen.getByText(locale.what_do_you_want_to_be_called());
    screen.getByText(i18n.whatCountry());
    screen.getByText(locale.keep_me_updated());

    // Renders school name/organization if usIp is false
    expect(screen.queryByText(i18n.enterYourSchoolZip())).toBe(null);
    expect(screen.queryByText(i18n.selectYourSchool())).toBe(null);
    screen.getByText(i18n.schoolOrganizationQuestion());

    // Renders button that finishes sign-up
    screen.getByText(locale.go_to_my_account());
  });

  it('school info is tracked in sessionStorage', () => {
    renderDefault();
    const zipCode = '98122';
    const clickToAddSchool = 'clickToAdd';
    const schoolName = 'Seattle Academy';

    // Fill out zip code and add school by name
    fireEvent.change(screen.getAllByRole('textbox')[1], {
      target: {value: zipCode},
    });
    fireEvent.change(screen.getAllByRole('combobox')[1], {
      target: {value: clickToAddSchool},
    });
    fireEvent.change(screen.getAllByRole('textbox')[2], {
      target: {value: schoolName},
    });

    expect(sessionStorage.getItem(SCHOOL_ID_SESSION_KEY)).toBe(
      clickToAddSchool
    );
    expect(sessionStorage.getItem(SCHOOL_ZIP_SESSION_KEY)).toBe(zipCode);
    expect(sessionStorage.getItem(SCHOOL_NAME_SESSION_KEY)).toBe(schoolName);
  });

  it('finish teacher signup button starts disabled', () => {
    renderDefault();

    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    });
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe('true');
  });

  it('leaving the displayName field empty shows error message and disabled button until display name is entered', () => {
    renderDefault();
    const displayNameInput = screen.getAllByDisplayValue('')[0];
    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    });

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
});
