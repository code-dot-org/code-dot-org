import React, {useState, useEffect, useMemo} from 'react';

import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';
import TextField from '@cdo/apps/componentLibrary/textField/TextField';
import {
  Heading2,
  BodyTwoText,
  BodyThreeText,
} from '@cdo/apps/componentLibrary/typography';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import SchoolDataInputs from '@cdo/apps/templates/SchoolDataInputs';

import locale from './locale';
import {
  DISPLAY_NAME_SESSION_KEY,
  EMAIL_OPT_IN_SESSION_KEY,
} from './signUpFlowConstants';

import style from './signUpFlowStyles.module.scss';

const FinishTeacherAccount: React.FunctionComponent<{
  usIp: boolean;
}> = ({usIp}) => {
  const [name, setName] = useState('');
  const [showNameError, setShowNameError] = useState(false);
  const [emailOptInChecked, setEmailOptInChecked] = useState(false);
  const [gdprChecked, setGdprChecked] = useState(false);
  const [showGDPR, setShowGDPR] = useState(false);

  useEffect(() => {
    const fetchGdprData = async () => {
      try {
        const response = await fetch('/users/gdpr_check');
        const data = await response.json();
        if (data.gdpr || data.force_in_eu) {
          setShowGDPR(true);
        }
      } catch (error) {
        console.error('Error fetching GDPR data:', error);
      }
    };

    fetchGdprData();
  }, []);

  const gdprValid = useMemo(() => {
    return (showGDPR && gdprChecked) || !showGDPR;
  }, [showGDPR, gdprChecked]);

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

  const onEmailOptInChange = (): void => {
    const newOptInCheckedChoice = !emailOptInChecked;
    setEmailOptInChecked(newOptInCheckedChoice);
    sessionStorage.setItem(
      EMAIL_OPT_IN_SESSION_KEY,
      `${newOptInCheckedChoice}`
    );
  };

  const onGDPRChange = (): void => {
    const newGdprCheckedChoice = !gdprChecked;
    setGdprChecked(newGdprCheckedChoice);
  };

  const sendFinishEvent = (): void => {
    const hasSchool = !!document.querySelector(
      'select[name="user[school_info_attributes][school_id]"]'
    );
    analyticsReporter.sendEvent(
      EVENTS.SIGN_UP_FINISHED_EVENT,
      {
        'user type': 'teacher',
        'has school': hasSchool,
        'has marketing value selected': true,
        'has display name': !showNameError,
      },
      PLATFORMS.BOTH
    );
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
        {showGDPR && (
          <div>
            <BodyThreeText className={style.teacherKeepMeUpdated}>
              <strong>{locale.data_transfer_notice()}</strong>
            </BodyThreeText>
            <Checkbox
              name="gdprAcknowledge"
              label={locale.data_transfer_agreement_teacher()}
              checked={gdprChecked}
              onChange={onGDPRChange}
            />
          </div>
        )}
        <div>
          <BodyThreeText className={style.teacherKeepMeUpdated}>
            <strong>{locale.keep_me_updated()}</strong>
          </BodyThreeText>
          <Checkbox
            name="userEmailOptIn"
            label={locale.get_informational_emails()}
            checked={emailOptInChecked}
            onChange={onEmailOptInChange}
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
          onClick={() => sendFinishEvent()}
          text={locale.go_to_my_account()}
          iconRight={{
            iconName: 'arrow-right',
            iconStyle: 'solid',
            title: 'arrow-right',
          }}
          disabled={name === '' || !gdprValid}
        />
      </div>
    </div>
  );
};

export default FinishTeacherAccount;
