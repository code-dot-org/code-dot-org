import HttpClient from '@cdo/apps/util/HttpClient';

import {SubmissionStatusResponse} from './types';
/**
 * Sends a post request to submit the project.
 */
export async function submitProject(submissionDescription: string) {
  // Don't enforce restrictions here on which project types young students can
  // publish. Instead, restrict when to show the publish button in the UI, and
  // enforce age restrictions on the "publish" REST endpoint.
  // if (!AllPublishableProjectTypes.includes(projectType)) {
  //   return Promise.reject(`Cannot publish project of type ${projectType}.`);
  // }
  const payload = {
    submissionDescription,
  };
  const response = await HttpClient.post(
    `submit`,
    JSON.stringify(payload),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );
  console.log('response', response);
}

/**
 * Sends a get request to submit the project.
 */
export async function getSubmissionStatus(): Promise<SubmissionStatusResponse> {
  const response = await HttpClient.fetchJson(`submission_status`);
  console.log('response', response);
  return response.value as SubmissionStatusResponse;
}
