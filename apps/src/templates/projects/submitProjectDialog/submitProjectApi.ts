import HttpClient from '@cdo/apps/util/HttpClient';
import {ProjectSubmissionStatus} from '@cdo/generated-scripts/sharedConstants';

import {ValueOf} from '../../../types/utils';

interface SubmissionStatusResponse {
  status: SubmissionStatusType;
}

export type SubmissionStatusType = ValueOf<typeof ProjectSubmissionStatus>;
/**
 * TODO: Sends a post request to submit the project.
 */
export async function submitProject(submissionDescription: string) {
  console.log('submitProject', submissionDescription);
}

/**
 * Sends a get request to submit the project.
 */
export async function getSubmissionStatus(): Promise<
  SubmissionStatusResponse | undefined
> {
  try {
    const response = await HttpClient.fetchJson<SubmissionStatusResponse>(
      `submission_status`
    );
    return response.value;
  } catch (error) {
    // A signed out user does not have access to `submission_status`.
    return undefined;
  }
}
