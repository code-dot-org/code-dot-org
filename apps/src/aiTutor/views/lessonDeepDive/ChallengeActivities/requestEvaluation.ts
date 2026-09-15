import HttpClient from '@cdo/apps/util/HttpClient';

import {EvaluationStatus} from '../types';

/**
 * Kicks off asynchronous AI evaluation of a submitted challenge response.
 *
 * A failure here must not block the submission
 * flow. The server can re-request evaluation later, so a lost request
 * is recoverable.
 */
export const requestEvaluation = async (
  challengeResponseId: number
): Promise<string> => {
  try {
    const response = await HttpClient.post(
      `/challenge_responses/${challengeResponseId}/evaluate`,
      '',
      true // useAuthenticityToken
    );
    return (await response.ok)
      ? EvaluationStatus.PENDING
      : EvaluationStatus.ERROR;
  } catch (error) {
    console.error('Failed to request challenge response evaluation', error);
    return EvaluationStatus.ERROR;
  }
};
