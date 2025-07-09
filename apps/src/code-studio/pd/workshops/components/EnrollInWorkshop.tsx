import Alert from '@code-dot-org/component-library/alert';
import Button, {LinkButton} from '@code-dot-org/component-library/button';
import Link from '@code-dot-org/component-library/link';
import {
  Heading3,
  BodyThreeText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import {
  GetUserInfoForWorkshopResponse,
  GetWorkshopInfoScriptDataResponse,
} from '@cdo/apps/code-studio/pd/workshops/types';

import {useWorkshopEnrollment} from './../hooks/useWorkshopEnrollment';
import UserPassport, {isMissingUserInfo} from './UserPassport';

import moduleStyles from './../workshopMarketingPage.module.scss';

const WORKSHOP_ENROLL_SOURCE_PAGE = 'workshop enroll';

interface EnrollInWorkshopProps
  extends Pick<
      GetWorkshopInfoScriptDataResponse,
      | 'custom_registration_link'
      | 'num_enrollments'
      | 'capacity'
      | 'id'
      | 'regional_partner_name'
      | 'course'
      | 'sessions'
      | 'name'
      | 'format'
      | 'subject'
    >,
    GetUserInfoForWorkshopResponse {}
/** Component to display the enrollment information for a workshop. */
const EnrollInWorkshop: React.FC<EnrollInWorkshopProps> = ({
  id,
  custom_registration_link,
  num_enrollments,
  capacity,
  sessions,
  userInfo,
  regional_partner_name,
  course,
  format,
  name,
  subject,
}) => {
  const {handleClick, isSubmitting, alertState, setAlertState} =
    useWorkshopEnrollment({
      workshopId: id,
      userInfo,
      regional_partner_name,
      course,
      format,
      name,
      subject,
      sessions,
    });

  const is_student = userInfo?.is_student || false;
  const is_signed_out = !userInfo;
  const isFull = num_enrollments >= capacity;

  const buildEnrollButtonLink = (enrollLink: string) => {
    if (is_signed_out) {
      return `/logged_out?source_page=${encodeURIComponent(
        WORKSHOP_ENROLL_SOURCE_PAGE
      )}&return_to=${encodeURIComponent(enrollLink)}`;
    }

    if (is_student) {
      return `/teacher_account_required?source_page=${encodeURIComponent(
        WORKSHOP_ENROLL_SOURCE_PAGE
      )}&return_to=${encodeURIComponent(enrollLink)}`;
    }

    return enrollLink;
  };

  const renderEnrollmentAction = () => {
    if (isFull) {
      return (
        <Button
          className={moduleStyles.fullWidthButton}
          size="m"
          disabled
          text="Workshop is full"
          onClick={() => null}
        />
      );
    }

    if (custom_registration_link) {
      return (
        <>
          <BodyThreeText>
            This workshop’s registration is managed externally by the regional
            partner.
          </BodyThreeText>
          <LinkButton
            href={buildEnrollButtonLink(custom_registration_link)}
            className={moduleStyles.fullWidthButton}
            type="primary"
            size="m"
            text="Go to partner enrollment"
            iconRight={{iconName: 'up-right-from-square'}}
          />
        </>
      );
    }

    if (is_student || is_signed_out) {
      return (
        <LinkButton
          className={moduleStyles.fullWidthButton}
          type="primary"
          size="m"
          href={buildEnrollButtonLink(`/professional-learning/workshops/${id}`)}
          text={is_student ? 'Switch to teacher account' : 'Sign-in to enroll'}
          iconRight={{iconName: 'right-to-bracket'}}
        />
      );
    }

    return (
      <div className={moduleStyles.internalEnrollButton}>
        {userInfo && (
          <UserPassport
            displayName={userInfo.display_name}
            givenName={userInfo.first_name}
            familyName={userInfo.last_name}
            email={userInfo.email}
            schoolName={userInfo.school_info?.school_name}
            schoolType={userInfo.school_info?.school_type}
            returnToHref={`/professional-learning/workshops/${id}`}
            className={moduleStyles.userPassport}
          />
        )}
        {alertState.show && (
          <Alert
            type={'danger'}
            text={alertState.text}
            link={alertState.link}
            onClose={() =>
              setAlertState({show: false, text: '', link: undefined})
            }
          />
        )}
        <Button
          className={moduleStyles.fullWidthButton}
          type="primary"
          size="m"
          isPending={isSubmitting}
          onClick={handleClick}
          text="Enroll in this workshop"
          disabled={isMissingUserInfo(userInfo)}
        />
      </div>
    );
  };

  return (
    <div className={moduleStyles.card}>
      <Heading3 visualAppearance="heading-xs">Enroll in this workshop</Heading3>
      {renderEnrollmentAction()}
      <Link type="secondary" size="xs" href="#data-sharing-notice">
        Click to see data sharing notice
      </Link>
    </div>
  );
};

export default EnrollInWorkshop;
