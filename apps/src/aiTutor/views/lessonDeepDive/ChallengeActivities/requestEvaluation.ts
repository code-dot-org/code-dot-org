import HttpClient from '@cdo/apps/util/HttpClient';

/**
 * Kicks off asynchronous AI evaluation of a submitted challenge response.
 *
 * Fire-and-forget: the evaluation is stored server-side for later teacher
 * review, and the student sees nothing of it, so a failure here must not
 * block the submission flow. The server can also re-request evaluation
 * later, so a lost request is recoverable.
 */
export const requestEvaluation = async (
  challengeResponseId: number
): Promise<void> => {
  try {
    await HttpClient.post(
      `/challenge_responses/${challengeResponseId}/evaluate`,
      '',
      true // useAuthenticityToken
    );
  } catch (error) {
    console.error('Failed to request challenge response evaluation', error);
  }
};
