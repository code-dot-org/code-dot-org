import {describe, it, expect} from 'vitest';

import {signInRedirectHref} from '../signInRedirect';
import type {AuthOutcome} from '../types';

const SIGNED_IN = {status: 'signed-in', is_signed_in: true} as AuthOutcome;
const SIGNED_OUT: AuthOutcome = {status: 'signed-out'};
const ERROR: AuthOutcome = {status: 'error'};

describe('signInRedirectHref', () => {
  it('redirects a signed-out visitor to Rails sign-in with an encoded return-to', () => {
    expect(signInRedirectHref(SIGNED_OUT, '/frontend-studio/users/edit')).toBe(
      '/users/sign_in?user_return_to=%2Ffrontend-studio%2Fusers%2Fedit',
    );
  });

  it('encodes the full relative path, query string included', () => {
    expect(
      signInRedirectHref(SIGNED_OUT, '/frontend-studio/users/edit?tab=details'),
    ).toBe(
      '/users/sign_in?user_return_to=%2Ffrontend-studio%2Fusers%2Fedit%3Ftab%3Ddetails',
    );
  });

  it('lets a signed-in visitor through (no redirect)', () => {
    expect(
      signInRedirectHref(SIGNED_IN, '/frontend-studio/users/edit'),
    ).toBeNull();
  });

  it('does not redirect on the error outcome — the root shows the auth error page, so a redirect would loop', () => {
    expect(signInRedirectHref(ERROR, '/frontend-studio/users/edit')).toBeNull();
  });
});
