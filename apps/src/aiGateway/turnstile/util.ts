import type {GatewayErrorCategory} from '../logHelper';

import {type TurnstileEnforcementMode} from './enforcementMode';
import {TurnstileManager} from './manager';
import {isTurnstileChallengeError} from './types';

/**
 * Obtains a Turnstile token for a request whose access token carried `enforcementMode`.
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
  enforcementMode: TurnstileEnforcementMode
): Promise<string | null> {
  switch (enforcementMode) {
    case 'disabled':
      return null;
    case 'enforce':
      return TurnstileManager.getInstance().getTurnstileToken(enforcementMode);
    case 'monitor':
      try {
        return await TurnstileManager.getInstance().getTurnstileToken(
          enforcementMode
        );
      } catch {
        // Swallowed on purpose. recordTurnstileOutcome has already emitted the
        // metric and the log for this failure, so the only thing dropped here
        // is the rejection itself -- which is the point of monitor.
        return null;
      }
    default: {
      // Adding a mode without deciding its failure behavior is a compile error
      // rather than a silent fall-through to "send nothing".
      const unreachable: never = enforcementMode;
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

/**
 * A user-facing message for a Turnstile failure, or undefined if the error is
 * not one.
 *
 * Only `enforce` ever reaches a user: `monitor` and `disabled` swallow
 * challenge failures before they leave fetchTurnstileToken. So this is the
 * enforce-mode vocabulary, and callers fall through to their own handling for
 * everything else.
 *
 * The strings are grouped by what the reader can actually do about it, not by
 * failure reason -- a student cannot act differently on `render_threw` than on
 * `challenge_failed`. They live here rather than at the call sites so the copy
 * can be revised, or localized, in one place.
 */
export function turnstileUserMessage(error: unknown): string | undefined {
  if (!isTurnstileChallengeError(error)) {
    return undefined;
  }

  switch (error.reason) {
    // The widget never loaded or never answered. In schools this is usually a
    // content filter or an extension blocking challenges.cloudflare.com --
    // worth naming, because it is the one cause someone can escalate and have
    // fixed rather than just retry against.
    case 'script_load_failed':
    case 'timeout':
      return (
        "A security check couldn't load. Your network or school may be " +
        'blocking it, or a browser extension may be interfering. Check your ' +
        'connection and reload the page.'
      );

    case 'unsupported':
      return (
        "This feature isn't available in your browser. Try Chrome, Firefox, " +
        'Safari, or Edge.'
      );

    case 'challenge_failed':
    case 'render_threw':
    case 'render_failed':
    case 'remove_failed':
    case 'unknown':
      return (
        "We couldn't complete a security check. Please reload the page and " +
        'try again.'
      );

    default: {
      // A new reason must be given a message deliberately rather than
      // defaulting to silence.
      const unreachable: never = error.reason;
      return unreachable;
    }
  }
}
