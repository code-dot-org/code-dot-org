import React, {useState} from 'react';

import {Button, LinkButton} from '@cdo/apps/componentLibrary/button';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import TextField from '@cdo/apps/componentLibrary/textField/TextField';
import {
  Heading1,
  Heading3,
  BodyTwoText,
  BodyThreeText,
} from '@cdo/apps/componentLibrary/typography';
import signupCanvas from '@cdo/apps/signUpFlow/images/signupCanvas.png';
import signupClever from '@cdo/apps/signUpFlow/images/signupClever.png';
import signupSchoology from '@cdo/apps/signUpFlow/images/signupSchoology.png';
import locale from '@cdo/apps/signUpFlow/locale';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

import style from '@cdo/apps/signUpFlow/loginTypeSelection.module.scss';

const LoginTypeSelection: React.FunctionComponent = () => {
  const [password, setPassword] = useState('');

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const passwordIcon = password.length >= 6 ? 'circle-check' : 'circle-x';
  const iconClass = password.length >= 6 ? style.teal : style.lightGray;

  return (
    <div className={style.newSignupFlow}>
      <Heading1 className={style.shortBottomMargin}>
        {locale.pick_your_login_method()}
      </Heading1>
      <BodyTwoText>{locale.choose_one_method()}</BodyTwoText>
      <div className={style.containerWrapper}>
        <div className={style.container}>
          <Heading3 className={style.shortBottomMargin}>
            {locale.sign_up_with()}
          </Heading3>
          <BodyThreeText>{locale.streamline_your_sign_in()}</BodyThreeText>
          <LinkButton
            text={locale.sign_up_google()}
            href={'#'}
            className={style.greenButton}
          />
          <LinkButton
            text={locale.sign_up_microsoft()}
            href={'#'}
            className={style.yellowButton}
          />
          <LinkButton
            text={locale.sign_up_facebook()}
            href={'#'}
            className={style.blueButton}
          />
          <div className={style.greyTextbox}>
            <img src={signupClever} alt="" />
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
          <Heading3>{locale.or_sign_up_with_email()}</Heading3>
          <TextField
            label={locale.email_address()}
            onChange={() => {}}
            name="emailInput"
          />
          <TextField
            label={locale.password()}
            value={password}
            onChange={handlePasswordChange}
            name="passwordInput"
          />
          <div className={style.passwordMessage}>
            <FontAwesomeV6Icon className={iconClass} iconName={passwordIcon} />
            <BodyThreeText>{locale.minimum_six_chars()}</BodyThreeText>
          </div>
          <TextField
            label={locale.confirm_password()}
            onChange={() => {}}
            name="confirmPasswordInput"
          />
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
