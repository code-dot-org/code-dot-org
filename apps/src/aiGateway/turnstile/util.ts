import type {GatewayErrorCategory} from '../logHelper';

import {isTurnstileChallengeError} from './types';

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
    case 'devtools_breakpoints':
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
