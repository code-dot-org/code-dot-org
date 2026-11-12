import {AichatContext} from '../aichat/types';

import {createCallDeadline} from './callDeadline';
import {type ChallengeToken, fetchChallengeToken} from './challengeToken';
import {
  isAccessTokenRejection,
  recordGatewayRequestError,
  recordGatewayRequestOk,
  recordTokenNotIssued,
} from './requestMetric';
import {getAccessToken, invalidateAccessToken} from './shared';

const MAX_ATTEMPTS = 2;

export interface GatewayRequestOptions {
  /** The AI SDK's `timeout`: the whole call, challenge included, by default. */
  timeoutMs?: number;
  abortSignal?: AbortSignal;
  /**
   * Starts the timer once the challenge token is in hand, so a slow challenge
   * does not use up the time meant for the request.
   */
  excludeChallengeFromTimeout?: boolean;
}

/**
 * Issues the access token, solves the challenge, and calls `send`.
 * Does one retry with a fresh access token if a reusable access token gets rejected.
 */
export async function sendGatewayRequest(
  aichatContext: AichatContext,
  send: (
    accessToken: string,
    challengeToken: ChallengeToken | null,
    signal: AbortSignal
  ) => Promise<Response>,
  {
    timeoutMs,
    abortSignal,
    excludeChallengeFromTimeout = false,
  }: GatewayRequestOptions = {}
): Promise<Response> {
  const deadline = createCallDeadline(timeoutMs, abortSignal);
  const issueAccessToken = () =>
    deadline.race(
      getAccessToken(aichatContext).catch((error: unknown) => {
        recordTokenNotIssued();
        throw error;
      })
    );

  if (!excludeChallengeFromTimeout) {
    deadline.restartTimer();
  }
  try {
    for (let attempt = 1; ; attempt++) {
      const issued = await issueAccessToken();
      if (excludeChallengeFromTimeout) {
        deadline.stopTimer();
      }
      const challengeToken = await deadline.race(
        fetchChallengeToken(issued.turnstileEnforcementMode)
      );
      if (excludeChallengeFromTimeout) {
        deadline.restartTimer();
      }
      // A challenge can outlast the reuse window, so a reusable access token is re-checked after it.
      const {
        token: accessToken,
        signingKey,
        reusable,
      } = issued.reusable ? await issueAccessToken() : issued;
      try {
        const response = await deadline.race(
          send(accessToken, challengeToken, deadline.signal)
        );
        recordGatewayRequestOk(signingKey);
        return response;
      } catch (error) {
        await recordGatewayRequestError(signingKey, error);
        if (!(await isAccessTokenRejection(error))) {
          throw error;
        }
        invalidateAccessToken(aichatContext, accessToken);
        // The retry is just for reusable tokens since they risk being stale.
        if (!reusable || attempt === MAX_ATTEMPTS) {
          throw error;
        }
      }
    }
  } finally {
    deadline.dispose();
  }
}
