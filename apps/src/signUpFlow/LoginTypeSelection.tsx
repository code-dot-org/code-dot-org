import React, {useState, useEffect} from 'react';

import {Button as NewButton} from '@cdo/apps/componentLibrary/button';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import TextField from '@cdo/apps/componentLibrary/textField/TextField';
import {Heading3, BodyThreeText} from '@cdo/apps/componentLibrary/typography';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {studio} from '@cdo/apps/lib/util/urlHelpers';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import canvas from '@cdo/apps/signUpFlow/images/canvas.png';
import cleverLogo from '@cdo/apps/signUpFlow/images/cleverLogo.png';
import schoology from '@cdo/apps/signUpFlow/images/schoology.png';
import locale from '@cdo/apps/signUpFlow/locale';
import AccountBanner from '@cdo/apps/templates/account/AccountBanner';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import {isEmail} from '@cdo/apps/util/formatValidation';
import i18n from '@cdo/locale';

import {navigateToHref} from '../utils';

import {
  ACCOUNT_TYPE_SESSION_KEY,
  EMAIL_SESSION_KEY,
} from './signUpFlowConstants';

import style from './signUpFlowStyles.module.scss';

const CHECK_ICON = 'circle-check';
const X_ICON = 'circle-xmark';
const EXCLAMATION_ICON = 'circle-exclamation';

