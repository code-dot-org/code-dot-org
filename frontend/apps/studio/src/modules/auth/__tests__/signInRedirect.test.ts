import {describe, it, expect} from 'vitest';

import {signInRedirectHref} from '../signInRedirect';
import type {AuthOutcome} from '../types';

const SIGNED_IN = {status: 'signed-in', is_signed_in: true} as AuthOutcome;
const SIGNED_OUT: AuthOutcome = {status: 'signed-out'};
const ERROR: AuthOutcome = {status: 'error'};

describe('signInRedirectHref', () => {
  it('redirects a signed-out visitor to Rails sign-in with an encoded return-to', () => {
    expect(signInRedirectHref(SIGNED_OUT, '/some/protected/page')).toBe(
      '/users/sign_in?user_return_to=%2Fsome%2Fprotected%2Fpage',
    );
  });

  it('encodes the full relative path, query string included', () => {
    expect(
      signInRedirectHref(SIGNED_OUT, '/some/protected/page?tab=details'),
    ).toBe(
      '/users/sign_in?user_return_to=%2Fsome%2Fprotected%2Fpage%3Ftab%3Ddetails',
    );
  });

  it('lets a signed-in visitor through (no redirect)', () => {
    expect(signInRedirectHref(SIGNED_IN, '/some/protected/page')).toBeNull();
  });

  it('does not redirect on the error outcome — the root shows the auth error page, so a redirect would loop', () => {
    expect(signInRedirectHref(ERROR, '/some/protected/page')).toBeNull();
  });
});
