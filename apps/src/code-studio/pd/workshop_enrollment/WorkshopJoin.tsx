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
import {
  WorkshopInfo,
  UserInfoForWorkshop,
} from '@cdo/apps/code-studio/pd/workshops/types';
import AccountBanner from '@cdo/apps/templates/account/AccountBanner';
import {navigateToHref} from '@cdo/apps/utils';

import {SUBMISSION_STATUSES} from './constants';

import style from './workshop_join.module.scss';

type WorkshopJoinProps = {
  workshopInfo: Pick<
    WorkshopInfo,
    | 'id'
    | 'course'
    | 'subject'
    | 'name'
    | 'format'
    | 'regionalPartnerName'
    | 'sessions'
  >;
  userInfo: UserInfoForWorkshop['userInfo'];
  workshopEnrollmentStatus: string;
};

const WorkshopJoin: React.FunctionComponent<WorkshopJoinProps> = ({
  workshopInfo,
  userInfo,
  workshopEnrollmentStatus,
}) => {
  const [enrollmentStatus, setEnrollmentStatus] = useState(
    workshopEnrollmentStatus
  );
  const [submissionErrorMessage, setSubmissionErrorMessage] = useState('');
  const {submitEnrollment, isSubmitting, error} = useWorkshopEnrollmentApi(
    workshopInfo?.id
  );

  const handleSubmitEnrollment = async () => {
    const result = await submitEnrollment(userInfo?.id);

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
    sessionStorage.setItem('workshopId', `${workshopInfo.id}`);
    sessionStorage.setItem('workshopCourse', workshopInfo.course);
    sessionStorage.setItem('workshopSubject', workshopInfo.subject || '');
    sessionStorage.setItem('workshopName', workshopInfo.name || '');
    sessionStorage.setItem('workshopFormat', workshopInfo.format);
    sessionStorage.setItem('rpName', workshopInfo.regionalPartnerName || '');
    sessionStorage.setItem(
      'sessionTimeInfo',
      workshopInfo.sessions ? JSON.stringify(workshopInfo.sessions) : ''
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
            id="joinWorkshop"
            name="joinWorkshop"
            text="Join this workshop"
            color="purple"
            className={style.joinWorkshopButton}
            onClick={handleSubmitEnrollment}
            isPending={isSubmitting}
            disabled={isMissingUserInfo(userInfo) || !!error}
          />
        </div>
        {userInfo && (
          <UserPassport
            displayName={userInfo.displayName}
            givenName={userInfo.givenName}
            familyName={userInfo.familyName}
            email={userInfo.email}
            educatorRole={userInfo.educatorRole}
            schoolName={userInfo.schoolInfo?.schoolName}
            schoolType={userInfo.schoolInfo?.schoolType}
            returnToHref={`/pd/workshops/${workshopInfo.id}/join`}
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
