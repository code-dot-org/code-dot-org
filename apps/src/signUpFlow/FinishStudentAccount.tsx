import React, {useState} from 'react';

import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
import {
  Heading2,
  BodyTwoText,
  BodyThreeText,
} from '@cdo/apps/componentLibrary/typography';
import locale from '@cdo/apps/signup/locale';
import SchoolDataInputs from '@cdo/apps/templates/SchoolDataInputs';

import Checkbox from '../componentLibrary/checkbox/Checkbox';

import {
  USER_NAME_SESSION_KEY,
  EMAIL_OPT_IN_SESSION_KEY,
} from './signUpFlowConstants';

import style from './finish-teacher-account.module.scss';

const FinishStudentAccount: React.FunctionComponent = () => {
  const [name, setName] = useState('');
  const [emailOptInChecked, setEmailOptInChecked] = useState(false);

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newName = e.target.value;
    setName(newName);
    sessionStorage.setItem(USER_NAME_SESSION_KEY, newName);
  };

  const onEmailOptInChange = (): void => {
    const newOptInCheckedChoice = !emailOptInChecked;
    setEmailOptInChecked(newOptInCheckedChoice);
    sessionStorage.setItem(
      EMAIL_OPT_IN_SESSION_KEY,
      `${newOptInCheckedChoice}`
    );
  };

  return (
    <div className={style.finishTeacherAccountContainer}>
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
        <input
          type="text"
          name="[user][name]"
          onChange={onNameChange}
          value={name}
        />
        <BodyThreeText>
          {locale.finish_teacher_account_name_input_desc()}
        </BodyThreeText>
        <SchoolDataInputs usIp={usIp} includeHeaders={false} />
        <div className={style.emailOptInContainer}>
          <BodyTwoText
            className={style.labelText}
            visualAppearance={'heading-xs'}
          >
            {locale.stay_updated_email_opt_in()}
          </BodyTwoText>
          <span className={style.emailOptInCheckboxContainer}>
            <div className={style.emailOptInCheckbox}>
              <Checkbox
                label=""
                checked={emailOptInChecked}
                onChange={onEmailOptInChange}
                name="[user][emailOptIn]"
              />
            </div>
            <BodyTwoText
              className={style.emailOptInLabel}
              visualAppearance={'body-two'}
            >
              {locale.stay_updated_email_opt_in_desc()}
            </BodyTwoText>
          </span>
          <BodyThreeText className={style.emailOptInFootnote}>
            {locale.stay_updated_email_opt_in_footnote()}
          </BodyThreeText>
        </div>
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
