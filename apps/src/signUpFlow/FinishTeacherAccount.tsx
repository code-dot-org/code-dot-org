import {Button, buttonColors} from '@code-dot-org/component-library/button';
import Checkbox from '@code-dot-org/component-library/checkbox';
import CloseButton from '@code-dot-org/component-library/closeButton';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import TextField from '@code-dot-org/component-library/textField';
import {
  BodyThreeText,
  BodyFourText,
  BodyTwoText,
  Heading2,
} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import cookies from 'js-cookie';
import React, {useState, useEffect, useMemo} from 'react';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {schoolInfoInvalid} from '@cdo/apps/schoolInfo/utils/schoolInfoInvalid';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import SchoolDataInputs from '@cdo/apps/templates/SchoolDataInputs';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import trackEvent from '@cdo/apps/util/trackEvent';
import {UserTypes, EducatorRoles} from '@cdo/generated-scripts/sharedConstants';

import {useSchoolInfo} from '../schoolInfo/hooks/useSchoolInfo';
import {buildSchoolData} from '../schoolInfo/utils/buildSchoolData';
import {navigateToHref} from '../utils';

import locale from './locale';
import {
  ACCOUNT_TYPE_SESSION_KEY,
  EMAIL_SESSION_KEY,
  OAUTH_LOGIN_TYPE_SESSION_KEY,
  USER_RETURN_TO_SESSION_KEY,
  clearSignUpSessionStorage,
  SIGN_UP_USER_TYPE,
  MAX_DISPLAY_NAME_LENGTH,
} from './signUpFlowConstants';

import style from './signUpFlowStyles.module.scss';

export const roleItemGroups = [
  {
    label: '',
    groupItems: [{value: '', text: locale.select_a_role()}],
  },
  ...Object.entries(
    EducatorRoles.reduce((groups, {category, value}) => {
      const text = locale[value]?.() ?? '';
      const categoryLabel = locale[category]?.() ?? '';
      groups[categoryLabel] = groups[categoryLabel] ?? [];
      groups[categoryLabel].push({value, text});
      return groups;
    }, {} as Record<string, {value: string; text: string}[]>)
  ).map(([label, groupItems]) => ({label, groupItems})),
];

