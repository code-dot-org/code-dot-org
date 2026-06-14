import type {AuthOutcome} from './types';

/**
 * Sign-in redirect target for a protected route, or null to proceed. Only
 * `signed-out` redirects; `error` proceeds because the root layout already
 * renders the auth error page, so redirecting would loop.
 *
 * `returnToPath` must be the caller's own relative path, never an absolute URL
 * or attacker-influenceable input; Rails' open-redirect protection is only a
 * backstop.
 */
export function signInRedirectHref(
  auth: AuthOutcome,
  returnToPath: string,
): string | null {
  if (auth.status !== 'signed-out') return null;
  return `/users/sign_in?user_return_to=${encodeURIComponent(returnToPath)}`;
}
