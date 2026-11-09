import {AichatContext} from '../aichat/types';

import {
  isAccessTokenRejection,
  recordGatewayRequestError,
  recordGatewayRequestOk,
  recordTokenNotIssued,
} from './requestMetric';
import {getAccessToken, invalidateAccessToken} from './shared';
import {fetchTurnstileToken} from './turnstile';

const MAX_ATTEMPTS = 2;

/**
 * Issues the access token, solves Turnstile, and calls `send`.
 * Does one retry with a fresh access token if a reusable access token gets rejected.
 */
export async function sendGatewayRequest(
  aichatContext: AichatContext,
  send: (
    accessToken: string,
    turnstileToken: string | null
  ) => Promise<Response>
): Promise<Response> {
  const issueAccessToken = () =>
    getAccessToken(aichatContext).catch((error: unknown) => {
      recordTokenNotIssued();
      throw error;
    });

  for (let attempt = 1; ; attempt++) {
    const issued = await issueAccessToken();
    const turnstileToken = await fetchTurnstileToken(
      issued.turnstileEnforcementMode
    );
    // A challenge can outlast the reuse window, so a reusable access token is re-checked after it.
    const {
      token: accessToken,
      signingKey,
      reusable,
    } = issued.reusable ? await issueAccessToken() : issued;
    try {
      const response = await send(accessToken, turnstileToken);
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
}
