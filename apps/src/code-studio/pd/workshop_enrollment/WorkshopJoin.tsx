/**
 * Join workshop page
 */
import {Button} from '@code-dot-org/component-library/button';
import {
  Heading3,
  BodyThreeText,
} from '@code-dot-org/component-library/typography';
import React, {useState} from 'react';

import UserPassport, {
  isMissingUserInfo,
} from '@cdo/apps/code-studio/pd/workshops/components/UserPassport';
import {useWorkshopEnrollmentApi} from '@cdo/apps/code-studio/pd/workshops/hooks/useWorkshopEnrollmentApi';
import {GetUserInfoForWorkshopResponse} from '@cdo/apps/code-studio/pd/workshops/types';
import AccountBanner from '@cdo/apps/templates/account/AccountBanner';
import {navigateToHref} from '@cdo/apps/utils';

import {SUBMISSION_STATUSES} from './constants';

import style from './workshop_join.module.scss';

interface SessionCalendarEvent {
  id: number;
  start: string;
  end: string;
  is_local: boolean;
  session_format: string;
  location_address?: string;
  meeting_link?: string;
  description?: string;
  notes?: string;
}

const WorkshopJoin: React.FunctionComponent<{
  workshop_enrollment_status: string;
  workshop_info: {
    id: number;
    course: string;
    subject?: string;
    name?: string;
    format: string;
    rp_name?: string;
    session_info_for_calendar?: SessionCalendarEvent[];
  };
  user_info: GetUserInfoForWorkshopResponse['userInfo'];
}> = ({workshop_enrollment_status, workshop_info, user_info}) => {
  const [enrollmentStatus, setEnrollmentStatus] = useState(
    workshop_enrollment_status
  );
  const [submissionErrorMessage, setSubmissionErrorMessage] = useState('');
  const {submitEnrollment, isSubmitting, error} = useWorkshopEnrollmentApi(
    workshop_info.id
  );

  const handleSubmitEnrollment = async () => {
    const result = await submitEnrollment(
      user_info && {
        user_id: user_info.id,
        email: user_info.email,
        first_name: user_info.first_name,
        last_name: user_info.last_name,
        school_info: user_info.school_info,
      }
    );

    if (result?.workshop_enrollment_status === SUBMISSION_STATUSES.SUCCESS) {
      navigateOnEnrollSuccess();
    } else {
      setEnrollmentStatus(SUBMISSION_STATUSES.UNKNOWN_ERROR);
      setSubmissionErrorMessage(
        result?.error_message ||
          error ||
          'An unknown error occurred while processing your enrollment.'
      );
    }
  };

  const navigateOnEnrollSuccess = () => {
    // Redirect to My PL landing page. The WORKSHOP_ENROLLMENT_COMPLETED_EVENT event will be logged
    // on that page since event logs immediately followed by redirects sometimes do not fire.
    sessionStorage.setItem('workshopId', `${workshop_info.id}`);
    sessionStorage.setItem('workshopCourse', workshop_info.course);
    sessionStorage.setItem('workshopSubject', workshop_info.subject || '');
    sessionStorage.setItem('workshopName', workshop_info.name || '');
    sessionStorage.setItem('workshopFormat', workshop_info.format);
    sessionStorage.setItem('rpName', workshop_info.rp_name || '');
    sessionStorage.setItem(
      'sessionTimeInfo',
      workshop_info.session_info_for_calendar
        ? JSON.stringify(workshop_info.session_info_for_calendar)
        : ''
    );

    navigateToHref('/my-professional-learning');
  };

  const RenderUnsubmitted = () => {
    return (
      <div className={style.unsubmittedContainer}>
        <div className={style.unsupportedStatusTextContainer}>
          <Heading3>Review your information</Heading3>
          <BodyThreeText>
            This is your current Code.org account info. Make sure it matches
            what you shared during registration — any updates you make here will
            also update your account. You can update your account info at any
            time in your account settings.
          </BodyThreeText>
          <Button
            name="joinWorkshop"
            text="Join this workshop"
            color="purple"
            className={style.joinWorkshopButton}
            onClick={handleSubmitEnrollment}
            isPending={isSubmitting}
            disabled={isMissingUserInfo(user_info) || !!error}
          />
        </div>
        {user_info && (
          <UserPassport
            displayName={user_info.display_name}
            givenName={user_info.first_name}
            familyName={user_info.last_name}
            email={user_info.email}
            schoolName={user_info.school_info?.school_name}
            schoolType={user_info.school_info?.school_type}
            returnToHref={`/pd/workshops/${workshop_info.id}/join`}
            className={style.userPassport}
          />
        )}
      </div>
    );
  };

  const RenderBasicResponse = (heading: string, body: string) => {
    return (
      <div className={style.statusTextContainer}>
        <Heading3>{heading}</Heading3>
        <BodyThreeText>
          {`${body} If this seems like a mistake, please reach out to `}
          <a href="mailto:support@code.org">support@code.org</a>
          {'.'}
        </BodyThreeText>
      </div>
    );
  };

  const RenderStatusContent = () => {
    switch (enrollmentStatus) {
      case SUBMISSION_STATUSES.DUPLICATE:
        return RenderBasicResponse(
          'Duplicate enrollment',
          'An enrollment for this workshop with this account already exists.'
        );
      case SUBMISSION_STATUSES.OWN:
        return RenderBasicResponse(
          'Your own workshop',
          'You are attempting to join your own workshop.'
        );
      case SUBMISSION_STATUSES.CLOSED:
        return RenderBasicResponse(
          'Closed',
          'The workshop you are attempting to join is closed.'
        );
      case SUBMISSION_STATUSES.FULL:
        return RenderBasicResponse(
          'Full',
          'The workshop you are attempting to join is full.'
        );
      case SUBMISSION_STATUSES.NOT_FOUND:
        return RenderBasicResponse(
          'Not found',
          'This workshop could not be found.'
        );
      case SUBMISSION_STATUSES.UNKNOWN_ERROR:
        return RenderBasicResponse(
          'Error submitting',
          `An unexpected error occurred: ${submissionErrorMessage}`
        );
      default:
        return RenderUnsubmitted();
    }
  };

  return (
    <div className={style.joinWorkshopPage}>
      <div className={style.joinWorkshopContent}>
        <AccountBanner
          heading="Join workshop"
          desc="You've already registered with our partner — now complete your enrollment for this workshop on Code.org."
          showLogo={true}
        />
        <div className={style.statusContentContainer}>
          {RenderStatusContent()}
        </div>
        <div className={style.bottomContainerGap} />
      </div>
    </div>
  );
};

export default WorkshopJoin;