const FinishTeacherAccount: React.FunctionComponent<{
  usIp: boolean;
  countryCode: string;
  redirectUrl?: string;
}> = ({usIp, countryCode, redirectUrl}) => {
  const schoolInfo = useSchoolInfo({usIp});
  const [name, setName] = useState('');
  const [nameErrorMessage, setNameErrorMessage] = useState(null);
  const [educatorRole, setEducatorRole] = useState('');
  const [emailOptInChecked, setEmailOptInChecked] = useState(false);
  const [gdprChecked, setGdprChecked] = useState(false);
  const [showGDPR, setShowGDPR] = useState(false);
  const [isGdprLoaded, setIsGdprLoaded] = useState(false);
  const [userReturnTo, setUserReturnTo] = useState('/home');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorCreatingAccountMessage, setErrorCreatingAccountMessage] =
    useState('');

  // Remove oauth user_type cookie if it exists
  cookies.remove(SIGN_UP_USER_TYPE);

  useEffect(() => {
    // If the user hasn't selected a user type or login type, redirect them back to the incomplete step of signup.
    if (
      sessionStorage.getItem(ACCOUNT_TYPE_SESSION_KEY) !== UserTypes.TEACHER
    ) {
      navigateToHref('/users/sign_up/account_type');
    } else if (
      sessionStorage.getItem(EMAIL_SESSION_KEY) === null &&
      sessionStorage.getItem(OAUTH_LOGIN_TYPE_SESSION_KEY) === null
    ) {
      navigateToHref(
        `/users/sign_up/login_type?user_type=${UserTypes.TEACHER}`
      );
    }

    analyticsReporter.sendEvent(
      EVENTS.FINISH_ACCOUNT_PAGE_LOADED,
      {'user type': 'teacher', country: countryCode},
      PLATFORMS.BOTH
    );

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

    const userReturnToHref =
      sessionStorage.getItem(USER_RETURN_TO_SESSION_KEY) || redirectUrl;
    if (userReturnToHref) {
      setUserReturnTo(userReturnToHref);
    }
  }, [countryCode, usIp, redirectUrl]);

  // GDPR is valid if
  // 1. The fetch call has completed AND
  //   2. GDPR is showing AND checked OR
  //   3. GDPR is not relevant (not showing)
  const gdprValid = useMemo(() => {
    return isGdprLoaded && ((showGDPR && gdprChecked) || !showGDPR);
  }, [showGDPR, gdprChecked, isGdprLoaded]);

  const formDisabled = useMemo(
    () =>
      name?.trim() === '' ||
      name?.length > MAX_DISPLAY_NAME_LENGTH ||
      !gdprValid ||
      schoolInfoInvalid(schoolInfo) ||
      !educatorRole,
    [gdprValid, name, schoolInfo, educatorRole]
  );

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newName = e.target.value;
    setName(newName);

    if (newName.trim() === '') {
      setNameErrorMessage(locale.display_name_error_message());
    } else if (newName.length > MAX_DISPLAY_NAME_LENGTH) {
      setNameErrorMessage(
        locale.display_name_too_long_error_message({
          maxLength: MAX_DISPLAY_NAME_LENGTH,
        })
      );
    } else {
      setNameErrorMessage(null);
    }
  };

  const submitTeacherAccount = async () => {
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    sendFinishEvent();
    setErrorCreatingAccountMessage('');

    const signUpParams = {
      user: {
        user_type: UserTypes.TEACHER,
        email: sessionStorage.getItem(EMAIL_SESSION_KEY),
        name: name,
        email_preference_opt_in: emailOptInChecked,
        school_info_attributes: buildSchoolData({
          schoolId: schoolInfo.schoolId,
          country: schoolInfo.country,
          schoolName: schoolInfo.schoolName,
          schoolZip: schoolInfo.schoolZip,
        }),
        country_code: countryCode,
        educator_role: educatorRole || null,
      },
    };
    const authToken = await getAuthenticityToken();
    const response = await fetch('/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': authToken,
      },
      body: JSON.stringify(signUpParams),
    });

    if (response.ok) {
      clearSignUpSessionStorage(true);
      navigateToHref(userReturnTo);
    } else {
      if (response.status === 400) {
        response
          .json()
          .then(badRequest => setErrorCreatingAccountMessage(badRequest.error));
      } else {
        setErrorCreatingAccountMessage(locale.error_signing_up_message());
      }
      setIsSubmitting(false);
    }
  };

  const onGDPRChange = (): void => {
    const newGdprCheckedChoice = !gdprChecked;
    setGdprChecked(newGdprCheckedChoice);
  };

  const sendFinishEvent = (): void => {
    // Log to Statsig and Amplitude
    const schoolData = buildSchoolData({
      schoolId: schoolInfo.schoolId,
      country: schoolInfo.country,
      schoolName: schoolInfo.schoolName,
      schoolZip: schoolInfo.schoolZip,
    });
    // schoolData would be undefined if not valid, and the only
    // school_type sent is 'noSchoolSetting', which is not a school
    const hasSchool = schoolData && !schoolData.school_type;
    analyticsReporter.sendEvent(
      EVENTS.SIGN_UP_FINISHED_EVENT,
      {
        'user type': 'teacher',
        'has school': hasSchool,
        'has marketing value selected': true,
        'has display name': !nameErrorMessage,
        'educator role': educatorRole,
        country: countryCode,
      },
      PLATFORMS.BOTH
    );

    // Log to Google Analytics
    trackEvent('sign_up', 'sign_up_success', {
      value: 'teacher',
    });
  };

  return (
    <div>
      <div className={style.finishAccountContainer}>
        <div className={style.headerTextContainer}>
          <Heading2>{locale.finish_creating_teacher_account()}</Heading2>
          <BodyTwoText>{locale.tailor_experience()}</BodyTwoText>
        </div>
        {errorCreatingAccountMessage && (
          <div className={style.errorSigningUpMessage}>
            <div className={style.errorMessageWithXMark}>
              <FontAwesomeV6Icon
                iconName={'circle-xmark'}
                className={style.xIcon}
              />
              <SafeMarkdown
                markdown={errorCreatingAccountMessage}
                className={style.errorMessageText}
              />
            </div>
            <CloseButton
              onClick={() => setErrorCreatingAccountMessage('')}
              aria-label={locale.error_signing_up_message_aria_label()}
            />
          </div>
        )}
        <fieldset className={style.inputContainer}>
          <div>
            <TextField
              name="displayName"
              id="uitest-display-name"
              label={locale.what_do_you_want_to_be_called()}
              value={name}
              placeholder={locale.msCoder()}
              onChange={onNameChange}
            />
            <BodyThreeText className={style.displayNameSubtext}>
              {locale.this_is_what_your_students_will_see()}
            </BodyThreeText>
            {nameErrorMessage && (
              <BodyThreeText className={style.errorMessage}>
                {nameErrorMessage}
              </BodyThreeText>
            )}
          </div>
          <SimpleDropdown
            id="uitest-educator-role"
            className={classNames(style.dropdownContainer, style.requiredLabel)}
            labelText={locale.what_is_your_role()}
            name="educator_role"
            selectedValue={educatorRole}
            onChange={e => {
              setEducatorRole(e.target.value);
            }}
            itemGroups={roleItemGroups}
            dropdownTextThickness="thin"
          />
          <SchoolDataInputs {...schoolInfo} includeHeaders={false} />
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
            disabled={formDisabled}
            isPending={isSubmitting}
          />
        </div>
      </div>
      <SafeMarkdown
        className={style.tosAndPrivacy}
        markdown={locale.by_signing_up({
          tosLink: 'https://code.org/tos',
          privacyPolicyLink: 'https://code.org/privacy',
        })}
        openExternalLinksInNewTab={true}
      />
    </div>
  );
};

export default FinishTeacherAccount;
