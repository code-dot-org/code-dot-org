import experiments from '@cdo/apps/util/experiments';

import type {GatewayErrorCategory} from '../logHelper';

import {TurnstileManager} from './manager';
import {isTurnstileChallengeError} from './types';

// Fetches a Turnstile token when the useTurnstile experiment is enabled,
// otherwise resolves null immediately with no side effects.
export function fetchTurnstileTokenIfEnabled(): Promise<string | null> {
  return experiments.isEnabledAllowingQueryString('useTurnstile')
    ? TurnstileManager.getInstance().getTurnstileToken()
    : Promise.resolve(null);
}

// Builds the X-Turnstile-Token header entry when a token is present.
// Returns an empty object when token is null so callers can spread unconditionally.
export function turnstileHeaders(token: string | null): Record<string, string> {
  return token ? {'X-Turnstile-Token': token} : {};
}

// instanceof cannot be used across webpack chunk boundaries — the dynamic
// import of getClientApi() produces a separate copy of the class object,
// so instanceof always returns false for errors thrown inside that chunk.
export function isTurnstileDevToolsError(error: Error): boolean {
  return error.name === 'TurnstileDevToolsError';
}

// Errors are sampled far below 1.0 — metrics and logs are authoritative.
export function turnstileErrorTags(
  error: unknown
): {'error.category': GatewayErrorCategory} | undefined {
  if (!isTurnstileChallengeError(error)) {
    return undefined;
  }
  return {
    'error.category':
      error.reason === 'timeout' ? 'turnstile_timeout' : 'turnstile_failed',
  };
}
