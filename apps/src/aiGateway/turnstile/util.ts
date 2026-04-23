import experiments from '@cdo/apps/util/experiments';

import {TurnstileManager} from './manager';

// Fetches a Turnstile token when the useTurnstile experiment is enabled,
// otherwise resolves null immediately with no side effects.
export function fetchTurnstileTokenIfEnabled(): Promise<string | null> {
  return experiments.isEnabledAllowingQueryString('useTurnstile')
    ? TurnstileManager.getInstance().getTurnstileToken()
    : Promise.resolve(null);
}

// Builds the X-Turnstile-Token header entry when a token is present.
// Returns an empty object when token is null so callers can spread unconditionally.
export function turnstileHeaders(
  token: string | null
): Record<string, string> {
  return token ? {'X-Turnstile-Token': token} : {};
}
