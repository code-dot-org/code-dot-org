import React, {useState, useEffect} from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import TextField from '@cdo/apps/componentLibrary/textField/TextField';
import {Heading3, BodyThreeText} from '@cdo/apps/componentLibrary/typography';
import {studio} from '@cdo/apps/lib/util/urlHelpers';
import cleverLogo from '@cdo/apps/signUpFlow/images/cleverLogo.png';
import signupCanvas from '@cdo/apps/signUpFlow/images/signupCanvas.png';
import signupSchoology from '@cdo/apps/signUpFlow/images/signupSchoology.png';
import locale from '@cdo/apps/signUpFlow/locale';
import AccountBanner from '@cdo/apps/templates/account/AccountBanner';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import {isEmail} from '@cdo/apps/util/formatValidation';
import i18n from '@cdo/locale';

import {navigateToHref} from '../utils';

import {ACCOUNT_TYPE_SESSION_KEY} from './signUpFlowConstants';

import style from './signUpFlowStyles.module.scss';

const CHECK_ICON = 'circle-check';
const X_ICON = 'circle-x';

const LoginTypeSelection: React.FunctionComponent = () => {
  const [password, setPassword] = useState('');
  const [passwordIcon, setPasswordIcon] = useState(X_ICON);
  const [passwordIconClass, setPasswordIconClass] = useState(style.lightGray);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordIcon, setConfirmPasswordIcon] = useState(X_ICON);
  const [confirmPasswordIconClass, setConfirmPasswordIconClass] = useState(
    style.lightGray
  );
  const [email, setEmail] = useState('');
  const [emailIcon, setEmailIcon] = useState(X_ICON);
  const [emailIconClass, setEmailIconClass] = useState(style.lightGray);
  const [authToken, setAuthToken] = useState('');
  const [createAccountButtonDisabled, setCreateAccountButtonDisabled] =
    useState(true);

  useEffect(() => {
    async function getToken() {
      setAuthToken(await getAuthenticityToken());
    }

    getToken();
  }, []);

  useEffect(() => {
    if (
      passwordIcon === CHECK_ICON &&
      confirmPasswordIcon === CHECK_ICON &&
      emailIcon === CHECK_ICON
    ) {
      setCreateAccountButtonDisabled(false);
    } else {
      setCreateAccountButtonDisabled(true);
    }
  }, [passwordIcon, confirmPasswordIcon, emailIcon]);

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
    if (event.target.value === confirmPassword) {
      setConfirmPasswordIcon(CHECK_ICON);
      setConfirmPasswordIconClass(style.teal);
    } else {
      setConfirmPasswordIcon(X_ICON);
      setConfirmPasswordIconClass(style.lightGray);
    }
  };

  const handleConfirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(event.target.value);
    if (event.target.value === password) {
      setConfirmPasswordIcon(CHECK_ICON);
      setConfirmPasswordIconClass(style.teal);
    } else {
      setConfirmPasswordIcon(X_ICON);
      setConfirmPasswordIconClass(style.lightGray);
    }
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    if (isEmail(event.target.value)) {
      setEmailIcon(CHECK_ICON);
      setEmailIconClass(style.teal);
    } else {
      setEmailIcon(X_ICON);
      setEmailIconClass(style.lightGray);
    }
  };

  const finishAccountUrl =
    sessionStorage.getItem(ACCOUNT_TYPE_SESSION_KEY) === 'teacher'
      ? studio('/users/new_sign_up/finish_teacher_account')
      : studio('/users/new_sign_up/finish_student_account');

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
            <button className={style.googleButton} type="submit">
              <FontAwesomeV6Icon
                iconName="brands fa-google"
                iconStyle="solid"
              />
              {locale.sign_up_google()}
            </button>
            <input type="hidden" name="authenticity_token" value={authToken} />
          </form>
          <form action="/users/auth/microsoft_v2_auth" method="POST">
            <button className={style.microsoftButton} type="submit">
              <FontAwesomeV6Icon
                iconName="brands fa-microsoft"
                iconStyle="light"
              />
              {locale.sign_up_microsoft()}
            </button>
            <input type="hidden" name="authenticity_token" value={authToken} />
          </form>
          <form action="/users/auth/facebook" method="POST">
            <button className={style.facebookButton} type="submit">
              <FontAwesomeV6Icon
                iconName="brands fa-facebook-f"
                iconStyle="solid"
              />
              {locale.sign_up_facebook()}
            </button>
            <input type="hidden" name="authenticity_token" value={authToken} />
          </form>
          <form action="/users/auth/clever" method="POST">
            <button className={style.cleverButton} type="submit">
              <img src={cleverLogo} alt="" />
              {locale.sign_up_clever()}
            </button>
            <input type="hidden" name="authenticity_token" value={authToken} />
          </form>
          <div className={style.greyTextbox}>
            <img src={signupCanvas} alt="" />
            <img src={signupSchoology} alt="" />
            <BodyThreeText className={style.subheader}>
              {locale.does_your_school_use_an_lms()}
            </BodyThreeText>
            <SafeMarkdown
              markdown={locale.click_here_to_learn({
                clickHereLink: 'code.org/lms',
              })}
            />
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
              <div className={style.validationMessage}>
                <FontAwesomeV6Icon
                  className={emailIconClass}
                  iconName={emailIcon}
                />
                <BodyThreeText>{i18n.censusInvalidEmail()}</BodyThreeText>
              </div>
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
              <div className={style.validationMessage}>
                <FontAwesomeV6Icon
                  className={confirmPasswordIconClass}
                  iconName={confirmPasswordIcon}
                />
                <BodyThreeText>{i18n.passwordsMustMatch()}</BodyThreeText>
              </div>
            </div>
          </div>
          <Button
            id="createAccountButton"
            className={style.shortButton}
            text={locale.create_my_account()}
            disabled={createAccountButtonDisabled}
            onClick={() => navigateToHref(finishAccountUrl)}
          />
        </div>
      </div>
      <SafeMarkdown
        markdown={locale.by_signing_up({
          tosLink: 'code.org/tos',
          privacyPolicyLink: 'code.org/privacy',
        })}
      />
    </div>
  );
};

export default LoginTypeSelection;
