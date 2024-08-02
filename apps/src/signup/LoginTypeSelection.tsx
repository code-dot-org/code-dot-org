import React from 'react';

import {Button, LinkButton} from '@cdo/apps/componentLibrary/button';
import TextField from '@cdo/apps/componentLibrary/textField/TextField';
import {
  Heading1,
  Heading3,
  BodyTwoText,
  BodyThreeText,
} from '@cdo/apps/componentLibrary/typography';
import locale from '@cdo/apps/signup/locale';

const LoginTypeSelection: React.FunctionComponent = () => {
  return (
    <div id="signup">
      <Heading1>{locale.pick_your_login_method()}</Heading1>
      <BodyTwoText>{locale.choose_one_method()}</BodyTwoText>
      <div className={'containerWrapper'}>
        <div className="container">
          <Heading3>{locale.sign_up_with()}</Heading3>
          <BodyThreeText>{locale.streamline_your_sign_in()}</BodyThreeText>
          <LinkButton
            text={locale.sign_up_google()}
            href={'#'}
            className="greenButton"
          />
          <LinkButton
            text={locale.sign_up_microsoft()}
            href={'#'}
            className="yellowButton"
          />
          <LinkButton
            text={locale.sign_up_facebook()}
            href={'#'}
            className="blueButton"
          />
        </div>
        <div className="container">
          <Heading3>{locale.or_sign_up_with_email()}</Heading3>
          <TextField
            label={locale.email_address()}
            onChange={() => {}}
            name="emailInput"
          />
          <TextField
            label={locale.password()}
            onChange={() => {}}
            name="passwordInput"
          />
          <TextField
            label={locale.confirm_password()}
            onChange={() => {}}
            name="confirmPasswordInput"
          />
          <Button text={locale.create_my_account()} onClick={() => {}} />
        </div>
      </div>
    </div>
  );
};

export default LoginTypeSelection;
