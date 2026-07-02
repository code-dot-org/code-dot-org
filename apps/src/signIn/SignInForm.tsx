import Link from '@code-dot-org/component-library/link';
import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton} from '@mui/material';
import React, {useEffect, useState} from 'react';

import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {USER_RETURN_TO_SESSION_KEY} from '@cdo/apps/signUpFlow/signUpFlowConstants';

import style from './signInStyles.module.scss';

// The field names below (user[login], user[password], user[hashed_email])
// match what the Rails controller expects.

// These ids double as the DOM hooks the UI (Cucumber) tests drive:
// #signin (wrapper), #user_login, #user_password, #signin-button.
const LOGIN_FIELD_ID = 'user_login';
const PASSWORD_FIELD_ID = 'user_password';

export interface SignInFormProps {
  // hashed_email is populated server-side (on failed-login re-render) and
  // threaded through untouched -- sign-in never hashes the email client-side.
  hashedEmail: string;
  // Pre-populated login value (from @email), if any.
  loginValue: string;
  // Form action from the server (session_path) so regional/localized sign-in
  // routes (e.g. /fa/users/sign_in) are preserved.
  signInPath: string;
  loginLabel: string;
  passwordLabel: string;
  signInLabel: string;
  signUpLabel: string;
  signUpPath: string;
  // Whether the "Sign up" button should render (devise_mapping.registerable?).
  showSignUp: boolean;
  // Devise password-reset path; absent when the mapping is not recoverable.
  forgotPasswordPath?: string;
  forgotPasswordLabel?: string;
  // Written to sessionStorage on mount when present, before any redirect.
  userReturnTo?: string | null;
}

const SignInForm: React.FunctionComponent<SignInFormProps> = ({
  hashedEmail,
  loginValue,
  signInPath,
  loginLabel,
  passwordLabel,
  signInLabel,
  signUpLabel,
  signUpPath,
  showSignUp,
  forgotPasswordPath,
  forgotPasswordLabel,
  userReturnTo,
}) => {
  const [login, setLogin] = useState(loginValue || '');
  const [password, setPassword] = useState('');

  // Match the legacy autofocus behavior: focus the login field when there is
  // no pre-filled email, otherwise focus the password field. Done via an
  // effect rather than the autoFocus prop (which jsx-a11y disallows).
  const emailPrefilled = (loginValue || '') !== '';

  useEffect(() => {
    if (userReturnTo) {
      sessionStorage.setItem(USER_RETURN_TO_SESSION_KEY, userReturnTo);
    }
  }, [userReturnTo]);

  useEffect(() => {
    const id = emailPrefilled ? PASSWORD_FIELD_ID : LOGIN_FIELD_ID;
    document.getElementById(id)?.focus();
  }, [emailPrefilled]);

  return (
    <div id="signin" className={style.signInColumn}>
      <div className={style.formArea}>
        <form
          id="new_user"
          action={signInPath}
          method="post"
          className={style.form}
        >
          <RailsAuthenticityToken />
          <input type="hidden" name="user[hashed_email]" value={hashedEmail} />

          <TextField
            id={LOGIN_FIELD_ID}
            className={style.field}
            name="user[login]"
            label={loginLabel}
            value={login}
            onChange={e => setLogin(e.target.value)}
            autoComplete="username"
          />
          <TextField
            id={PASSWORD_FIELD_ID}
            className={style.field}
            name="user[password]"
            label={passwordLabel}
            inputType="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {forgotPasswordPath && forgotPasswordLabel && (
            <Link
              className={style.forgotPassword}
              href={forgotPasswordPath}
              type="secondary"
              size="s"
            >
              {forgotPasswordLabel}
            </Link>
          )}

          <MuiButton
            id="signin-button"
            variant="contained"
            color="primary"
            type="submit"
          >
            {signInLabel}
          </MuiButton>
        </form>

        {showSignUp && (
          <MuiButton
            variant="outlined"
            color="secondary"
            href={signUpPath}
            onClick={() =>
              analyticsReporter.sendEvent(
                EVENTS.LOGIN_PAGE_CREATE_ACCOUNT_CLICKED,
                {}
              )
            }
          >
            {signUpLabel}
          </MuiButton>
        )}
      </div>
    </div>
  );
};

export default SignInForm;
