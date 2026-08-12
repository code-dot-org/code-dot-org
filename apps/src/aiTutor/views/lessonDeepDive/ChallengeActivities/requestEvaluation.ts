import HttpClient from '@cdo/apps/util/HttpClient';

/**
 * Kicks off asynchronous AI evaluation of a submitted challenge response.
 *
 * Fire-and-forget: the result is stored server-side — rubric scores for
 * teacher review, constructive feedback for the student's gallery (future
 * work) — and nothing displays at submit time, so a failure here must not
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
