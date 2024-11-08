import HttpClient from '@cdo/apps/util/HttpClient';
import {ProjectSubmissionStatus} from '@cdo/generated-scripts/sharedConstants';

import {ValueOf} from '../../../types/utils';

interface SubmissionStatusResponse {
  status: SubmissionStatusType;
}

export type SubmissionStatusType = ValueOf<typeof ProjectSubmissionStatus>;
/**
 * Sends a post request to submit the project to be considered for the featured project gallery.
 */
export async function submitProject(
  channelId: string,
  projectType: string,
  submissionDescription: string
) {
  const payload = {
    submissionDescription,
  };
  const response = await HttpClient.post(
    `/projects/${projectType}/${channelId}/submit`,
    JSON.stringify(payload),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );
  return response.status;
}

/**
 * Sends a get request to submit the project.
 */
export async function getSubmissionStatus(
  channelId: string,
  projectType: string
): Promise<SubmissionStatusType> {
  const response = await HttpClient.fetchJson<SubmissionStatusResponse>(
    `/projects/${projectType}/${channelId}/submission_status`
  );
  return response.value.status;
}
