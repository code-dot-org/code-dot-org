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

import style from './finish-account.module.scss';

const FinishTeacherAccount: React.FunctionComponent<{
  usIp: boolean;
}> = ({usIp}) => {
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
    <div className={style.finishAccountContainer}>
      <div className={style.headerTextContainer}>
        <Heading2>{locale.finish_creating_teacher_account()}</Heading2>
        <BodyTwoText>{locale.tailor_experience()}</BodyTwoText>
      </div>
      <div className={style.inputContainer}>
        <BodyTwoText visualAppearance={'heading-xs'}>
          {locale.what_do_you_want_to_be_called()}
        </BodyTwoText>
        <input
          type="text"
          name="[user][name]"
          onChange={onNameChange}
          value={name}
        />
        <BodyThreeText>
          {locale.this_is_what_your_students_will_see()}
        </BodyThreeText>
        <SchoolDataInputs usIp={usIp} includeHeaders={false} />
        <div className={style.emailOptInContainer}>
          <BodyTwoText visualAppearance={'heading-xs'}>
            {locale.keep_me_updated()}
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
              {locale.get_informational_emails()}
            </BodyTwoText>
          </span>
          <BodyThreeText className={style.emailOptInFootnote}>
            {locale.after_creating_your_account()}
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

export default FinishTeacherAccount;
