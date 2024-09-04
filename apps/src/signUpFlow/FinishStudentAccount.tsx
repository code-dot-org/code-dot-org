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

import style from './signUpFlowStyles.module.scss';

const FinishStudentAccount: React.FunctionComponent<{
  ageOptions: {value: string; text: string}[];
  usStateOptions: {value: string; text: string}[];
}> = ({ageOptions, usStateOptions}) => {
  // Fields
  const [isParent, setIsParent] = useState(false);
  const [parentEmail, setParentEmail] = useState('');
  const [parentEmailOptInChecked, setParentEmailOptInChecked] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [state, setState] = useState('');
  const [gender, setGender] = useState('');

  // Field errors
  const [showNameError, setShowNameError] = useState(false);
  const [showParentEmailError, setShowParentEmailError] = useState(false);
  const [showAgeError, setShowAgeError] = useState(false);
  const [showStateError, setShowStateError] = useState(false);

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

    if (newParentEmail === '') {
      setShowParentEmailError(true);
    } else {
      setShowParentEmailError(false);
    }
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

    if (newName === '') {
      setShowNameError(true);
    } else {
      setShowNameError(false);
    }
  };

  const onAgeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newAge = e.target.value;
    setAge(newAge);
    sessionStorage.setItem(USER_AGE_SESSION_KEY, newAge);

    if (newAge === '') {
      setShowAgeError(true);
    } else {
      setShowAgeError(false);
    }
  };

  const onStateChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newState = e.target.value;
    setState(newState);
    sessionStorage.setItem(USER_STATE_SESSION_KEY, newState);

    if (newState === '') {
      setShowStateError(true);
    } else {
      setShowStateError(false);
    }
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
      <fieldset className={style.inputContainer}>
        <div className={style.parentInfoContainer}>
          <Checkbox
            name="isParentCheckbox"
            label={locale.i_am_a_parent_or_guardian()}
            checked={isParent}
            onChange={onIsParentChange}
          />
          {isParent && (
            <>
              <div>
                <TextField
                  name="parentEmail"
                  label={locale.parent_guardian_email()}
                  value={parentEmail}
                  placeholder={locale.parentEmailPlaceholder()}
                  onChange={onParentEmailChange}
                />
                {showParentEmailError && (
                  <BodyThreeText className={style.errorMessage}>
                    {locale.email_error_message()}
                  </BodyThreeText>
                )}
              </div>
              <div>
                <BodyThreeText className={style.parentKeepMeUpdated}>
                  <strong>{locale.keep_me_updated()}</strong>
                </BodyThreeText>
                <Checkbox
                  name="parentEmailOptIn"
                  label={locale.email_me_with_updates()}
                  checked={parentEmailOptInChecked}
                  onChange={onParentEmailOptInChange}
                />
              </div>
            </>
          )}
        </div>
        <div>
          <TextField
            name="displayName"
            label={locale.display_name_eg()}
            value={name}
            placeholder={locale.coder()}
            onChange={onNameChange}
          />
          {showNameError && (
            <BodyThreeText className={style.errorMessage}>
              {locale.display_name_error_message()}
            </BodyThreeText>
          )}
        </div>
        <div>
          <SimpleDropdown
            name="userAge"
            labelText={locale.what_is_your_age()}
            size="m"
            items={ageOptions}
            selectedValue={age}
            onChange={onAgeChange}
          />
          {showAgeError && (
            <BodyThreeText className={style.errorMessage}>
              {locale.age_error_message()}
            </BodyThreeText>
          )}
        </div>
        <div>
          <SimpleDropdown
            name="userState"
            labelText={locale.what_state_are_you_in()}
            size="m"
            items={usStateOptions}
            selectedValue={state}
            onChange={onStateChange}
          />
          {showStateError && (
            <BodyThreeText className={style.errorMessage}>
              {locale.state_error_message()}
            </BodyThreeText>
          )}
        </div>
        <TextField
          name="userGender"
          label={locale.what_is_your_gender()}
          value={gender}
          placeholder={locale.female()}
          onChange={onGenderChange}
        />
      </fieldset>
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
          disabled={
            name === '' ||
            age === '' ||
            state === '' ||
            (isParent && parentEmail === '')
          }
        />
      </div>
    </div>
  );
};

export default FinishStudentAccount;
