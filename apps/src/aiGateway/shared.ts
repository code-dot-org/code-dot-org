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
  };
  return {
    token: value.token,
    turnstileEnforcementMode: parseTurnstileEnforcementMode(
      value.turnstileEnforcementMode
    ),
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

interface CachedAccessToken extends GatewayAccessToken {
  expiresAtLocal: number;
}

// Relies on the worker accepting a token more than once before it expires; remove if it starts rejecting a reused token_id.
const cachedAccessTokens = new Map<string, CachedAccessToken>();
const pendingAccessTokens = new Map<string, Promise<GatewayAccessToken>>();

// 15 s for a long request, plus the 5 s by which Rails backdates issued_at_time.
export const ACCESS_TOKEN_REUSE_MARGIN_MS = 20_000;

// Every field is sent to Rails, so any of them may become a claim.
function accessTokenCacheKey(aichatContext: AichatContext): string {
  return JSON.stringify(aichatContext, Object.keys(aichatContext).sort());
}

function accessTokenLifetimeMs(token: string): number | undefined {
  try {
    const segment = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(
      atob(segment.padEnd(Math.ceil(segment.length / 4) * 4, '='))
    ) as {issued_at_time?: unknown; expiration_time?: unknown};
    const {issued_at_time: issuedAt, expiration_time: expiresAt} = payload;
    if (typeof issuedAt !== 'number' || typeof expiresAt !== 'number') {
      return undefined;
    }
    const lifetimeMs = (expiresAt - issuedAt) * 1000;
    return lifetimeMs > 0 ? lifetimeMs : undefined;
  } catch {
    return undefined;
  }
}

async function fetchAndCacheAccessToken(
  key: string,
  aichatContext: AichatContext
): Promise<GatewayAccessToken> {
  // Read before the request: the token is issued later, so its expiry is never overestimated.
  const requestedAt = Date.now();
  const accessToken = await fetchAccessToken(aichatContext);
  const lifetimeMs = accessTokenLifetimeMs(accessToken.token);
  if (lifetimeMs !== undefined) {
    cachedAccessTokens.set(key, {
      ...accessToken,
      expiresAtLocal: requestedAt + lifetimeMs,
    });
  }
  return accessToken;
}

// Concurrent callers with the same context share one request; failures are not cached.
export function getAccessToken(
  aichatContext: AichatContext = AichatContextManager.getContext()
): Promise<GatewayAccessToken> {
  const key = accessTokenCacheKey(aichatContext);
  const cached = cachedAccessTokens.get(key);
  if (cached) {
    if (Date.now() < cached.expiresAtLocal - ACCESS_TOKEN_REUSE_MARGIN_MS) {
      return Promise.resolve({
        token: cached.token,
        turnstileEnforcementMode: cached.turnstileEnforcementMode,
      });
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
  if (cachedAccessTokens.get(key)?.token === token) {
    cachedAccessTokens.delete(key);
  }
}

export function clearAccessTokenCache() {
  cachedAccessTokens.clear();
  pendingAccessTokens.clear();
}
