import React, {useState} from 'react';

import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';
import TextField from '@cdo/apps/componentLibrary/textField/TextField';
import {
  Heading2,
  BodyTwoText,
  BodyThreeText,
} from '@cdo/apps/componentLibrary/typography';
import SchoolDataInputs from '@cdo/apps/templates/SchoolDataInputs';

import locale from './locale';
import {
  DISPLAY_NAME_SESSION_KEY,
  EMAIL_OPT_IN_SESSION_KEY,
} from './signUpFlowConstants';

import style from './finishAccount.module.scss';

const FinishTeacherAccount: React.FunctionComponent<{
  usIp: boolean;
}> = ({usIp}) => {
  const [name, setName] = useState('');
  const [emailOptInChecked, setEmailOptInChecked] = useState(false);

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newName = e.target.value;
    setName(newName);
    sessionStorage.setItem(DISPLAY_NAME_SESSION_KEY, newName);
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
        <BodyThreeText>
          <strong>{locale.what_do_you_want_to_be_called()}</strong>
        </BodyThreeText>
        <TextField
          name="userName"
          onChange={onNameChange}
          value={name}
          className={style.nameInput}
          placeholder={locale.msCoder()}
        />
        <BodyThreeText>
          {locale.this_is_what_your_students_will_see()}
        </BodyThreeText>
        <SchoolDataInputs usIp={usIp} includeHeaders={false} />
        <div className={style.emailOptInContainer}>
          <BodyThreeText>
            <strong>{locale.keep_me_updated()}</strong>
          </BodyThreeText>
          <span className={style.emailOptInCheckboxContainer}>
            <div className={style.emailOptInCheckbox}>
              <Checkbox
                label=""
                checked={emailOptInChecked}
                onChange={onEmailOptInChange}
                name="userEmailOptIn"
              />
            </div>
            <BodyThreeText
              className={style.emailOptInLabel}
              visualAppearance={'body-two'}
            >
              {locale.get_informational_emails()}
            </BodyThreeText>
          </span>
          <BodyThreeText className={style.emailOptInFootnote}>
            <strong>{locale.note()}</strong>{' '}
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
