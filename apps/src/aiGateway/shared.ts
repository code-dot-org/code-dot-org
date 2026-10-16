import AichatContextManager from '../aichat/aichatContextManager';
import {AichatContext} from '../aichat/types';
import HttpClient, {isNetworkError} from '../util/HttpClient';

import {
  parseTurnstileEnforcementMode,
  type TurnstileEnforcementMode,
} from './turnstile/enforcementMode';

export const AI_GATEWAY_URL = `https://ai-gateway.code.org`;

export interface GatewayAccessToken {
  /** Signed RS256 JWT, valid for one minute, sent with the gateway request. */
  token: string;
  /**
   * Whether this request must carry a Turnstile token. Resolved server-side and
   * also embedded as a claim in `token`, so the browser's decision and the
   * worker's enforcement always come from the same value.
   */
  turnstileEnforcementMode: TurnstileEnforcementMode;
}

// Use the provided AichatContext or fall back to the default context.
export async function fetchAccessToken(
  aichatContext: AichatContext = AichatContextManager.getContext()
): Promise<GatewayAccessToken> {
  try {
    const response = await HttpClient.post(
      '/ai_gateway/access_token',
      JSON.stringify({aichatContext}),
      true,
      {
        'Content-Type': 'application/json; charset=UTF-8',
      }
    );
    // turnstileEnforcementMode is deliberately typed as unknown rather than asserted: it is
    // absent from servers predating the flag, and parseTurnstileEnforcementMode is what
    // turns anything unexpected into a safe default.
    const value = (await response.json()) as {
      token: string;
      turnstileEnforcementMode?: unknown;
    };
    return {
      token: value.token,
      turnstileEnforcementMode: parseTurnstileEnforcementMode(
        value.turnstileEnforcementMode
      ),
    };
  } catch (error) {
    // Surface the server's specific reason (e.g. a denied safety-checks
    // bypass request) instead of a generic "403 Forbidden". Clone before
    // reading: reportGatewayError() further up the call chain also reads
    // this same response body, and a body can only be consumed once
    // without cloning first.
    if (isNetworkError(error)) {
      const body = await error.response
        .clone()
        .json()
        .catch(() => null);
      if (body?.message) {
        error.message = body.message;
      }
    }
    throw error;
  }
}

export function getModelString(model: unknown) {
  let modelString: string;

  if (typeof model === 'string') {
    modelString = model;
  } else {
    const safeModel = model as unknown as Record<string, unknown>;
    if (
      safeModel !== null &&
      typeof safeModel === 'object' &&
      typeof safeModel.modelId === 'string'
    ) {
      modelString = safeModel.modelId;
    } else {
      throw new Error('Invalid model provided to Gateway.');
    }
  }
  return modelString;
}
