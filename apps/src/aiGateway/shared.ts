import AichatContextManager from '../aichat/aichatContextManager';
import HttpClient from '../util/HttpClient';

import {parseTurnstileMode, type TurnstileMode} from './turnstile/mode';

export const AI_GATEWAY_URL = `https://ai-gateway.code.org`;

export interface GatewayAccessToken {
  /** Signed RS256 JWT, valid for one minute, sent with the gateway request. */
  token: string;
  /**
   * Whether this request must carry a Turnstile token. Resolved server-side and
   * also embedded as a claim in `token`, so the browser's decision and the
   * worker's enforcement always come from the same value.
   */
  turnstileMode: TurnstileMode;
}

export async function fetchAccessToken(): Promise<GatewayAccessToken> {
  const response = await HttpClient.post(
    '/ai_gateway/access_token',
    JSON.stringify({
      aichatContext: AichatContextManager.getContext(),
    }),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );
  // turnstileMode is deliberately typed as unknown rather than asserted: it is
  // absent from servers predating the flag, and parseTurnstileMode is what
  // turns anything unexpected into a safe default.
  const value = (await response.json()) as {
    token: string;
    turnstileMode?: unknown;
  };
  return {
    token: value.token,
    turnstileMode: parseTurnstileMode(value.turnstileMode),
  };
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
