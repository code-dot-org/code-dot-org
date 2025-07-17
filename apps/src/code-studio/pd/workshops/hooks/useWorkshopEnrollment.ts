import {LinkProps} from '@code-dot-org/component-library/link';
import {useState} from 'react';

import {SUBMISSION_STATUSES} from '@cdo/apps/code-studio/pd/workshop_enrollment/constants';
import {WorkshopInfo} from '@cdo/apps/code-studio/pd/workshops/types';
import {navigateToHref} from '@cdo/apps/utils';

import {useWorkshopEnrollmentApi} from './useWorkshopEnrollmentApi';

type WorkshopEnrollmentHandlerProps = Pick<
  WorkshopInfo,
  'regionalPartnerName' | 'format' | 'course' | 'name' | 'subject' | 'sessions'
> & {
  workshopId: number;
  userId?: number;
};

/**
 * Handles the enrollment logic for a workshop, differentiating between various submission statuses
 * */
export function useWorkshopEnrollment({
  workshopId,
  userId,
  regionalPartnerName,
  course,
  format,
  name,
  subject,
  sessions,
}: WorkshopEnrollmentHandlerProps) {
  const {submitEnrollment, isSubmitting, error} =
    useWorkshopEnrollmentApi(workshopId);
  const [alertState, setAlertState] = useState<{
    show: boolean;
    text: string;
    link?: LinkProps;
  }>({show: false, text: ''});

  const handleClick = async () => {
    const result = await submitEnrollment(userId);

    switch (result?.workshop_enrollment_status) {
      case SUBMISSION_STATUSES.DUPLICATE:
        setAlertState({
          show: true,
          text: 'You are already registered, and should have received a confirmation email.',
          link: {text: 'Cancel enrollment', href: result?.cancel_url},
        });
        break;
      case SUBMISSION_STATUSES.OWN:
        setAlertState({
          show: true,
          text: 'You are attempting to join your own workshop.',
        });
        break;
      case SUBMISSION_STATUSES.CLOSED:
        setAlertState({
          show: true,
          text: 'Sorry, this workshop is closed. For more information, please contact the organizer.',
        });
        break;
      case SUBMISSION_STATUSES.FULL:
        setAlertState({
          show: true,
          text: 'Sorry, this workshop is full. For more information, please contact the organizer.',
        });
        break;
      case SUBMISSION_STATUSES.NOT_FOUND:
        setAlertState({
          show: true,
          text: 'Sorry, we could not find this workshop. Please check the link and try again.',
        });
        break;
      case SUBMISSION_STATUSES.SUCCESS:
        sessionStorage.setItem('rpName', regionalPartnerName || '');
        sessionStorage.setItem('workshopId', `${workshopId}`);
        sessionStorage.setItem('workshopCourse', course);
        sessionStorage.setItem('workshopSubject', subject || '');
        sessionStorage.setItem('workshopName', name || '');
        sessionStorage.setItem('workshopFormat', format);
        sessionStorage.setItem('sessionTimeInfo', JSON.stringify(sessions));
        navigateToHref('/my-professional-learning');
        break;
      case SUBMISSION_STATUSES.UNKNOWN_ERROR:
      default:
        setAlertState({
          show: true,
          text:
            result?.error_message ||
            error ||
            'An unknown error occurred while processing your enrollment. Please try again later.',
        });
    }
  };

  return {handleClick, isSubmitting, alertState, setAlertState};
}
