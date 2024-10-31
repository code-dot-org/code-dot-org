import HttpClient from '@cdo/apps/util/HttpClient';
import {ProjectSubmissionStatus} from '@cdo/generated-scripts/sharedConstants';

import {ValueOf} from '../../../types/utils';
interface SubmissionStatusResponse {
  status: ValueOf<typeof ProjectSubmissionStatus>;
}

/**
 * TODO: Sends a post request to submit the project.
 */
export async function submitProject(submissionDescription: string) {
  console.log('submitProject', submissionDescription);
}

/**
 * Sends a get request to submit the project.
 */
export async function getSubmissionStatus(): Promise<SubmissionStatusResponse> {
  const response = await HttpClient.fetchJson(`submission_status`);
  console.log('response.value', response.value);
  return response.value as SubmissionStatusResponse;
}
