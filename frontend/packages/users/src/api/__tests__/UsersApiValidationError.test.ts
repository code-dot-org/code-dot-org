import {describe, expect, it} from 'vitest';

import {ApiError} from '@code-dot-org/core/api';

import {
  UsersApiValidationError,
  asUsersValidationError,
} from '../UsersApiValidationError';

// Error bodies captured verbatim from the real Rails controllers, so the parser
// is tested against reality, not invented shapes.
const TAKEN_USERNAME = {username: ['Username has already been taken']};
const MALFORMED_EMAIL = {
  email: [
    'Email does not appear to be a valid e-mail address',
    'Email does not appear to be a valid e-mail address',
  ],
  'authentication_options.email': [
    'Authentication options email does not appear to be a valid e-mail address',
  ],
};
const PARENT_EMAIL_INVALID = {parent_email: ['Parent email is invalid']};
const DELETE_WRONG_PASSWORD = {
  error: {current_password: ['Current password is invalid']},
};

function apiError(status: number, body: unknown): ApiError {
  return new ApiError(`Request failed -> ${status}`, {
    status,
    statusText: '',
    type: 'default',
    url: '/x',
    method: 'PATCH',
    headers: new Headers(),
    body,
  });
}

describe('UsersApiValidationError.fromApiError', () => {
  it('routes a known field key to fieldErrors', () => {
    const error = UsersApiValidationError.fromApiError(
      apiError(422, TAKEN_USERNAME),
    );
    expect(error.status).toBe(422);
    expect(error.fieldErrors.username).toEqual([
      'Username has already been taken',
    ]);
    expect(error.formErrors).toEqual([]);
  });

  it('routes parent_email to a field error', () => {
    const error = UsersApiValidationError.fromApiError(
      apiError(422, PARENT_EMAIL_INVALID),
    );
    expect(error.fieldErrors.parent_email).toEqual(['Parent email is invalid']);
  });

  it('aliases the server parent_email_preference_email key onto parent_email', () => {
    // set_parent_email maps parent_email -> parent_email_preference_email, so a
    // validation error returns under that key; it must show on the field.
    const error = UsersApiValidationError.fromApiError(
      apiError(422, {
        parent_email_preference_email: ['Parent email is invalid'],
      }),
    );
    expect(error.fieldErrors.parent_email).toEqual(['Parent email is invalid']);
    expect(error.formErrors).toEqual([]);
  });

  it('treats an unparseable (non-object) 422 body as empty, not a crash', () => {
    const error = UsersApiValidationError.fromApiError(
      apiError(422, 'Unprocessable Entity'),
    );
    expect(error.isEmpty).toBe(true);
  });

  it('dedupes repeated messages and sends dotted/unknown keys form-level', () => {
    const error = UsersApiValidationError.fromApiError(
      apiError(422, MALFORMED_EMAIL),
    );
    expect(error.fieldErrors.email).toEqual([
      'Email does not appear to be a valid e-mail address',
    ]);
    expect(error.formErrors).toEqual([
      'Authentication options email does not appear to be a valid e-mail address',
    ]);
  });

  it('routes base and unknown keys to form-level errors', () => {
    const error = UsersApiValidationError.fromApiError(
      apiError(422, {base: ['Something went wrong']}),
    );
    expect(error.fieldErrors).toEqual({});
    expect(error.formErrors).toEqual(['Something went wrong']);
  });

  it('treats an empty 422 body as a failure with no specific messages', () => {
    const error = UsersApiValidationError.fromApiError(apiError(422, {}));
    expect(error.isEmpty).toBe(true);
  });

  it('unwraps the DELETE 400 {error:{...}} envelope', () => {
    const error = UsersApiValidationError.fromApiError(
      apiError(400, DELETE_WRONG_PASSWORD),
    );
    expect(error.status).toBe(400);
    expect(error.fieldErrors.current_password).toEqual([
      'Current password is invalid',
    ]);
  });
});

describe('asUsersValidationError', () => {
  it('converts a 422 ApiError', () => {
    expect(
      asUsersValidationError(apiError(422, TAKEN_USERNAME)),
    ).toBeInstanceOf(UsersApiValidationError);
  });

  it('converts a 400 ApiError', () => {
    expect(
      asUsersValidationError(apiError(400, DELETE_WRONG_PASSWORD)),
    ).toBeInstanceOf(UsersApiValidationError);
  });

  it('ignores non-validation failures (5xx, network) and non-ApiErrors', () => {
    expect(asUsersValidationError(apiError(500, {message: 'boom'}))).toBeNull();
    expect(asUsersValidationError(new Error('network'))).toBeNull();
  });
});
