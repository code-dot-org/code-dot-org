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
export async function getSubmissionStatus(): Promise<
  SubmissionStatusResponse | undefined
> {
  try {
    const response = await HttpClient.fetchJson(`submission_status`);
    return response.value as SubmissionStatusResponse;
  } catch (error) {
    // A signed out user does not have access to `submission_status`.
    return undefined;
  }
}
