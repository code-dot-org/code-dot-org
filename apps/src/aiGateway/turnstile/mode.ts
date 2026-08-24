/**
 * Turnstile enforcement mode.
 *
 * The mode is resolved server-side from the `ai-gateway-turnstile-mode` DCDO
 * flag once per access-token request, and arrives here on that request's
 * response. The same value is also embedded as a signed claim in the access
 * token itself, which is what the gateway worker enforces on -- so the decision
 * the browser makes here and the decision the worker makes cannot disagree.
 * See AiGatewayAuthController#get_access_token for the authority.
 *
 *   disabled - do not solve a challenge; send no token.
 *   monitor  - solve and send, but proceed without a token on failure. The
 *              worker records the outcome and rejects nothing.
 *   enforce  - solve and send; a failure fails the request, since the worker
 *              would reject it anyway.
 */
export const TURNSTILE_MODES = ['disabled', 'monitor', 'enforce'] as const;

export type TurnstileMode = (typeof TURNSTILE_MODES)[number];

export const DEFAULT_TURNSTILE_MODE: TurnstileMode = 'disabled';

function isTurnstileMode(value: unknown): value is TurnstileMode {
  return (
    typeof value === 'string' &&
    (TURNSTILE_MODES as readonly string[]).includes(value)
  );
}

/**
 * Narrows an untrusted value to a TurnstileMode.
 *
 * The mode crosses a JSON boundary, so anything can arrive: a server too old to
 * send the field, a boolean (DCDO stores arbitrary JSON, and a YAML-loaded
 * `off` resolves to `false`), or a typo. Everything unrecognized becomes
 * `disabled`, so a bad value can never switch enforcement on or leave the
 * browser acting on a mode the worker does not share.
 */
export function parseTurnstileMode(value: unknown): TurnstileMode {
  return isTurnstileMode(value) ? value : DEFAULT_TURNSTILE_MODE;
}
