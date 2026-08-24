import type {GatewayErrorCategory} from '../logHelper';

import {TurnstileManager} from './manager';
import {type TurnstileMode} from './mode';
import {isTurnstileChallengeError} from './types';

/**
 * Obtains a Turnstile token for a request whose access token carried `mode`.
 *
 * Failure handling differs by mode, and that difference matters: in `monitor`
 * the worker tolerates a missing token, so rejecting the user's request on a
 * failed challenge would inflict the very breakage `monitor` exists to measure.
 * In `enforce` the worker rejects a tokenless request anyway, so failing here
 * surfaces a useful error (including the DevTools case) instead of a bare 401.
 *
 * In `disabled` the manager is never instantiated -- its constructor appends a
 * container to document.body -- so a page that never enforces pays nothing.
 */
export async function fetchTurnstileToken(
  mode: TurnstileMode
): Promise<string | null> {
  switch (mode) {
    case 'disabled':
      return null;
    case 'enforce':
      return TurnstileManager.getInstance().getTurnstileToken(mode);
    case 'monitor':
      try {
        return await TurnstileManager.getInstance().getTurnstileToken(mode);
      } catch {
        // Swallowed on purpose. recordTurnstileOutcome has already emitted the
        // metric and the log for this failure, so the only thing dropped here
        // is the rejection itself -- which is the point of monitor.
        return null;
      }
    default: {
      // Adding a mode without deciding its failure behavior is a compile error
      // rather than a silent fall-through to "send nothing".
      const unreachable: never = mode;
      return unreachable;
    }
  }
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
