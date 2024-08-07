import React from 'react';

import {Heading2, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import locale from '@cdo/apps/signup/locale';

import style from './finish-account.module.scss';

const FinishStudentAccount: React.FunctionComponent = () => {
  return (
    <div className={style.finishAccountContainer}>
      <div className={style.headerTextContainer}>
        <Heading2>{locale.finish_teacher_account_title()}</Heading2>
        <BodyTwoText>{locale.finish_teacher_account_subtitle()}</BodyTwoText>
      </div>
      <div className={style.inputContainer}>
        <BodyTwoText
          className={style.labelText}
          visualAppearance={'heading-xs'}
        >
          {locale.account_name_input()}
        </BodyTwoText>
      </div>
    </div>
  );
};

export default FinishStudentAccount;
