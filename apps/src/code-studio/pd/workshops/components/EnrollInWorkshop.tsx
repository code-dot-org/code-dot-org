import Alert from '@code-dot-org/component-library/alert';
import Button, {LinkButton} from '@code-dot-org/component-library/button';
import Link from '@code-dot-org/component-library/link';
import {
  Heading3,
  BodyThreeText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import {
  UserInfoForWorkshop,
  UserWorkshopEnrollment,
  WorkshopInfo,
} from '@cdo/apps/code-studio/pd/workshops/types';

import {useWorkshopEnrollment} from './../hooks/useWorkshopEnrollment';
import CancelWorkshopEnrollment from './CancelWorkshopEnrollment';
import UserPassport, {isMissingUserInfo} from './UserPassport';

import moduleStyles from './../workshopMarketingPage.module.scss';

const WORKSHOP_ENROLL_SOURCE_PAGE = 'workshop enroll';

interface EnrollInWorkshopProps
  extends Pick<
      WorkshopInfo,
      | 'customRegistrationLink'
      | 'numEnrollments'
      | 'capacity'
      | 'id'
      | 'regionalPartnerName'
      | 'course'
      | 'sessions'
      | 'name'
      | 'format'
      | 'subject'
    >,
    UserInfoForWorkshop {
  isUserEnrolled?: boolean;
  userEnrollment?: UserWorkshopEnrollment;
}
/** Component to display the enrollment information for a workshop. */
const EnrollInWorkshop: React.FC<EnrollInWorkshopProps> = ({
  id,
  customRegistrationLink,
  numEnrollments,
  capacity,
  sessions,
  userInfo,
  regionalPartnerName,
  course,
  format,
  name,
  subject,
  userEnrollment,
  isUserEnrolled,
}) => {
  const {handleClick, isSubmitting, alertState, setAlertState} =
    useWorkshopEnrollment({
      workshopId: id,
      userId: userInfo?.id,
      regionalPartnerName,
      course,
      format,
      name,
      subject,
      sessions,
    });

  const isStudent = userInfo?.isStudent || false;
  const isSignedOut = !userInfo;
  const isFull = numEnrollments >= capacity;

  const buildEnrollButtonLink = (enrollLink: string) => {
    if (isSignedOut) {
      return `/logged_out?source_page=${encodeURIComponent(
        WORKSHOP_ENROLL_SOURCE_PAGE
      )}&return_to=${encodeURIComponent(enrollLink)}`;
    }

    if (isStudent) {
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

    if (customRegistrationLink) {
      return (
        <>
          <BodyThreeText>
            This workshop's registration is managed externally by the regional
            partner.
          </BodyThreeText>
          <LinkButton
            href={customRegistrationLink}
            target="_blank"
            className={moduleStyles.fullWidthButton}
            type="primary"
            size="m"
            text="Go to partner enrollment"
            iconRight={{iconName: 'up-right-from-square'}}
          />
        </>
      );
    }

    if (isStudent || isSignedOut) {
      return (
        <LinkButton
          className={moduleStyles.fullWidthButton}
          type="primary"
          size="m"
          href={buildEnrollButtonLink(`/professional-learning/workshops/${id}`)}
          text={isStudent ? 'Switch to teacher account' : 'Sign-in to enroll'}
          iconRight={{iconName: 'right-to-bracket'}}
        />
      );
    }

    return (
      <div className={moduleStyles.internalEnrollButton}>
        {userInfo && (
          <UserPassport
            displayName={userInfo.displayName}
            givenName={userInfo.givenName}
            familyName={userInfo.familyName}
            email={userInfo.email}
            educatorRole={userInfo.educatorRole}
            schoolName={userInfo.schoolInfo?.schoolName}
            schoolType={userInfo.schoolInfo?.schoolType}
            returnToHref={`/professional-learning/workshops/${id}`}
            isUserEnrolled={isUserEnrolled}
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
        {isUserEnrolled && userEnrollment?.code ? (
          <CancelWorkshopEnrollment enrollmentCode={userEnrollment.code} />
        ) : (
          <Button
            className={moduleStyles.fullWidthButton}
            type="primary"
            size="m"
            isPending={isSubmitting}
            onClick={handleClick}
            text="Enroll in this workshop"
            disabled={isMissingUserInfo(userInfo)}
          />
        )}
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
