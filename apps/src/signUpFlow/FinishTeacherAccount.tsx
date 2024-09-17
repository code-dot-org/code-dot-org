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
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

import {navigateToHref} from '../utils';

import locale from './locale';
import {
  ACCOUNT_TYPE_SESSION_KEY,
  EMAIL_SESSION_KEY,
  SCHOOL_ID_SESSION_KEY,
  SCHOOL_ZIP_SESSION_KEY,
  SCHOOL_NAME_SESSION_KEY,
} from './signUpFlowConstants';

import style from './signUpFlowStyles.module.scss';

const FinishTeacherAccount: React.FunctionComponent<{
  usIp: boolean;
}> = ({usIp}) => {
  const [name, setName] = useState('');
  const [showNameError, setShowNameError] = useState(false);
  const [emailOptInChecked, setEmailOptInChecked] = useState(false);

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newName = e.target.value;
    setName(newName);

    if (newName === '') {
      setShowNameError(true);
    } else {
      setShowNameError(false);
    }
  };

  const submitTeacherAccount = () => {
    const userType = sessionStorage.getItem(ACCOUNT_TYPE_SESSION_KEY);
    const email = sessionStorage.getItem(EMAIL_SESSION_KEY);
    const school = sessionStorage.getItem(SCHOOL_ID_SESSION_KEY);
    const schoolZip = sessionStorage.getItem(SCHOOL_ZIP_SESSION_KEY);
    const schoolName = sessionStorage.getItem(SCHOOL_NAME_SESSION_KEY);
    const fetchNewUrlParams = `new_sign_up=true&user_type=${userType}&email=${email}&name=${name}&email_preference_opt_in=${emailOptInChecked}&school=${school}&school_id=${school}&school_zip=${schoolZip}&school_name=${schoolName}`;

    fetch(`/users/sign_up?${fetchNewUrlParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(async () => {
      fetch(`/users?new_sign_up=true&user_email=${email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': await getAuthenticityToken(),
        },
      }).then(() => {
        navigateToHref('/home');
      });
    });
  };

  return (
    <div className={style.finishAccountContainer}>
      <div className={style.headerTextContainer}>
        <Heading2>{locale.finish_creating_teacher_account()}</Heading2>
        <BodyTwoText>{locale.tailor_experience()}</BodyTwoText>
      </div>
      <fieldset className={style.inputContainer}>
        <div>
          <TextField
            name="displayName"
            label={locale.what_do_you_want_to_be_called()}
            className={style.nameInput}
            value={name}
            placeholder={locale.msCoder()}
            onChange={onNameChange}
          />
          <BodyThreeText className={style.displayNameSubtext}>
            {locale.this_is_what_your_students_will_see()}
          </BodyThreeText>
          {showNameError && (
            <BodyThreeText className={style.errorMessage}>
              {locale.display_name_error_message()}
            </BodyThreeText>
          )}
        </div>
        <SchoolDataInputs usIp={usIp} includeHeaders={false} />
        <div>
          <BodyThreeText className={style.teacherKeepMeUpdated}>
            <strong>{locale.keep_me_updated()}</strong>
          </BodyThreeText>
          <Checkbox
            name="userEmailOptIn"
            label={locale.get_informational_emails()}
            checked={emailOptInChecked}
            onChange={e => setEmailOptInChecked(e.target.checked)}
          />
          <BodyThreeText className={style.emailOptInFootnote}>
            <strong>{locale.note()}</strong>{' '}
            {locale.after_creating_your_account()}
          </BodyThreeText>
        </div>
      </fieldset>
      <div className={style.finishSignUpButtonContainer}>
        <Button
          className={style.finishSignUpButton}
          color={buttonColors.purple}
          type="primary"
          onClick={submitTeacherAccount}
          text={locale.go_to_my_account()}
          iconRight={{
            iconName: 'arrow-right',
            iconStyle: 'solid',
            title: 'arrow-right',
          }}
          disabled={name === ''}
        />
      </div>
    </div>
  );
};

export default FinishTeacherAccount;
