import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import TextField from '@code-dot-org/component-library/textField';
import {Typography, Button as MuiButton} from '@mui/material';
import cookies from 'js-cookie';
import React, {useState, useEffect} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import OldButton from '@cdo/apps/legacySharedComponents/Button';
import {studio} from '@cdo/apps/lib/util/urlHelpers';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import canvas from '@cdo/apps/signUpFlow/images/canvas.png';
import schoology from '@cdo/apps/signUpFlow/images/schoology.png';
import locale from '@cdo/apps/signUpFlow/locale';
import AccountBanner from '@cdo/apps/templates/account/AccountBanner';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import {isEmail} from '@cdo/apps/util/formatValidation';
import {UserTypes} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import {navigateToHref} from '../utils';

import {
  ACCOUNT_TYPE_SESSION_KEY,
  EMAIL_SESSION_KEY,
  OAUTH_LOGIN_TYPE_SESSION_KEY,
  SIGN_UP_USER_TYPE,
  USER_RETURN_TO_SESSION_KEY,
  setUserReturnToUrl,
} from './signUpFlowConstants';

import style from './signUpFlowStyles.module.scss';

const CHECK_ICON = 'circle-check';
const X_ICON = 'circle-xmark';
const EXCLAMATION_ICON = 'circle-exclamation';

const getUserType = () => {
  const sessionUserType = sessionStorage.getItem(ACCOUNT_TYPE_SESSION_KEY);
  return sessionUserType === UserTypes.TEACHER ||
    sessionUserType === UserTypes.STUDENT
    ? sessionUserType
    : '';
};

