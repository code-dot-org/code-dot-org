import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Link from '@code-dot-org/component-library/link';
import {Typography, Button as MuiButton} from '@mui/material';
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
        <MuiButton
          variant="contained"
          color="primary"
          size="medium"
          disabled
          className={moduleStyles.fullWidthButton}
          onClick={() => null}
          type="button"
        >
          {'Workshop is full'}
        </MuiButton>
      );
    }

    if (customRegistrationLink) {
      return (
        <>
          <Typography variant="body3" gutterBottom>
            This workshop's registration is managed externally by the regional
            partner.
          </Typography>
          <MuiButton
            variant="contained"
            color="primary"
            size="medium"
            loadingPosition="end"
            className={moduleStyles.fullWidthButton}
            href={customRegistrationLink}
            target="_blank"
            endIcon={<FontAwesomeV6Icon iconName="up-right-from-square" />}
          >
            {'Go to partner enrollment'}
          </MuiButton>
        </>
      );
    }

    if (isStudent || isSignedOut) {
      return (
        <MuiButton
          variant="contained"
          color="primary"
          size="medium"
          loadingPosition="end"
          className={moduleStyles.fullWidthButton}
          href={buildEnrollButtonLink(`/professional-learning/workshops/${id}`)}
          endIcon={<FontAwesomeV6Icon iconName="right-to-bracket" />}
        >
          {isStudent ? 'Switch to teacher account' : 'Sign-in to enroll'}
        </MuiButton>
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
          <MuiButton
            variant="contained"
            color="primary"
            size="medium"
            loading={isSubmitting}
            disabled={isMissingUserInfo(userInfo)}
            className={moduleStyles.fullWidthButton}
            onClick={handleClick}
            type="button"
          >
            {'Enroll in this workshop'}
          </MuiButton>
        )}
      </div>
    );
  };

  return (
    <div className={moduleStyles.card}>
      <Typography component="h3" variant="h6" gutterBottom>
        Enroll in this workshop
      </Typography>
      {renderEnrollmentAction()}
      <Link type="secondary" size="xs" href="#data-sharing-notice">
        Click to see data sharing notice
      </Link>
    </div>
  );
};

export default EnrollInWorkshop;
