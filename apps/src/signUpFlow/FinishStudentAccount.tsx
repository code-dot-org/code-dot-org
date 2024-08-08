import React, {useState} from 'react';

import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
import SimpleDropdown from '@cdo/apps/componentLibrary/dropdown/simpleDropdown';
import TextField from '@cdo/apps/componentLibrary/textField/TextField';
import {Heading2, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import locale from '@cdo/apps/signup/locale';

import {
  USER_NAME_SESSION_KEY,
  USER_AGE_SESSION_KEY,
} from './signUpFlowConstants';

import style from './finish-account.module.scss';

const FinishStudentAccount: React.FunctionComponent = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newName = e.target.value;
    setName(newName);
    sessionStorage.setItem(USER_NAME_SESSION_KEY, newName);
  };

  const onAgeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newAge = e.target.value;
    setAge(newAge);
    sessionStorage.setItem(USER_AGE_SESSION_KEY, newAge);
  };

  return (
    <div className={style.finishAccountContainer}>
      <div className={style.headerTextContainer}>
        <Heading2>{locale.finish_creating_student_account()}</Heading2>
        <BodyTwoText>{locale.tailor_experience()}</BodyTwoText>
      </div>
      <div className={style.inputContainer}>
        <BodyTwoText visualAppearance={'heading-xs'}>
          {locale.display_name_eg()}
        </BodyTwoText>
        <TextField
          name="userName"
          onChange={onNameChange}
          value={name}
          placeholder={locale.coder()}
        />
        <BodyTwoText
          className={style.ageDropdownLabel}
          visualAppearance={'heading-xs'}
        >
          {locale.what_is_your_age()}
        </BodyTwoText>
        <SimpleDropdown
          id="uitest-age-dropdown"
          name="userAge"
          labelText=""
          isLabelVisible={false}
          items={[{value: '0', text: '0'}, {value: '1', text: '1'}, {value: '2', text: '2'}]}
          selectedValue={age}
          onChange={onAgeChange}
          size="m"
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
