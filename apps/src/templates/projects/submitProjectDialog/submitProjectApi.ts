import {SubmissionStatusType} from '@cdo/apps/lab2/views/dialogs/types';
import HttpClient from '@cdo/apps/util/HttpClient';

interface SubmissionStatusResponse {
  status: SubmissionStatusType;
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
