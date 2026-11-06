import {AiGatewayAccessTokenLifetimeSeconds} from '@cdo/generated-scripts/sharedConstants';

import AichatContextManager from '../aichat/aichatContextManager';
import {AichatContext} from '../aichat/types';
import HttpClient from '../util/HttpClient';

import {parseSigningKey, type SigningKey} from './requestMetric';
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
  /** Whether the server allows this access token to be reused for later requests. */
  reusable: boolean;
  /** The key Rails signed `token` with, chosen by a DCDO flag during the initial rollout. */
  signingKey: SigningKey | undefined;
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
  const value = (await response.json()) as {
    token?: unknown;
    turnstileEnforcementMode?: unknown;
    reusable?: unknown;
    signingKey?: unknown;
  };
  if (typeof value.token !== 'string') {
    throw new Error('AI Gateway token response has no token');
  }
  return {
    token: value.token,
    turnstileEnforcementMode: parseTurnstileEnforcementMode(
      value.turnstileEnforcementMode
    ),
    reusable: value.reusable === true,
    signingKey: parseSigningKey(value.signingKey),
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

// Relies on the worker accepting an access token more than once before it expires
const cachedAccessTokens = new Map<string, CachedAccessToken>();
const pendingAccessTokens = new Map<string, Promise<GatewayAccessToken>>();
// Once Rails refuses reuse, concurrent callers stop sharing a fetch too, so each
// gateway request carries its own access token exactly as before the cache existed.
let reuseRefusedByServer = false;

// The worker checks expiry once, when a request arrives, so this covers only the time
// from cache to worker; callers re-check after anything slow, like a Turnstile challenge.
export const ACCESS_TOKEN_REUSE_MARGIN_MS = 15_000;

function accessTokenCacheKey(aichatContext: AichatContext): string {
  return JSON.stringify(aichatContext, Object.keys(aichatContext).sort());
}

async function fetchAndCacheAccessToken(
  key: string,
  aichatContext: AichatContext
): Promise<GatewayAccessToken> {
  const requestedAt = Date.now();
  const accessToken = await fetchAccessToken(aichatContext);
  reuseRefusedByServer = !accessToken.reusable;
  if (accessToken.reusable) {
    cachedAccessTokens.set(key, {
      accessToken,
      reusableUntilLocal:
        requestedAt +
        AiGatewayAccessTokenLifetimeSeconds * 1000 -
        ACCESS_TOKEN_REUSE_MARGIN_MS,
    });
  }
  return accessToken;
}

// Concurrent callers with the same context share one request unless tokens become single-use again;
// failures are not cached.
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

  if (reuseRefusedByServer) {
    return fetchAndCacheAccessToken(key, aichatContext);
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

// Matches on the access token so a rejection of an old one cannot evict a newer one.
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
  reuseRefusedByServer = false;
}
