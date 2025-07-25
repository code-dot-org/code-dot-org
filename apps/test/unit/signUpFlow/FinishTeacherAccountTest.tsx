import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import FinishTeacherAccount, {
  NAME_TYPES,
} from '@cdo/apps/signUpFlow/FinishTeacherAccount';
import locale from '@cdo/apps/signUpFlow/locale';
import {
  ACCOUNT_TYPE_SESSION_KEY,
  EMAIL_SESSION_KEY,
  MAX_DISPLAY_NAME_LENGTH,
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

jest.mock('@cdo/apps/schoolInfo/utils/fetchSchools', () => ({
  fetchSchools: jest.fn().mockResolvedValue([]),
}));
jest.mock('@cdo/apps/util/AuthenticityTokenStore', () => ({
  getAuthenticityToken: jest.fn().mockReturnValue('authToken'),
}));

jest.mock('@cdo/apps/utils', () => ({
  ...jest.requireActual('@cdo/apps/utils'),
  navigateToHref: jest.fn(),
}));

const navigateToHrefMock = navigateToHref as jest.Mock;
const getAuthenticityTokenMock = getAuthenticityToken as jest.Mock;

const FINISH_SIGN_UP_PARAMS = {
  user: {
    user_type: UserTypes.TEACHER,
    email: 'fake@email.com',
    given_name: 'Firstname',
    family_name: 'Lastname',
    name: 'Ms. DisplayName',
    email_preference_opt_in: true,
    school_info_attributes: {
      country: 'AU',
      school_name: 'Test School',
    },
    country_code: 'US',
    educator_role: 'classroom_teacher',
  },
};

describe('FinishTeacherAccount', () => {
  let fetchStub: sinon.SinonStub;

  beforeEach(() => {
    sessionStorage.clear();

    // Stub fetch to return a default mock response
    fetchStub = sinon.stub(window, 'fetch').resolves({
      ok: true,
      status: 200,
      json: () => Promise.resolve({gdpr: false, force_in_eu: false}),
    } as Response);
  });

  afterEach(() => {
    // Restore the original fetch
    fetchStub.restore();
  });

  function renderDefault(
    usIp: boolean = true,
    setAccountType: boolean = true,
    setLoginType: boolean = true
  ) {
    if (setAccountType) {
      sessionStorage.setItem(ACCOUNT_TYPE_SESSION_KEY, 'teacher');
    }
    if (setLoginType) {
      sessionStorage.setItem(EMAIL_SESSION_KEY, 'fake@email.com');
    }
    render(<FinishTeacherAccount usIp={usIp} countryCode={'US'} />);
  }

  function fillInFormFields(
    fillInNameFields: boolean = true,
    fillInRoleField: boolean = true
  ) {
    if (fillInNameFields) {
      fireEvent.change(screen.getByLabelText(locale.first_name()), {
        target: {value: FINISH_SIGN_UP_PARAMS.user.given_name},
      });
      fireEvent.change(screen.getByLabelText(locale.last_name()), {
        target: {value: FINISH_SIGN_UP_PARAMS.user.family_name},
      });
      fireEvent.change(
        screen.getByLabelText(locale.what_do_you_want_to_be_called()),
        {target: {value: FINISH_SIGN_UP_PARAMS.user.name}}
      );
    }
    if (fillInRoleField) {
      fireEvent.change(screen.getByLabelText(locale.what_is_your_role()), {
        target: {value: FINISH_SIGN_UP_PARAMS.user.educator_role},
      });
    }
    fireEvent.change(screen.getByLabelText(i18n.whatCountry()), {
      target: {
        value: FINISH_SIGN_UP_PARAMS.user.school_info_attributes.country,
      },
    });
    fireEvent.change(screen.getByLabelText(i18n.schoolOrganizationQuestion()), {
      target: {
        value: FINISH_SIGN_UP_PARAMS.user.school_info_attributes.school_name,
      },
    });
    fireEvent.click(
      screen.getByRole('checkbox', {name: locale.get_informational_emails()})
    );
  }

  it('redirects user back to account type page if they have not selected account type', async () => {
    await waitFor(() => {
      renderDefault(true, false, false);
    });

    expect(navigateToHrefMock).toHaveBeenCalledWith(
      '/users/sign_up/account_type'
    );
  });

  it('redirects user back to account type page if invalid user type set', async () => {
    sessionStorage.setItem(ACCOUNT_TYPE_SESSION_KEY, 'invalid');

    await waitFor(() => {
      renderDefault(true, false, false);
    });

    expect(navigateToHrefMock).toHaveBeenCalledWith(
      '/users/sign_up/account_type'
    );
  });

  it('redirects user back to login type page if they have not selected login type', async () => {
    await waitFor(() => {
      renderDefault(true, true, false);
    });

    expect(navigateToHrefMock).toHaveBeenCalledWith(
      `/users/sign_up/login_type?user_type=${UserTypes.TEACHER}`
    );
  });

  it('renders finish teacher account page with school zip when usIp is true', async () => {
    await waitFor(renderDefault);

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
    screen.getByRole('checkbox', {name: locale.get_informational_emails()});
    screen.getByText(locale.get_informational_emails());

    // Renders button that finishes sign-up
    screen.getByText(locale.go_to_my_account());
  });

  it('renders finish teacher account page with school name when usIp is false', async () => {
    await waitFor(() => {
      renderDefault(false);
    });

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

  it('school info is tracked in sessionStorage', async () => {
    await waitFor(renderDefault);

    const zipCode = '98122';
    const schoolName = 'Seattle Academy';

    // Fill out zip code and add school by name
    fireEvent.change(screen.getByLabelText(i18n.enterYourSchoolZip()), {
      target: {value: zipCode},
    });
    fireEvent.change(screen.getByLabelText(i18n.selectYourSchool()), {
      target: {value: NonSchoolOptions.CLICK_TO_ADD},
    });
    fireEvent.change(screen.getByLabelText(i18n.schoolOrganizationQuestion()), {
      target: {value: schoolName},
    });

    expect(sessionStorage.getItem(SCHOOL_ID_SESSION_KEY)).toBe(
      NonSchoolOptions.CLICK_TO_ADD
    );
    expect(sessionStorage.getItem(SCHOOL_ZIP_SESSION_KEY)).toBe(zipCode);
    expect(sessionStorage.getItem(SCHOOL_NAME_SESSION_KEY)).toBe(schoolName);
  });

  it('finish teacher signup button starts disabled', async () => {
    await waitFor(renderDefault);

    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    });
    expect(finishSignUpButton).toBeDisabled();
  });

  it('leaving the name fields empty shows error message for each', async () => {
    await waitFor(renderDefault);
    const givenNameInput = screen.getByLabelText(locale.first_name());
    const familyNameInput = screen.getByLabelText(locale.last_name());
    const displayNameInput = screen.getByLabelText(
      locale.what_do_you_want_to_be_called()
    );
    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    });

    // Errors don't show and button is disabled by default
    Object.values(NAME_TYPES).forEach(nameType =>
      expect(
        screen.queryByText(
          locale.name_error_message({
            nameType: `${nameType}`.toLowerCase(),
          })
        )
      ).toBe(null)
    );
    expect(finishSignUpButton).toBeDisabled();

    fillInFormFields();

    // Errors don't show and button is enabled when names are entered
    Object.values(NAME_TYPES).forEach(nameType =>
      expect(
        screen.queryByText(
          locale.name_error_message({
            nameType: `${nameType}`.toLowerCase(),
          })
        )
      ).toBe(null)
    );
    expect(finishSignUpButton).toBeEnabled();

    // Clear names
    fireEvent.change(givenNameInput, {target: {value: ''}});
    fireEvent.change(familyNameInput, {target: {value: ''}});
    fireEvent.change(displayNameInput, {target: {value: ''}});

    // Errors show for each name field and button is disabled
    Object.values(NAME_TYPES).forEach(nameType =>
      screen.getByText(
        locale.name_error_message({
          nameType: `${nameType}`.toLowerCase(),
        })
      )
    );
    expect(finishSignUpButton).toBeDisabled();
  });

  it('only whitespace in the name fields shows error message for each', async () => {
    await waitFor(renderDefault);
    const givenNameInput = screen.getByLabelText(locale.first_name());
    const familyNameInput = screen.getByLabelText(locale.last_name());
    const displayNameInput = screen.getByLabelText(
      locale.what_do_you_want_to_be_called()
    );
    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    });

    // Errors don't show and button is disabled by default
    Object.values(NAME_TYPES).forEach(nameType =>
      expect(
        screen.queryByText(
          locale.name_error_message({
            nameType: `${nameType}`.toLowerCase(),
          })
        )
      ).toBe(null)
    );
    expect(finishSignUpButton).toBeDisabled();

    // Enter whitespace names
    fillInFormFields(false, true);
    fireEvent.change(givenNameInput, {target: {value: '     '}});
    fireEvent.change(familyNameInput, {target: {value: '   '}});
    fireEvent.change(displayNameInput, {target: {value: ' '}});

    // Errors show for each name field and button is disabled
    Object.values(NAME_TYPES).forEach(nameType =>
      screen.getByText(
        locale.name_error_message({
          nameType: `${nameType}`.toLowerCase(),
        })
      )
    );
    expect(finishSignUpButton).toBeDisabled();
  });

  it('adding a long name in the name fields shows error message for each', async () => {
    await waitFor(renderDefault);
    const givenNameInput = screen.getByLabelText(locale.first_name());
    const familyNameInput = screen.getByLabelText(locale.last_name());
    const displayNameInput = screen.getByLabelText(
      locale.what_do_you_want_to_be_called()
    );
    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    });

    // Errors don't show and button is disabled by default
    Object.values(NAME_TYPES).forEach(nameType =>
      expect(
        screen.queryByText(
          locale.name_error_message({
            nameType: `${nameType}`.toLowerCase(),
          })
        )
      ).toBe(null)
    );
    expect(finishSignUpButton).toBeDisabled();

    // Enter long names
    fillInFormFields(false, true);
    fireEvent.change(givenNameInput, {
      target: {value: 'a'.repeat(MAX_DISPLAY_NAME_LENGTH + 1)},
    });
    fireEvent.change(familyNameInput, {
      target: {value: 'a'.repeat(MAX_DISPLAY_NAME_LENGTH + 1)},
    });
    fireEvent.change(displayNameInput, {
      target: {value: 'a'.repeat(MAX_DISPLAY_NAME_LENGTH + 1)},
    });

    // Errors show for each name field and button is disabled
    Object.values(NAME_TYPES).forEach(nameType =>
      screen.getByText(
        locale.name_too_long_error_message({
          nameType: nameType,
          maxLength: MAX_DISPLAY_NAME_LENGTH,
        })
      )
    );
    expect(finishSignUpButton).toBeDisabled();
  });

  it('requires educator role', async () => {
    await waitFor(renderDefault);

    const roleDropdown = screen.getByLabelText(locale.what_is_your_role());
    expect(roleDropdown).toBeInTheDocument();

    fillInFormFields(true, false);

    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    });
    expect(finishSignUpButton).toBeDisabled();

    fireEvent.change(roleDropdown, {target: {value: 'classroom_teacher'}});

    expect(finishSignUpButton).toBeEnabled();
  });

  it('GDPR has expected behavior if api call returns true', async () => {
    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.resolve({gdpr: true, force_in_eu: false}),
    } as Response);

    await waitFor(renderDefault);

    // Check that GDPR message is displayed
    await screen.findByText(locale.data_transfer_notice());

    // Check that button is disabled until GDPR is checked (and other required fields are filled)
    fillInFormFields();
    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    });
    expect(finishSignUpButton).toBeDisabled();

    fireEvent.click(
      screen.getByRole('checkbox', {
        name: locale.data_transfer_agreement_teacher(),
      })
    );

    expect(finishSignUpButton).not.toBeDisabled();
  });

  it('clicking finish sign up button triggers fetch call and shows response error message if present in 500 error response', async () => {
    const errorMessage = 'SAMPLE ERROR MESSAGE';

    fetchStub.callsFake(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({error: errorMessage}),
      } as Response)
    );
    sessionStorage.setItem('email', FINISH_SIGN_UP_PARAMS.user.email);

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
    fillInFormFields();

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
        JSON.stringify(FINISH_SIGN_UP_PARAMS)
      );

      // Verify the user is NOT redirected to the finish sign up page
      expect(navigateToHrefMock).toHaveBeenCalledTimes(0);
      // Verify the error message is shown. Since the message includes a hyperlinked email, it requires the use of a
      // SafeMarkdown tag, so the email itself is checked to know if the message shows.
      screen.getByText(errorMessage);
    });
  });

  it('clicking finish sign up button triggers fetch call and shows generic error if no error message in 500 error response', async () => {
    fetchStub.callsFake(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({success: false}),
      } as Response)
    );
    sessionStorage.setItem('email', FINISH_SIGN_UP_PARAMS.user.email);

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
    fillInFormFields();

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
        JSON.stringify(FINISH_SIGN_UP_PARAMS)
      );

      // Verify the user is NOT redirected to the finish sign up page
      expect(navigateToHrefMock).toHaveBeenCalledTimes(0);
      // Verify the error message is shown. Since the message includes a hyperlinked email, it requires the use of a
      // SafeMarkdown tag, so the email itself is checked to know if the message shows.
      screen.getByText('support@code.org');
    });
  });

  it('clicking finish sign up button triggers fetch call and redirects user to home page upon success', async () => {
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
    sessionStorage.setItem('email', FINISH_SIGN_UP_PARAMS.user.email);

    await waitFor(renderDefault);

    // Set up finish sign up button onClick jest function
    const finishSignUpButton = screen.getByRole('button', {
      name: locale.go_to_my_account(),
    }) as HTMLButtonElement;
    const handleClick = jest.fn();
    finishSignUpButton.onclick = handleClick;

    // Fill in fields
    fillInFormFields();

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
        JSON.stringify(FINISH_SIGN_UP_PARAMS)
      );

      // Verify the user is redirected to the finish sign up page
      expect(navigateToHrefMock).toHaveBeenCalledWith('/home');
    });
  });

  it('setting redirect url in sessionStorage then clicking finish sign up button triggers fetch call and redirects user to redirect page', async () => {
    const userReturnToUrl = '/sample/url';

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

    // Set sessionStorage variables
    sessionStorage.setItem('email', FINISH_SIGN_UP_PARAMS.user.email);
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
    fillInFormFields();

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
        JSON.stringify(FINISH_SIGN_UP_PARAMS)
      );

      // Verify the user is redirected to the finish sign up page
      expect(navigateToHrefMock).toHaveBeenCalledWith(userReturnToUrl);
    });
  });
});
