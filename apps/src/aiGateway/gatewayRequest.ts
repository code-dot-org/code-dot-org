import {AichatContext} from '../aichat/types';

import {
  isTokenRejection,
  recordGatewayRequestError,
  recordGatewayRequestOk,
  recordTokenNotIssued,
} from './requestMetric';
import {getAccessToken, invalidateAccessToken} from './shared';
import {fetchTurnstileToken} from './turnstile';

const MAX_ATTEMPTS = 2;

/**
 * Issues the access token, solves Turnstile under its mode, and calls `send`.
 * A reusable token the worker rejects is replaced and the request sent once
 * more: the worker rejects a token before it calls the model, so resending
 * duplicates nothing.
 */
export async function sendGatewayRequest(
  aichatContext: AichatContext,
  send: (token: string, turnstileToken: string | null) => Promise<Response>
): Promise<Response> {
  const issueToken = () =>
    getAccessToken(aichatContext).catch((error: unknown) => {
      recordTokenNotIssued();
      throw error;
    });

  for (let attempt = 1; ; attempt++) {
    // Serialized, not parallel: the token response carries the Turnstile mode
    // that decides whether a challenge is needed at all.
    const issued = await issueToken();
    const turnstileToken = await fetchTurnstileToken(
      issued.turnstileEnforcementMode
    );
    // A challenge can outlast the reuse window, so a reusable token is re-checked after it.
    const {token, signingKey, reusable} = issued.reusable
      ? await issueToken()
      : issued;
    try {
      const response = await send(token, turnstileToken);
      recordGatewayRequestOk(signingKey);
      return response;
    } catch (error) {
      await recordGatewayRequestError(signingKey, error);
      if (!(await isTokenRejection(error))) {
        throw error;
      }
      invalidateAccessToken(aichatContext, token);
      // Only a token that may have come from the cache is worth a second try.
      if (!reusable || attempt === MAX_ATTEMPTS) {
        throw error;
      }
    }
  }
}
