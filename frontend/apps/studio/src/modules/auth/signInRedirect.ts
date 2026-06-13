import type {AuthOutcome} from './types';

/**
 * Sign-in redirect target for a protected route, or null to proceed.
 *
 * Fail-closed gate: only the `signed-out` outcome redirects to the Rails
 * sign-in page with a return-to. `signed-in` proceeds; `error` proceeds too —
 * the root layout already renders the auth error page for that outcome, so
 * redirecting would loop.
 *
 * @param auth - The resolved auth outcome from the root route context.
 * @param returnToPath - The caller's own relative path (`pathname + search`)
 *   to return to after sign-in. Must never be an absolute URL or
 *   attacker-influenceable input; Rails' open-redirect protection is the
 *   backstop, not the validation.
 */
export function signInRedirectHref(
  auth: AuthOutcome,
  returnToPath: string,
): string | null {
  if (auth.status !== 'signed-out') return null;
  return `/users/sign_in?user_return_to=${encodeURIComponent(returnToPath)}`;
}