const LoginTypeSelection: React.FunctionComponent<{
  isSignedOut: boolean;
  passwordMinLength: number;
}> = ({isSignedOut, passwordMinLength}) => {
  const [userType, setUserType] = useState(getUserType());
  const [password, setPassword] = useState('');
  const [passwordIcon, setPasswordIcon] = useState(X_ICON);
  const [passwordIconClass, setPasswordIconClass] = useState(style.lightGray);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPasswordError, setShowConfirmPasswordError] =
    useState(false);
  const [showEmailError, setShowEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [createAccountButtonDisabled, setCreateAccountButtonDisabled] =
    useState(true);

  const isTeacher = userType === UserTypes.TEACHER;
  const finishAccountUrl = isTeacher
    ? studio('/users/sign_up/finish_teacher_account')
    : studio('/users/sign_up/finish_student_account');
  cookies.set(SIGN_UP_USER_TYPE, userType, {path: '/'});

  useEffect(() => {
    async function getToken() {
      setAuthToken(await getAuthenticityToken());
    }

    if (isSignedOut) {
      // Handle if the user type is not currently set in sessionStorage.
      if (sessionStorage.getItem(ACCOUNT_TYPE_SESSION_KEY) === null) {
        const urlUserType = queryParams('user_type');
        if (
          urlUserType &&
          (urlUserType === UserTypes.TEACHER ||
            urlUserType === UserTypes.STUDENT)
        ) {
          // If the user type is set as a URL parameter (e.g. being redirected from section signup and skipping
          // the first signup page), then set the user type (and URL to return the user to after signup if
          // provided) in sessionStorage.
          setUserReturnToUrl();
          const sourceParam = sessionStorage
            .getItem(USER_RETURN_TO_SESSION_KEY)
            ?.includes('/join')
            ? {source: 'section code sign up form'}
            : {};
          analyticsReporter.sendEvent(
            EVENTS.SIGN_UP_STARTED_EVENT,
            sourceParam
          );
          sessionStorage.setItem(
            ACCOUNT_TYPE_SESSION_KEY,
            urlUserType as string
          );
          setUserType(urlUserType);
        } else {
          // If the user hasn't selected a user type and it's not a URL parameter, redirect them back to the
          // first step of signup to select their user type.
          navigateToHref('/users/sign_up/account_type');
        }
      }

      getToken();
    }
  }, [isSignedOut]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !createAccountButtonDisabled) {
      submitLoginType();
    }
  };

  useEffect(() => {
    if (
      passwordIcon === CHECK_ICON &&
      !showConfirmPasswordError &&
      confirmPassword !== '' &&
      email !== ''
    ) {
      setCreateAccountButtonDisabled(false);
    } else {
      setCreateAccountButtonDisabled(true);
    }
  }, [passwordIcon, showConfirmPasswordError, confirmPassword, email]);

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    if (event.target.value.length >= passwordMinLength) {
      setPasswordIcon(CHECK_ICON);
      setPasswordIconClass(style.teal);
    } else {
      setPasswordIcon(X_ICON);
      setPasswordIconClass(style.lightGray);
    }
    event.target.value === confirmPassword || confirmPassword === ''
      ? setShowConfirmPasswordError(false)
      : setShowConfirmPasswordError(true);
  };

  const handleConfirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(event.target.value);
    event.target.value === password
      ? setShowConfirmPasswordError(false)
      : setShowConfirmPasswordError(true);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    sessionStorage.setItem(EMAIL_SESSION_KEY, event.target.value);
  };

  const submitLoginType = async () => {
    logUserLoginType('email');
    if (!isEmail(email)) {
      setEmailErrorMessage(i18n.censusInvalidEmail());
      setShowEmailError(true);
      return;
    }
    const submitLoginTypeParams = {
      user: {
        email: email,
        password: password,
        password_confirmation: password,
        user_type: userType,
      },
    };
    try {
      const response = await fetch('/users/begin_sign_up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': authToken,
        },
        body: JSON.stringify(submitLoginTypeParams),
      });
      if (!response.ok) {
        // Handle disallowed email domains. We return a 403 status code from the server
        // in this case.
        if (response.status === 403) {
          const res = await response.json();
          setEmailErrorMessage(res.error);
          setShowEmailError(true);
        } else {
          // We are currently only intentionally surfacing errors for duplicate emails
          setEmailErrorMessage(i18n.duplicate_email_error_message());
          setShowEmailError(true);
        }
        return;
      }
      navigateToHref(finishAccountUrl);
    } catch (error) {
      // Handle network or other errors
      console.error(error);
    }
  };

  const sendLMSAnalyticsEvent = () => {
    analyticsReporter.sendEvent(EVENTS.LMS_INFORMATION_BUTTON_CLICKED, {});
  };

  function logUserLoginType(loginType: string) {
    analyticsReporter.sendEvent(EVENTS.SIGN_UP_LOGIN_TYPE_PICKED_EVENT, {
      'user login type': loginType,
    });
  }

  function selectOauthLoginType(loginType: string) {
    logUserLoginType(loginType);
    sessionStorage.setItem(OAUTH_LOGIN_TYPE_SESSION_KEY, loginType);
  }

  return (
    <div className={style.newSignupFlow}>
      <AccountBanner
        heading={locale.pick_your_login_method()}
        desc={locale.choose_one_method()}
        showLogo={false}
        className={style.typeHeaderBanner}
      />
      <div className={style.containerWrapper}>
        <div className={style.container}>
          <div className={style.headers}>
            <Typography
              className={style.signUpWithTitle}
              variant="h3"
              gutterBottom
            >
              {locale.sign_up_with()}
            </Typography>
            <Typography
              className={style.signUpWithDesc}
              variant="body3"
              gutterBottom
            >
              {locale.streamline_your_sign_in()}
            </Typography>
          </div>
          <form action="/users/auth/google_oauth2" method="POST">
            <MuiButton
              variant="contained"
              color="primary"
              size="medium"
              className={style.googleButton}
              onClick={() => selectOauthLoginType('google')}
              type="submit"
              startIcon={
                <FontAwesomeV6Icon
                  iconFamily="brands"
                  iconName="google"
                  iconStyle="solid"
                />
              }
            >
              {locale.sign_up_google()}
            </MuiButton>
            <input type="hidden" name="authenticity_token" value={authToken} />
          </form>
          <form action="/users/auth/microsoft_v2_auth" method="POST">
            <MuiButton
              variant="contained"
              color="primary"
              size="medium"
              className={style.microsoftButton}
              onClick={() => selectOauthLoginType('microsoft')}
              type="submit"
              startIcon={
                <FontAwesomeV6Icon
                  iconFamily="brands"
                  iconName="microsoft"
                  iconStyle="regular"
                />
              }
            >
              {locale.sign_up_microsoft()}
            </MuiButton>
            <input type="hidden" name="authenticity_token" value={authToken} />
          </form>
          <form action="/users/auth/facebook" method="POST">
            <MuiButton
              variant="contained"
              color="primary"
              size="medium"
              className={style.facebookButton}
              onClick={() => selectOauthLoginType('facebook')}
              type="submit"
              startIcon={
                <FontAwesomeV6Icon
                  iconName="brands fa-facebook-f"
                  iconStyle="solid"
                />
              }
            >
              {locale.sign_up_facebook()}
            </MuiButton>
            <input type="hidden" name="authenticity_token" value={authToken} />
          </form>
          <form action="/users/auth/clever" method="POST">
            <MuiButton
              variant="contained"
              color="primary"
              size="medium"
              className={style.cleverButton}
              onClick={() => selectOauthLoginType('clever')}
              type="submit"
              startIcon={
                <FontAwesomeV6Icon
                  iconFamily="kit"
                  iconName="clever"
                  iconStyle="solid"
                />
              }
            >
              {locale.sign_up_clever()}
            </MuiButton>
            <input type="hidden" name="authenticity_token" value={authToken} />
          </form>
          {/* TODO: once the Classlink icon has been added to our Font Awesome account,
              we can uncomment this form */}
          {/* <form action="/users/auth/classlink" method="POST">
            <Button
              text={locale.sign_up_classlink()}
              onClick={() => selectOauthLoginType('classlink')}
              iconLeft={{iconName: 'kit fa-classlink', iconStyle: 'solid'}}
              className={style.classlinkButton}
              buttonTagTypeAttribute="submit"
            >
              <img src={classlink} alt="" />
            </Button>
            <input type="hidden" name="authenticity_token" value={authToken} />
          </form> */}
          <div className={style.greyTextbox}>
            {!isTeacher && (
              <div className={style.iconContainer}>
                <img src={canvas} alt="Canvas logo" />
                <img src={schoology} alt="Schoology logo" />
              </div>
            )}
            <Typography
              className={style.subheader}
              variant="body3"
              gutterBottom
            >
              {isTeacher
                ? locale.using_lms_platforms()
                : locale.does_your_school_use_an_lms()}
            </Typography>
            <Typography variant="body3" gutterBottom>
              {isTeacher
                ? locale.access_detailed_instructions()
                : locale.ask_your_teacher_lms()}
            </Typography>
            {isTeacher && (
              <div className={style.buttonContainer}>
                <OldButton
                  href="https://support.code.org/hc/en-us/articles/24825250283021-Single-Sign-On-with-Canvas"
                  onClick={sendLMSAnalyticsEvent}
                  color={OldButton.ButtonColor.white}
                  text={'Canvas'}
                  icon={'arrow-up-right-from-square'}
                  __useDeprecatedTag
                >
                  <img src={canvas} alt="" />
                </OldButton>
                <OldButton
                  href="https://support.code.org/hc/en-us/articles/26677769411085-Single-Sign-On-with-Schoology"
                  onClick={sendLMSAnalyticsEvent}
                  color={OldButton.ButtonColor.white}
                  text={'Schoology'}
                  icon={'arrow-up-right-from-square'}
                  __useDeprecatedTag
                >
                  <img src={schoology} alt="" />
                </OldButton>
              </div>
            )}
          </div>
        </div>
        <div className={style.dividerContainer}>
          <div className={style.verticalDividerTop} />
          <div className={style.dividerText}>{i18n.or()}</div>
          <div className={style.verticalDividerBottom} />
        </div>
        <div className={style.container}>
          <Typography className={style.headers} variant="h3" gutterBottom>
            {locale.or_sign_up_with_email()}
          </Typography>
          <div className={style.inputContainer}>
            <div>
              <TextField
                label={locale.email_address()}
                value={email}
                onChange={handleEmailChange}
                name="emailInput"
                id="uitest-email"
                onKeyDown={handleKeyDown}
              />
              {showEmailError && (
                <div className={style.validationMessage}>
                  <FontAwesomeV6Icon
                    className={style.red}
                    iconName={EXCLAMATION_ICON}
                  />
                  <Typography
                    className={style.red}
                    variant="body3"
                    gutterBottom
                  >
                    {emailErrorMessage}
                  </Typography>
                </div>
              )}
            </div>
            <div>
              <TextField
                label={locale.password()}
                value={password}
                onChange={handlePasswordChange}
                name="passwordInput"
                id="uitest-password"
                inputType="password"
                onKeyDown={handleKeyDown}
              />
              <div className={style.validationMessage}>
                <FontAwesomeV6Icon
                  className={passwordIconClass}
                  iconName={passwordIcon}
                />
                <Typography variant="body3" gutterBottom>
                  {locale.minimum_num_chars({minChars: passwordMinLength})}
                </Typography>
              </div>
            </div>
            <div>
              <TextField
                label={locale.confirm_password()}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                name="confirmPasswordInput"
                inputType="password"
                id="uitest-confirm-password"
                onKeyDown={handleKeyDown}
              />
              {showConfirmPasswordError && (
                <div className={style.validationMessage}>
                  <FontAwesomeV6Icon
                    className={style.red}
                    iconName={EXCLAMATION_ICON}
                  />
                  <Typography
                    className={style.red}
                    variant="body3"
                    gutterBottom
                  >
                    {i18n.passwordsMustMatch()}
                  </Typography>
                </div>
              )}
            </div>
          </div>
          <MuiButton
            variant="contained"
            color="primary"
            size="medium"
            className={style.shortButton}
            id="createAccountButton"
            onClick={submitLoginType}
            type="submit"
            disabled={createAccountButtonDisabled}
          >
            {locale.create_my_account()}
          </MuiButton>
        </div>
      </div>
      <SafeMarkdown
        className={style.tosAndPrivacy}
        markdown={locale.by_signing_up({
          tosLink: 'https://code.org/tos',
          privacyPolicyLink: 'https://code.org/privacy',
        })}
        openExternalLinksInNewTab={true}
      />
    </div>
  );
};

export default LoginTypeSelection;
