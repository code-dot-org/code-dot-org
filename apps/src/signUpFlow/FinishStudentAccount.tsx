import classNames from 'classnames';
import React, {useState, useEffect, useMemo} from 'react';

import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';
import SimpleDropdown from '@cdo/apps/componentLibrary/dropdown/simpleDropdown';
import TextField from '@cdo/apps/componentLibrary/textField/TextField';
import {
  Heading2,
  BodyTwoText,
  BodyThreeText,
} from '@cdo/apps/componentLibrary/typography';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {isEmail} from '@cdo/apps/util/formatValidation';

import locale from './locale';
import {
  IS_PARENT_SESSION_KEY,
  PARENT_EMAIL_SESSION_KEY,
  PARENT_EMAIL_OPT_IN_SESSION_KEY,
  USER_AGE_SESSION_KEY,
  USER_STATE_SESSION_KEY,
  USER_GENDER_SESSION_KEY,
} from './signUpFlowConstants';

import style from './signUpFlowStyles.module.scss';

const FinishStudentAccount: React.FunctionComponent<{
  ageOptions: {value: string; text: string}[];
  usIp: boolean;
  usStateOptions: {value: string; text: string}[];
}> = ({ageOptions, usIp, usStateOptions}) => {
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

  const [gdprChecked, setGdprChecked] = useState(false);
  const [showGDPR, setShowGDPR] = useState(false);
  const [isGdprLoaded, setIsGdprLoaded] = useState(false);

  useEffect(() => {
    const fetchGdprData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const forceInEu = urlParams.get('force_in_eu');
      try {
        const response = await fetch(
          `/users/gdpr_check?force_in_eu=${forceInEu}`
        );
        const data = await response.json();
        if (data.gdpr || data.force_in_eu === '1') {
          setShowGDPR(true);
        }
      } catch (error) {
        console.error('Error fetching GDPR data:', error);
      } finally {
        setIsGdprLoaded(true);
      }
    };
    fetchGdprData();
  }, []);

  // GDPR is valid if
  // 1. The fetch call has completed AND
  //   2. GDPR is showing AND checked OR
  //   3. GDPR is not relevant (not showing)
  const gdprValid = useMemo(() => {
    return isGdprLoaded && ((showGDPR && gdprChecked) || !showGDPR);
  }, [showGDPR, gdprChecked, isGdprLoaded]);

  const onGDPRChange = (): void => {
    const newGdprCheckedChoice = !gdprChecked;
    setGdprChecked(newGdprCheckedChoice);
  };

  const onIsParentChange = (): void => {
    analyticsReporter.sendEvent(
      EVENTS.PARENT_OR_GUARDIAN_SIGN_UP_CLICKED,
      {},
      PLATFORMS.STATSIG
    );
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

    if (!isEmail(newParentEmail)) {
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

  const sendFinishEvent = (): void => {
    analyticsReporter.sendEvent(
      EVENTS.SIGN_UP_FINISHED_EVENT,
      {
        'user type': 'student',
        'has school': false,
        'has marketing value selected': true,
        'has display name': !showNameError,
      },
      PLATFORMS.BOTH
    );
  };

  return (
    <div>
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
              size="s"
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
                    size="s"
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
          {usIp && (
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
          )}
          <TextField
            name="userGender"
            label={locale.what_is_your_gender()}
            value={gender}
            placeholder={locale.female()}
            onChange={onGenderChange}
          />
          {showGDPR && (
            <div>
              <BodyThreeText
                className={classNames(
                  style.teacherKeepMeUpdated,
                  style.required
                )}
              >
                <strong>{locale.data_transfer_notice()}</strong>
              </BodyThreeText>
              <Checkbox
                name="gdprAcknowledge"
                label={locale.data_transfer_agreement_student()}
                checked={gdprChecked}
                onChange={onGDPRChange}
                size="s"
              />
              <div className={style.inlineContainer}>
                <strong className={style.inlineItem}>{locale.note()}</strong>{' '}
                <SafeMarkdown
                  className={style.inlineItem}
                  markdown={locale.visit_privacy_policy()}
                />
              </div>
            </div>
          )}
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
            disabled={
              name === '' ||
              age === '' ||
              (usIp && state === '') ||
              (isParent && parentEmail === '') ||
              !gdprValid
            }
          />
        </div>
      </div>
      <SafeMarkdown
        className={style.tosAndPrivacy}
        markdown={locale.by_signing_up({
          tosLink: 'code.org/tos',
          privacyPolicyLink: 'code.org/privacy',
        })}
      />
    </div>
  );
};

export default FinishStudentAccount;
