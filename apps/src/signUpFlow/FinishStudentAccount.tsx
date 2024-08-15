import React, {useState} from 'react';

import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';
import SimpleDropdown from '@cdo/apps/componentLibrary/dropdown/simpleDropdown';
import TextField from '@cdo/apps/componentLibrary/textField/TextField';
import {
  Heading2,
  BodyTwoText,
  BodyThreeText,
} from '@cdo/apps/componentLibrary/typography';

import locale from './locale';
import {
  IS_PARENT_SESSION_KEY,
  PARENT_EMAIL_SESSION_KEY,
  PARENT_EMAIL_OPT_IN_SESSION_KEY,
  DISPLAY_NAME_SESSION_KEY,
  USER_AGE_SESSION_KEY,
  USER_STATE_SESSION_KEY,
  USER_GENDER_SESSION_KEY,
} from './signUpFlowConstants';

import style from './finishAccount.module.scss';

const FinishStudentAccount: React.FunctionComponent<{
  ageOptions: {value: string; text: string}[];
  usStateOptions: {value: string; text: string}[];
}> = ({ageOptions, usStateOptions}) => {
  const [isParent, setIsParent] = useState(false);
  const [parentEmail, setParentEmail] = useState('');
  const [parentEmailOptInChecked, setParentEmailOptInChecked] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [state, setState] = useState('');
  const [gender, setGender] = useState('');

  const onIsParentChange = (): void => {
    const newIsParentCheckedChoice = !isParent;
    setIsParent(newIsParentCheckedChoice);
    sessionStorage.setItem(
      IS_PARENT_SESSION_KEY,
      `${newIsParentCheckedChoice}`
    );
  };

  const onParentEmailChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const newParentEmail = e.target.value;
    setParentEmail(newParentEmail);
    sessionStorage.setItem(PARENT_EMAIL_SESSION_KEY, newParentEmail);
  };

  const onParentEmailOptInChange = (): void => {
    const newParentEmailOptInCheckedChoice = !parentEmailOptInChecked;
    setParentEmailOptInChecked(newParentEmailOptInCheckedChoice);
    sessionStorage.setItem(
      PARENT_EMAIL_OPT_IN_SESSION_KEY,
      `${newParentEmailOptInCheckedChoice}`
    );
  };

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newName = e.target.value;
    setName(newName);
    sessionStorage.setItem(DISPLAY_NAME_SESSION_KEY, newName);
  };

  const onAgeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newAge = e.target.value;
    setAge(newAge);
    sessionStorage.setItem(USER_AGE_SESSION_KEY, newAge);
  };

  const onStateChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newState = e.target.value;
    setState(newState);
    sessionStorage.setItem(USER_STATE_SESSION_KEY, newState);
  };

  const onGenderChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newGender = e.target.value;
    setGender(newGender);
    sessionStorage.setItem(USER_GENDER_SESSION_KEY, newGender);
  };

  return (
    <div className={style.finishAccountContainer}>
      <div className={style.headerTextContainer}>
        <Heading2>{locale.finish_creating_student_account()}</Heading2>
        <BodyTwoText>{locale.tailor_experience()}</BodyTwoText>
      </div>
      <div className={style.inputContainer}>
        <div className={style.parentInfoContainer}>
          <span className={style.parentCheckboxContainer}>
            <div className={style.parentCheckbox}>
              <Checkbox
                label=""
                checked={isParent}
                onChange={onIsParentChange}
                name="isParent"
              />
            </div>
            <BodyTwoText>{locale.i_am_a_parent_or_guardian()}</BodyTwoText>
          </span>
          {isParent && (
            <>
              <BodyThreeText className={style.studentQuestionLabel}>
                <strong>{locale.parent_guardian_email()}</strong>
              </BodyThreeText>
              <TextField
                name="parentEmail"
                onChange={onParentEmailChange}
                value={parentEmail}
                className={style.parentEmailInput}
                placeholder={locale.parentEmailPlaceholder()}
              />
              <BodyThreeText className={style.studentQuestionLabel}>
                <strong>{locale.keep_me_updated()}</strong>
              </BodyThreeText>
              <span className={style.parentCheckboxContainer}>
                <div className={style.parentCheckbox}>
                  <Checkbox
                    label=""
                    checked={parentEmailOptInChecked}
                    onChange={onParentEmailOptInChange}
                    name="parentEmailOptIn"
                  />
                </div>
                <BodyTwoText>{locale.email_me_with_updates()}</BodyTwoText>
              </span>
            </>
          )}
        </div>
        <BodyThreeText className={style.studentQuestionLabel}>
          <strong>{locale.display_name_eg()}</strong>
        </BodyThreeText>
        <TextField
          name="userName"
          onChange={onNameChange}
          value={name}
          placeholder={locale.coder()}
        />
        <BodyThreeText className={style.studentQuestionLabel}>
          <strong>{locale.what_is_your_age()}</strong>
        </BodyThreeText>
        <SimpleDropdown
          id="uitest-age-dropdown"
          name="userAge"
          labelText=""
          isLabelVisible={false}
          items={ageOptions}
          selectedValue={age}
          onChange={onAgeChange}
          size="m"
        />
        <BodyThreeText className={style.studentQuestionLabel}>
          <strong>{locale.what_state_are_you_in()}</strong>
        </BodyThreeText>
        <SimpleDropdown
          id="uitest-state-dropdown"
          name="userState"
          labelText=""
          isLabelVisible={false}
          items={usStateOptions}
          selectedValue={state}
          onChange={onStateChange}
          size="m"
        />
        <BodyThreeText className={style.studentQuestionLabel}>
          <strong>{locale.what_is_your_gender()}</strong>
        </BodyThreeText>
        <TextField
          name="userGender"
          onChange={onGenderChange}
          value={gender}
          placeholder={locale.female()}
        />
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
