import React, {useState, useEffect} from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import TextField from '@cdo/apps/componentLibrary/textField/TextField';
import {Heading3, BodyThreeText} from '@cdo/apps/componentLibrary/typography';
import cleverLogo from '@cdo/apps/signUpFlow/images/cleverLogo.png';
import signupCanvas from '@cdo/apps/signUpFlow/images/signupCanvas.png';
import signupSchoology from '@cdo/apps/signUpFlow/images/signupSchoology.png';
import locale from '@cdo/apps/signUpFlow/locale';
import AccountBanner from '@cdo/apps/templates/account/AccountBanner';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import i18n from '@cdo/locale';

import style from './signUpFlowStyles.module.scss';

const LoginTypeSelection: React.FunctionComponent = () => {
  const [password, setPassword] = useState('');
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    async function getToken() {
      setAuthToken(await getAuthenticityToken());
    }

    getToken();
  }, []);

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const passwordIcon = password.length >= 6 ? 'circle-check' : 'circle-x';
  const iconClass = password.length >= 6 ? style.teal : style.lightGray;

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
            <TextField
              label={locale.email_address()}
              onChange={() => {}}
              name="emailInput"
            />
            <div>
              <TextField
                label={locale.password()}
                value={password}
                onChange={handlePasswordChange}
                name="passwordInput"
              />
              <div className={style.passwordMessage}>
                <FontAwesomeV6Icon
                  className={iconClass}
                  iconName={passwordIcon}
                />
                <BodyThreeText>{locale.minimum_six_chars()}</BodyThreeText>
              </div>
            </div>
            <TextField
              label={locale.confirm_password()}
              onChange={() => {}}
              name="confirmPasswordInput"
            />
          </div>
          <Button
            className={style.shortButton}
            text={locale.create_my_account()}
            onClick={() => {}}
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
