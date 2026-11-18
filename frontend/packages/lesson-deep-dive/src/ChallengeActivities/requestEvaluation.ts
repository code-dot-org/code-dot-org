import type {Transport} from '@code-dot-org/core/api';

import {EvaluationStatus} from '../types';

/**
 * POST /challenge_responses/:id/evaluate
 *
 * Kicks off asynchronous AI evaluation of a submitted challenge response.
 *
 * A failure here must not block the submission
 * flow. The server can re-request evaluation later, so a lost request
 * is recoverable.
 */
export const requestEvaluation = async (
  transport: Transport,
  challengeResponseId: number,
): Promise<string> => {
  try {
    await transport.request<unknown>({
      method: 'POST',
      url: `/challenge_responses/${challengeResponseId}/evaluate`,
    });
    return EvaluationStatus.PENDING;
  } catch (error) {
    console.error('Failed to request challenge response evaluation', error);
    return EvaluationStatus.ERROR;
  }
};
