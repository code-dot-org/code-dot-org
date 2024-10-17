import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import FinishTeacherAccount from '@cdo/apps/signUpFlow/FinishTeacherAccount';
import locale from '@cdo/apps/signUpFlow/locale';
import {
  SCHOOL_ID_SESSION_KEY,
  SCHOOL_NAME_SESSION_KEY,
  SCHOOL_ZIP_SESSION_KEY,
  USER_RETURN_TO_SESSION_KEY,
} from '@cdo/apps/signUpFlow/signUpFlowConstants';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import {navigateToHref} from '@cdo/apps/utils';
import {
  UserTypes,
  NonSchoolOptions,
} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

jest.mock('@cdo/apps/schoolInfo/utils/fetchSchools');
jest.mock('@cdo/apps/util/AuthenticityTokenStore', () => ({
  getAuthenticityToken: jest.fn().mockReturnValue('authToken'),
}));

jest.mock('@cdo/apps/utils', () => ({
  ...jest.requireActual('@cdo/apps/utils'),
  navigateToHref: jest.fn(),
}));

const navigateToHrefMock = navigateToHref as jest.Mock;
const getAuthenticityTokenMock = getAuthenticityToken as jest.Mock;

describe('FinishTeacherAccount', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  function renderDefault(usIp: boolean = true) {
    render(<FinishTeacherAccount usIp={usIp} countryCode={'US'} />);
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

    // Renders email preference opt-in checkbox
    screen.getByRole('checkbox');
    screen.getByText(locale.get_informational_emails());

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
    const schoolName = 'Seattle Academy';

    // Fill out zip code and add school by name
    fireEvent.change(screen.getAllByRole('textbox')[1], {
      target: {value: zipCode},
    });
    fireEvent.change(screen.getAllByRole('combobox')[1], {
      target: {value: NonSchoolOptions.CLICK_TO_ADD},
    });
    fireEvent.change(screen.getAllByRole('textbox')[2], {
      target: {value: schoolName},
    });

    expect(sessionStorage.getItem(SCHOOL_ID_SESSION_KEY)).toBe(
      NonSchoolOptions.CLICK_TO_ADD
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

  it('leaving the displayName field empty shows error message', () => {
    renderDefault();
    const displayNameInput = screen.getAllByDisplayValue('')[0];

    // Error message doesn't show and button is disabled by default
    expect(screen.queryByText(locale.display_name_error_message())).toBe(null);

    // Enter display name
    fireEvent.change(displayNameInput, {target: {value: 'FirstName'}});

    // Error does not show when display name is entered
    expect(screen.queryByText(locale.display_name_error_message())).toBe(null);

    // Clear display name
    fireEvent.change(displayNameInput, {target: {value: ''}});

    // Error shows with empty display name
    screen.getByText(locale.display_name_error_message());
  });

  it('GDPR has expected behavior if api call returns true', async () => {
    const fetchStub = sinon.stub(window, 'fetch').resolves({
      ok: true,
      status: 200,
      json: () => Promise.resolve({gdpr: true, force_in_eu: false}),
    } as Response);

    renderDefault();

    // Check that GDPR message is displayed
    await screen.findByText(locale.data_transfer_notice());

    // Check that button is disabled until GDPR is checked (and other required fields are filled)
    const displayNameInput = screen.getAllByRole('textbox')[0];
    fireEvent.change(displayNameInput, {target: {value: 'FirstName'}});
    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    });
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    expect(finishSignUpButton.getAttribute('aria-disabled')).toBe(null);

    // Restore the original fetch implementation
    fetchStub.restore();
  });

  it('clicking finish sign up button triggers fetch call and redirects user to home page', async () => {
    const fetchStub = sinon.stub(window, 'fetch');
    fetchStub.callsFake(url => {
      if (typeof url === 'string' && url.includes('/users/gdpr_check')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({gdpr: false, force_in_eu: false}),
        } as Response);
      } else {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({success: true}),
        } as Response);
      }
    });

    // Declare parameter values and set sessionStorage variables
    const name = 'FirstName';
    const email = 'fake@email.com';
    const finishSignUpParams = {
      new_sign_up: true,
      user: {
        user_type: UserTypes.TEACHER,
        email: email,
        name: name,
        email_preference_opt_in: true,
        school_info_attributes: {
          schoolId: NonSchoolOptions.SELECT_A_SCHOOL,
          country: 'US',
          schoolName: '',
          schoolZip: '',
          schoolsList: [],
          usIp: true,
        },
        country_code: 'US',
      },
    };
    sessionStorage.setItem('email', email);

    await waitFor(() => {
      renderDefault();
    });

    // Set up finish sign up button onClick jest function
    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    }) as HTMLButtonElement;
    const handleClick = jest.fn();
    finishSignUpButton.onclick = handleClick;

    // Fill in fields
    fireEvent.change(screen.getAllByDisplayValue('')[0], {
      target: {value: name},
    });
    fireEvent.click(screen.getByRole('checkbox'));

    // Click finish sign up button
    fireEvent.click(finishSignUpButton);

    await waitFor(() => {
      // Verify the button's click handler was called
      expect(handleClick).toHaveBeenCalled();

      // Verify the authenticity token was obtained
      expect(getAuthenticityTokenMock).toHaveBeenCalled;

      // Verify the button's fetch method was called
      expect(fetchStub.calledTwice).toBe(true);
      const fetchCall = fetchStub.getCall(1);
      expect(fetchCall.args[0]).toEqual('/users');
      expect(fetchCall.args[1]?.body).toEqual(
        JSON.stringify(finishSignUpParams)
      );

      // Verify the user is redirected to the finish sign up page
      expect(navigateToHrefMock).toHaveBeenCalledWith('/home');
    });

    fetchStub.restore();
  });

  it('setting redirect url in sessionStorage then clicking finish sign up button triggers fetch call and redirects user to redirect page', async () => {
    const fetchStub = sinon.stub(window, 'fetch');
    fetchStub.callsFake(url => {
      if (typeof url === 'string' && url.includes('/users/gdpr_check')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({gdpr: false, force_in_eu: false}),
        } as Response);
      } else {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({success: true}),
        } as Response);
      }
    });

    // Declare parameter values and set sessionStorage variables
    const name = 'FirstName';
    const email = 'fake@email.com';
    const userReturnToUrl = '/sample/url';
    const finishSignUpParams = {
      new_sign_up: true,
      user: {
        user_type: UserTypes.TEACHER,
        email: email,
        name: name,
        email_preference_opt_in: true,
        school_info_attributes: {
          schoolId: NonSchoolOptions.SELECT_A_SCHOOL,
          country: 'US',
          schoolName: '',
          schoolZip: '',
          schoolsList: [],
          usIp: true,
        },
      },
    };
    sessionStorage.setItem('email', email);
    sessionStorage.setItem(USER_RETURN_TO_SESSION_KEY, userReturnToUrl);

    await waitFor(() => {
      renderDefault();
    });

    // Set up finish sign up button onClick jest function
    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    }) as HTMLButtonElement;
    const handleClick = jest.fn();
    finishSignUpButton.onclick = handleClick;

    // Fill in fields
    fireEvent.change(screen.getAllByDisplayValue('')[0], {
      target: {value: name},
    });
    fireEvent.click(screen.getByRole('checkbox'));

    // Click finish sign up button
    fireEvent.click(finishSignUpButton);

    await waitFor(() => {
      // Verify the button's click handler was called
      expect(handleClick).toHaveBeenCalled();

      // Verify the authenticity token was obtained
      expect(getAuthenticityTokenMock).toHaveBeenCalled;

      // Verify the button's fetch method was called
      expect(fetchStub.calledTwice).toBe(true);
      const fetchCall = fetchStub.getCall(1);
      expect(fetchCall.args[0]).toEqual('/users');
      expect(fetchCall.args[1]?.body).toEqual(
        JSON.stringify(finishSignUpParams)
      );

      // Verify the user is redirected to the finish sign up page
      expect(navigateToHrefMock).toHaveBeenCalledWith(userReturnToUrl);
    });

    fetchStub.restore();
  });
});
