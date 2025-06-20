import {useState} from 'react';

import {WorkshopEnrollmentParams} from '@cdo/apps/code-studio/pd/workshops/types';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

export type WorkshopEnrollmentResponse = {
  workshop_enrollment_status: string;
  error_message?: string;
  cancel_url?: string;
};

/**
 * Handles API calls for workshop enrollment
 **/
export function useWorkshopEnrollmentApi(workshopId: number) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitEnrollment = async (
    params: WorkshopEnrollmentParams | null
  ): Promise<WorkshopEnrollmentResponse | null> => {
    if (!isSubmitting) {
      setIsSubmitting(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/v1/pd/workshops/${workshopId}/enrollments`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': await getAuthenticityToken(),
            },
            body: JSON.stringify(params),
          }
        );

        const result = await response.json();
        setIsSubmitting(false);

        return result;
      } catch (e) {
        setIsSubmitting(false);
        setError(
          'An unknown error occurred while processing your enrollment. Please try again later.'
        );
        return null;
      }
    }

    return null;
  };

  return {submitEnrollment, isSubmitting, error};
}
