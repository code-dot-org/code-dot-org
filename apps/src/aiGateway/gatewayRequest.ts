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
 * Issues the access token, solves Turnstile under its mode, and calls `send`.
 * A reusable access token the worker rejects is replaced and the request sent
 * once more: the worker rejects an access token before it calls the model, so
 * resending duplicates nothing.
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
    // Serialized, not parallel: the access token response carries the Turnstile mode
    // that decides whether a challenge is needed at all.
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
      // Only an access token that may have come from the cache is worth a second try.
      if (!reusable || attempt === MAX_ATTEMPTS) {
        throw error;
      }
    }
  }
}
