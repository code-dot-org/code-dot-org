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
export async function getSubmissionStatus(
  channelId: string,
  projectType: string
): Promise<SubmissionStatusResponse | undefined> {
  try {
    const response = await HttpClient.fetchJson<SubmissionStatusResponse>(
      `/projects/${projectType}/${channelId}/submission_status`
    );
    return response.value;
  } catch (error) {
    // TODO: handle signed out user case separately from other unhandled errors.
    return undefined;
  }
}
