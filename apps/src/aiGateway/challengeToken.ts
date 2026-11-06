import DCDO from '@cdo/apps/dcdo';

import {getRecaptchaToken} from './recaptcha';
import {type TurnstileEnforcementMode} from './turnstile/enforcementMode';
import {TurnstileManager} from './turnstile/manager';
import {isTurnstileChallengeError} from './turnstile/types';

// Off by default: until the gateway worker allows and verifies
// X-Recaptcha-Token, sending it fails the request's CORS preflight.
const RECAPTCHA_FALLBACK_DCDO_KEY = 'ai-gateway-recaptcha-fallback-enabled';

export type ChallengeProvider = 'turnstile' | 'recaptcha';

export interface ChallengeToken {
  provider: ChallengeProvider;
  token: string;
}

const HEADERS: Record<ChallengeProvider, string> = {
  turnstile: 'X-Turnstile-Token',
  recaptcha: 'X-Recaptcha-Token',
};

// Only a script that never loaded falls back. A Cloudflare verdict does not:
// asking Google for a second opinion would only weaken the check.
const shouldFallBackToRecaptcha = (error: unknown): boolean =>
  DCDO.get(RECAPTCHA_FALLBACK_DCDO_KEY, false) === true &&
  isTurnstileChallengeError(error) &&
  error.reason === 'script_load_failed';

/**
 * Obtains a challenge token for a request whose access token carried
 * `enforcementMode`: Turnstile, or reCAPTCHA v3 when the Turnstile script
 * could not load.
 *
 * In `monitor` any failure resolves null, since the worker tolerates a missing
 * token and rejecting the request would inflict the breakage `monitor` exists
 * to measure. In `enforce` a failure rejects with the Turnstile error, even
 * when the fallback also failed, because that is the cause a school can fix.
 *
 * In `disabled` the manager is never instantiated -- its constructor appends a
 * container to document.body -- so a page that never enforces pays nothing.
 */
export async function fetchChallengeToken(
  enforcementMode: TurnstileEnforcementMode
): Promise<ChallengeToken | null> {
  if (enforcementMode === 'disabled') {
    return null;
  }

  try {
    const token = await TurnstileManager.getInstance().getTurnstileToken(
      enforcementMode
    );
    return {provider: 'turnstile', token};
  } catch (turnstileError) {
    if (shouldFallBackToRecaptcha(turnstileError)) {
      try {
        const token = await getRecaptchaToken(enforcementMode);
        return {provider: 'recaptcha', token};
      } catch {
        // getRecaptchaToken has recorded the failure; the Turnstile error is
        // the one reported below.
      }
    }
    switch (enforcementMode) {
      case 'monitor':
        // recordTurnstileOutcome has already emitted the metric and the log.
        return null;
      case 'enforce':
        throw turnstileError;
      default: {
        // Adding a mode without deciding its failure behavior is a compile
        // error rather than a silent fall-through to "send nothing".
        const unreachable: never = enforcementMode;
        return unreachable;
      }
    }
  }
}

// Returns an empty object when token is null so callers can spread unconditionally.
export function challengeHeaders(
  token: ChallengeToken | null
): Record<string, string> {
  return token ? {[HEADERS[token.provider]]: token.token} : {};
}