const LoginTypeSelection: React.FunctionComponent = () => {
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
  const isTeacher =
    sessionStorage.getItem(ACCOUNT_TYPE_SESSION_KEY) === 'teacher';

  const finishAccountUrl = isTeacher
    ? studio('/users/new_sign_up/finish_teacher_account')
    : studio('/users/new_sign_up/finish_student_account');

  useEffect(() => {
    async function getToken() {
      setAuthToken(await getAuthenticityToken());
    }

    getToken();
  }, []);

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        const button = document.getElementById(
          'createAccountButton'
        ) as HTMLButtonElement;
        if (button && !button.disabled) {
          button.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    if (event.target.value.length >= 6) {
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
      new_sign_up: true,
      user: {
        email: email,
        password: password,
        password_confirmation: password,
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
      // We are currently only intentionally surfacing errors for duplicate emails
      if (!response.ok) {
        setEmailErrorMessage(i18n.duplicate_email_error_message());
        setShowEmailError(true);
        return;
      }
      navigateToHref(finishAccountUrl);
    } catch (error) {
      // Handle network or other errors
      console.error(error);
    }
  };

  const sendLMSAnalyticsEvent = () => {
    analyticsReporter.sendEvent(
      EVENTS.LMS_INFORMATION_BUTTON_CLICKED,
      {},
      PLATFORMS.STATSIG
    );
  };

  function logUserLoginType(loginType: string) {
    analyticsReporter.sendEvent(
      EVENTS.SIGN_UP_LOGIN_TYPE_PICKED_EVENT,
      {
        'user login type': loginType,
      },
      PLATFORMS.STATSIG
    );
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
            <Heading3 className={style.signUpWithTitle}>
              {locale.sign_up_with()}
            </Heading3>
            <BodyThreeText className={style.signUpWithDesc}>
              {locale.streamline_your_sign_in()}
            </BodyThreeText>
          </div>
          <form action="/users/auth/google_oauth2" method="POST">
            <input type="hidden" name="finish_url" value={finishAccountUrl} />
            <button
              className={style.googleButton}
              onClick={() => logUserLoginType('google')}
              type="submit"
            >
              <FontAwesomeV6Icon
                iconName="brands fa-google"
                iconStyle="solid"
              />
              {locale.sign_up_google()}
            </button>
            <input type="hidden" name="authenticity_token" value={authToken} />
          </form>
          <form action="/users/auth/microsoft_v2_auth" method="POST">
            <input type="hidden" name="finish_url" value={finishAccountUrl} />
            <button
              className={style.microsoftButton}
              onClick={() => logUserLoginType('microsoft')}
              type="submit"
            >
              <FontAwesomeV6Icon
                iconName="brands fa-microsoft"
                iconStyle="light"
              />
              {locale.sign_up_microsoft()}
            </button>
            <input type="hidden" name="authenticity_token" value={authToken} />
          </form>
          <form action="/users/auth/facebook" method="POST">
            <input type="hidden" name="finish_url" value={finishAccountUrl} />
            <button
              className={style.facebookButton}
              onClick={() => logUserLoginType('facebook')}
              type="submit"
            >
              <FontAwesomeV6Icon
                iconName="brands fa-facebook-f"
                iconStyle="solid"
              />
              {locale.sign_up_facebook()}
            </button>
            <input type="hidden" name="authenticity_token" value={authToken} />
          </form>
          <form action="/users/auth/clever" method="POST">
            <input type="hidden" name="finish_url" value={finishAccountUrl} />
            <button
              className={style.cleverButton}
              onClick={() => logUserLoginType('clever')}
              type="submit"
            >
              <img src={cleverLogo} alt="" />
              {locale.sign_up_clever()}
            </button>
            <input type="hidden" name="authenticity_token" value={authToken} />
          </form>
          <div className={style.greyTextbox}>
            {!isTeacher && (
              <div className={style.iconContainer}>
                <img src={canvas} alt="Canvas logo" />
                <img src={schoology} alt="Schoology logo" />
              </div>
            )}
            <BodyThreeText className={style.subheader}>
              {isTeacher
                ? locale.using_lms_platforms()
                : locale.does_your_school_use_an_lms()}
            </BodyThreeText>
            <BodyThreeText>
              {isTeacher
                ? locale.access_detailed_instructions()
                : locale.ask_your_teacher_lms()}
            </BodyThreeText>
            {isTeacher && (
              <div className={style.buttonContainer}>
                <Button
                  href="https://support.code.org/hc/en-us/articles/24825250283021-Single-Sign-On-with-Canvas"
                  onClick={sendLMSAnalyticsEvent}
                  color={Button.ButtonColor.white}
                  text={'Canvas'}
                  icon={'arrow-up-right-from-square'}
                  __useDeprecatedTag
                >
                  <img src={canvas} alt="" />
                </Button>
                <Button
                  href="https://support.code.org/hc/en-us/articles/26677769411085-Single-Sign-On-with-Schoology"
                  onClick={sendLMSAnalyticsEvent}
                  color={Button.ButtonColor.white}
                  text={'Schoology'}
                  icon={'arrow-up-right-from-square'}
                  __useDeprecatedTag
                >
                  <img src={schoology} alt="" />
                </Button>
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
          <Heading3 className={style.headers}>
            {locale.or_sign_up_with_email()}
          </Heading3>
          <div className={style.inputContainer}>
            <div>
              <TextField
                label={locale.email_address()}
                value={email}
                onChange={handleEmailChange}
                name="emailInput"
              />
              {showEmailError && (
                <div className={style.validationMessage}>
                  <FontAwesomeV6Icon
                    className={style.red}
                    iconName={EXCLAMATION_ICON}
                  />
                  <BodyThreeText className={style.red}>
                    {emailErrorMessage}
                  </BodyThreeText>
                </div>
              )}
            </div>
            <div>
              <TextField
                label={locale.password()}
                value={password}
                onChange={handlePasswordChange}
                name="passwordInput"
                inputType="password"
              />
              <div className={style.validationMessage}>
                <FontAwesomeV6Icon
                  className={passwordIconClass}
                  iconName={passwordIcon}
                />
                <BodyThreeText>{locale.minimum_six_chars()}</BodyThreeText>
              </div>
            </div>
            <div>
              <TextField
                label={locale.confirm_password()}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                name="confirmPasswordInput"
                inputType="password"
              />
              {showConfirmPasswordError && (
                <div className={style.validationMessage}>
                  <FontAwesomeV6Icon
                    className={style.red}
                    iconName={EXCLAMATION_ICON}
                  />
                  <BodyThreeText className={style.red}>
                    {i18n.passwordsMustMatch()}
                  </BodyThreeText>
                </div>
              )}
            </div>
          </div>
          <NewButton
            id="createAccountButton"
            className={style.shortButton}
            text={locale.create_my_account()}
            onClick={submitLoginType}
            disabled={createAccountButtonDisabled}
          />
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
