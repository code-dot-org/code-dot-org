import {AiGatewayAccessTokenLifetimeSeconds} from '@cdo/generated-scripts/sharedConstants';

import AichatContextManager from '../aichat/aichatContextManager';
import {AichatContext} from '../aichat/types';
import HttpClient from '../util/HttpClient';

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
  /** Whether the server allows this token to be reused for later requests. */
  reusable: boolean;
  /** How many seconds before expiry reuse stops. Meaningful only when `reusable`. */
  reuseMarginSeconds: number;
}

// Use the provided AichatContext or fall back to the default context.
export async function fetchAccessToken(
  aichatContext: AichatContext = AichatContextManager.getContext()
): Promise<GatewayAccessToken> {
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
    reusable?: unknown;
    reuseMarginSeconds?: unknown;
  };
  const reuseMarginSeconds =
    typeof value.reuseMarginSeconds === 'number' &&
    value.reuseMarginSeconds >= 0
      ? value.reuseMarginSeconds
      : undefined;
  return {
    token: value.token,
    turnstileEnforcementMode: parseTurnstileEnforcementMode(
      value.turnstileEnforcementMode
    ),
    reusable: value.reusable === true && reuseMarginSeconds !== undefined,
    reuseMarginSeconds: reuseMarginSeconds ?? 0,
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

interface CachedAccessToken {
  accessToken: GatewayAccessToken;
  reusableUntilLocal: number;
}

// Relies on the worker accepting a token more than once before it expires; remove if it starts rejecting a reused token_id.
const cachedAccessTokens = new Map<string, CachedAccessToken>();
const pendingAccessTokens = new Map<string, Promise<GatewayAccessToken>>();

// Every field is sent to Rails, so any of them may become a claim.
function accessTokenCacheKey(aichatContext: AichatContext): string {
  return JSON.stringify(aichatContext, Object.keys(aichatContext).sort());
}

async function fetchAndCacheAccessToken(
  key: string,
  aichatContext: AichatContext
): Promise<GatewayAccessToken> {
  // Read before the request: the token is issued later, so its expiry is never overestimated.
  const requestedAt = Date.now();
  const accessToken = await fetchAccessToken(aichatContext);
  if (accessToken.reusable) {
    cachedAccessTokens.set(key, {
      accessToken,
      reusableUntilLocal:
        requestedAt +
        (AiGatewayAccessTokenLifetimeSeconds - accessToken.reuseMarginSeconds) *
          1000,
    });
  }
  return accessToken;
}

// Concurrent callers with the same context share one request; failures are not cached.
// The worker checks expiry once, when a request arrives, so the margin covers only the
// time from here to there; callers re-check after anything slow, like a Turnstile challenge.
export function getAccessToken(
  aichatContext: AichatContext = AichatContextManager.getContext()
): Promise<GatewayAccessToken> {
  const key = accessTokenCacheKey(aichatContext);
  const cached = cachedAccessTokens.get(key);
  if (cached) {
    if (Date.now() < cached.reusableUntilLocal) {
      return Promise.resolve(cached.accessToken);
    }
    cachedAccessTokens.delete(key);
  }

  const pending = pendingAccessTokens.get(key);
  if (pending) {
    return pending;
  }
  const fetching = fetchAndCacheAccessToken(key, aichatContext).finally(() => {
    if (pendingAccessTokens.get(key) === fetching) {
      pendingAccessTokens.delete(key);
    }
  });
  pendingAccessTokens.set(key, fetching);
  return fetching;
}

// Matches on the token so a rejection of an old token cannot evict a newer one.
export function invalidateAccessToken(
  aichatContext: AichatContext,
  token: string
) {
  const key = accessTokenCacheKey(aichatContext);
  if (cachedAccessTokens.get(key)?.accessToken.token === token) {
    cachedAccessTokens.delete(key);
  }
}

export function clearAccessTokenCache() {
  cachedAccessTokens.clear();
  pendingAccessTokens.clear();
}
