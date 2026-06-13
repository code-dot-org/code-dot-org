// Rails error bodies captured verbatim from the real controllers. Served by the
// mutation fixtures so dev and tests exercise the actual wire shapes, not
// invented ones.

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

// DELETE /users returns 400 with the extra `error` envelope.
export const DELETE_WRONG_PASSWORD = {
  error: {current_password: ['Current password is invalid']},
};
