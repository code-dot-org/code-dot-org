import React from 'react';

import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
import {Heading2, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import locale from '@cdo/apps/signup/locale';

import style from './finish-account.module.scss';

const FinishStudentAccount: React.FunctionComponent = () => {
  return (
    <div className={style.finishAccountContainer}>
      <div className={style.headerTextContainer}>
        <Heading2>{locale.finish_creating_student_account()}</Heading2>
        <BodyTwoText>{locale.tailor_experience()}</BodyTwoText>
      </div>
      <div className={style.inputContainer}>
        <BodyTwoText
          className={style.labelText}
          visualAppearance={'heading-xs'}
        >
          {locale.account_name_input()}
        </BodyTwoText>
      </div>
      <div className={style.finishSignUpButtonContainer}>
        <Button
          className={style.finishSignUpButton}
          color={buttonColors.purple}
          type="primary"
          onClick={() => console.log('FINISH SIGN UP')}
          text={locale.go_to_my_account()}
          iconRight={{
            iconName: 'arrow-right',
            iconStyle: 'solid',
            title: 'arrow-right',
          }}
        />
      </div>
    </div>
  );
};

export default FinishStudentAccount;
