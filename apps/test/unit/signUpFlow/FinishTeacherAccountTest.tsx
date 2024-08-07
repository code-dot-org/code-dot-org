import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import locale from '@cdo/apps/signup/locale';
import FinishTeacherAccount from '@cdo/apps/signUpFlow/FinishTeacherAccount';
import {
  USER_NAME_SESSION_KEY,
  EMAIL_OPT_IN_SESSION_KEY,
  SCHOOL_ID_SESSION_KEY,
  SCHOOL_ZIP_SESSION_KEY,
  SCHOOL_NAME_SESSION_KEY,
} from '@cdo/apps/signUpFlow/signUpFlowConstants';
import i18n from '@cdo/locale';

describe('FinishTeacherAccount', () => {
  afterEach(() => {
    [
      USER_NAME_SESSION_KEY,
      EMAIL_OPT_IN_SESSION_KEY,
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

  it('userName is tracked in sessionStorage', () => {
    renderDefault();
    const userName = 'Glen Powell';
    const userNameInput = screen.getAllByRole('textbox')[0];

    expect(sessionStorage.getItem(USER_NAME_SESSION_KEY)).toBe(null);

    fireEvent.change(userNameInput, {target: {value: userName}});
    expect(sessionStorage.getItem(USER_NAME_SESSION_KEY)).toBe(userName);
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

  it('email opt-in checkbox is tracked in sessionStorage', () => {
    renderDefault();
    const emailOptInCheckbox = screen.getByRole('checkbox');

    expect(sessionStorage.getItem(EMAIL_OPT_IN_SESSION_KEY)).toBe(null);

    fireEvent.click(emailOptInCheckbox);
    expect(sessionStorage.getItem(EMAIL_OPT_IN_SESSION_KEY)).toBe('true');

    fireEvent.click(emailOptInCheckbox);
    expect(sessionStorage.getItem(EMAIL_OPT_IN_SESSION_KEY)).toBe('false');
  });
});
