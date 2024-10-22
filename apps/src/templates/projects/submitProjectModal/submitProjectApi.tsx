import HttpClient from '@cdo/apps/util/HttpClient';

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
