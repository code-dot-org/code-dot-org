import {afterEach, describe, expect, it} from 'vitest';

import {
  clearMockFixtures,
  registerMockFixture,
  type HttpMethod,
} from '@code-dot-org/core/api/mocks';

import {
  deleteAccount,
  getAccountSettings,
  updateEmail,
  updatePassword,
  updateProfile,
  updateUserType,
} from '../accounts.api';
import {AccountsApiValidationError} from '../AccountsApiValidationError';

// Error bodies captured verbatim from the real Rails controllers (design.md
// "Spike Findings"). The MSW fixtures serve exactly these so the parser is
// tested against reality, not invented shapes.
const TAKEN_USERNAME = {username: ['Username has already been taken']};
const SHORT_PASSWORD = {
  password: ['Password is too short (minimum is 6 characters)'],
};
const MALFORMED_EMAIL = {
  email: [
    'Email does not appear to be a valid e-mail address',
    'Email does not appear to be a valid e-mail address',
  ],
  'authentication_options.email': [
    'Authentication options email does not appear to be a valid e-mail address',
  ],
};
const WRONG_PASSWORD = {current_password: ['Current password is invalid']};
const DELETE_WRONG_PASSWORD = {
  error: {current_password: ['Current password is invalid']},
};

const TEACHER_SETTINGS = {
  user_type: 'teacher',
  given_name: 'Ada',
  family_name: 'Lovelace',
  display_name: 'Ada Lovelace',
  username: 'ada',
  email: 'ada@example.com',
  has_password: true,
  can_edit_email: true,
  can_edit_password: true,
  should_see_add_password_form: false,
  should_see_edit_email_link: true,
  authentication_options: [
    {credential_type: 'email', email: 'ada@example.com'},
  ],
  can_change_user_type: true,
  can_delete_own_account: true,
  age: '21+',
  us_state: null,
  dependent_students_count: 0,
};

function route(
  method: HttpMethod,
  path: string,
  status: number,
  body?: unknown,
) {
  registerMockFixture({
    method,
    path,
    respond: () =>
      new Response(body === undefined ? null : JSON.stringify(body), {
        status,
        headers: {'content-type': 'application/json'},
      }),
  });
}

afterEach(() => clearMockFixtures());

describe('getAccountSettings', () => {
  it('parses and camelCases the Rails settings response', async () => {
    route('get', '*/api/v1/account/settings', 200, TEACHER_SETTINGS);

    const settings = await getAccountSettings();

    expect(settings.userType).toBe('teacher');
    expect(settings.givenName).toBe('Ada');
    expect(settings.familyName).toBe('Lovelace');
    expect(settings.displayName).toBe('Ada Lovelace');
    expect(settings.hasPassword).toBe(true);
    expect(settings.authenticationOptions).toEqual([
      {credentialType: 'email', email: 'ada@example.com'},
    ]);
    expect(settings.dependentStudentsCount).toBe(0);
    expect(settings.usState).toBeNull();
  });

  it('rejects when the body fails schema validation', async () => {
    route('get', '*/api/v1/account/settings', 200, {user_type: 'teacher'});
    await expect(getAccountSettings()).rejects.toThrow();
  });
});

describe('mutations resolve on success', () => {
  it('updateProfile resolves on 204', async () => {
    route('patch', '*/dashboardapi/users', 204);
    await expect(
      updateProfile({givenName: 'Grace', familyName: 'Hopper'}),
    ).resolves.toBeUndefined();
  });
});

describe('422 → AccountsApiValidationError', () => {
  it('maps a taken username to a field error', async () => {
    route('patch', '*/dashboardapi/users', 422, TAKEN_USERNAME);

    const error = await updateProfile({displayName: 'x'}).catch(e => e);

    expect(error).toBeInstanceOf(AccountsApiValidationError);
    expect(error.status).toBe(422);
    expect(error.fieldErrors.username).toEqual([
      'Username has already been taken',
    ]);
    expect(error.formErrors).toEqual([]);
  });

  it('maps a short password to the password field', async () => {
    route('patch', '*/dashboardapi/users', 422, SHORT_PASSWORD);

    const error = await updatePassword({
      currentPassword: 'old',
      newPassword: 'ab',
      newPasswordConfirmation: 'ab',
    }).catch(e => e);

    expect(error).toBeInstanceOf(AccountsApiValidationError);
    expect(error.fieldErrors.password).toEqual([
      'Password is too short (minimum is 6 characters)',
    ]);
  });

  it('dedupes repeated field messages and routes dotted association keys form-level', async () => {
    route('patch', '*/users/email', 422, MALFORMED_EMAIL);

    const error = await updateEmail({
      newEmail: 'bad',
      hashedEmail: 'h',
      currentPassword: 'pw',
    }).catch(e => e);

    expect(error).toBeInstanceOf(AccountsApiValidationError);
    // The two duplicate `email` messages collapse to one field error; the
    // dotted `authentication_options.email` key is form-level (not a known field).
    expect(error.fieldErrors.email).toEqual([
      'Email does not appear to be a valid e-mail address',
    ]);
    expect(error.formErrors).toEqual([
      'Authentication options email does not appear to be a valid e-mail address',
    ]);
  });

  it('maps a wrong current password to the current_password field', async () => {
    route('patch', '*/users/email', 422, WRONG_PASSWORD);

    const error = await updateEmail({
      newEmail: 'a@b.co',
      hashedEmail: 'h',
      currentPassword: 'wrong',
    }).catch(e => e);

    expect(error.fieldErrors.current_password).toEqual([
      'Current password is invalid',
    ]);
  });

  it('routes base and unknown keys to form-level errors', async () => {
    route('patch', '*/users/user_type', 422, {
      base: ['Something went wrong'],
    });

    const error = await updateUserType({userType: 'teacher'}).catch(e => e);

    expect(error.fieldErrors).toEqual({});
    expect(error.formErrors).toEqual(['Something went wrong']);
  });

  it('treats an empty 422 body as a failure with no specific messages', async () => {
    route('patch', '*/users/user_type', 422, {});

    const error = await updateUserType({userType: 'student'}).catch(e => e);

    expect(error).toBeInstanceOf(AccountsApiValidationError);
    expect(error.isEmpty).toBe(true);
  });
});

describe('DELETE /users error envelope', () => {
  it('unwraps the 400 {error:{...}} envelope to a field error', async () => {
    route('delete', '*/users', 400, DELETE_WRONG_PASSWORD);

    const error = await deleteAccount({password: 'wrong'}).catch(e => e);

    expect(error).toBeInstanceOf(AccountsApiValidationError);
    expect(error.status).toBe(400);
    expect(error.fieldErrors.current_password).toEqual([
      'Current password is invalid',
    ]);
  });
});

describe('non-validation failures pass through', () => {
  it('rethrows a 500 as the original ApiError, not a validation error', async () => {
    route('patch', '*/dashboardapi/users', 500, {message: 'boom'});

    const error = await updateProfile({displayName: 'x'}).catch(e => e);

    expect(error).not.toBeInstanceOf(AccountsApiValidationError);
    expect(error.status).toBe(500);
  });
});
