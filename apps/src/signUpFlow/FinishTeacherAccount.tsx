import classNames from 'classnames';
import React, {useState, useEffect, useMemo} from 'react';

import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';
import TextField from '@cdo/apps/componentLibrary/textField/TextField';
import {
  Heading2,
  BodyTwoText,
  BodyThreeText,
  BodyFourText,
} from '@cdo/apps/componentLibrary/typography';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import SchoolDataInputs from '@cdo/apps/templates/SchoolDataInputs';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import {UserTypes} from '@cdo/generated-scripts/sharedConstants';

import {navigateToHref} from '../utils';

import locale from './locale';
import {
  EMAIL_SESSION_KEY,
  SCHOOL_ID_SESSION_KEY,
  SCHOOL_ZIP_SESSION_KEY,
  SCHOOL_NAME_SESSION_KEY,
  SCHOOL_COUNTRY_SESSION_KEY,
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

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newName = e.target.value;
    setName(newName);

    if (newName === '') {
      setShowNameError(true);
    } else {
      setShowNameError(false);
    }
  };

  const submitTeacherAccount = async () => {
    sendFinishEvent();

    const signUpParams = {
      new_sign_up: true,
      user: {
        user_type: UserTypes.TEACHER,
        email: sessionStorage.getItem(EMAIL_SESSION_KEY),
        name: name,
        email_preference_opt_in: emailOptInChecked,
        school: sessionStorage.getItem(SCHOOL_ID_SESSION_KEY),
        school_id: sessionStorage.getItem(SCHOOL_ID_SESSION_KEY),
        school_zip: sessionStorage.getItem(SCHOOL_ZIP_SESSION_KEY),
        school_name: sessionStorage.getItem(SCHOOL_NAME_SESSION_KEY),
        school_country: sessionStorage.getItem(SCHOOL_COUNTRY_SESSION_KEY),
      },
    };
    const authToken = await getAuthenticityToken();
    await fetch('/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': authToken,
      },
      body: JSON.stringify(signUpParams),
    });

    navigateToHref('/home');
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
    <div>
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
                label={locale.data_transfer_agreement_teacher()}
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
          <div>
            <BodyThreeText className={style.teacherKeepMeUpdated}>
              <strong>{locale.keep_me_updated()}</strong>
            </BodyThreeText>
            <Checkbox
              name="userEmailOptIn"
              label={locale.get_informational_emails()}
              checked={emailOptInChecked}
              onChange={e => setEmailOptInChecked(e.target.checked)}
              size="s"
            />
            <BodyFourText className={style.emailOptInFootnote}>
              <strong>{locale.note()}</strong>{' '}
              {locale.after_creating_your_account()}
            </BodyFourText>
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
            disabled={name === '' || !gdprValid}
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

export default FinishTeacherAccount;
