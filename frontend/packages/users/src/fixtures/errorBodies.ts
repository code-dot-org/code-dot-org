// Rails error bodies captured verbatim from the real controllers, so dev and
// tests exercise actual wire shapes, not invented ones.

export const TAKEN_USERNAME = {
  username: ['Username has already been taken'],
};

export const SHORT_PASSWORD = {
  password: ['Password is too short (minimum is 6 characters)'],
};

export const MALFORMED_EMAIL = {
  email: [
    'Email does not appear to be a valid e-mail address',
    'Email does not appear to be a valid e-mail address',
  ],
  'authentication_options.email': [
    'Authentication options email does not appear to be a valid e-mail address',
  ],
};

export const WRONG_PASSWORD = {
  current_password: ['Current password is invalid'],
};

export const INVALID_PARENT_EMAIL = {
  parent_email: ['Parent/guardian email is invalid'],
};

// PATCH /api/v1/user_school_infos guards before validation and answers with a
// bare string, not the `{field: [messages]}` shape — so it surfaces as a
// generic form-level error, not a field error.
export const SCHOOL_INFO_MISSING = {
  error: 'school id or country is not present',
};

// DELETE /users returns 400 with the extra `error` envelope.
export const DELETE_WRONG_PASSWORD = {
  error: {current_password: ['Current password is invalid']},
};
