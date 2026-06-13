import {isRedirect} from '@tanstack/react-router';
import {beforeEach, describe, expect, it} from 'vitest';

import type {AuthOutcome} from '@/modules/auth/types';

import {Route} from '../edit';

// Exercises the route's own `beforeLoad` wiring (return-to + redirect), not just
// the signInRedirectHref helper. The guard only reads `context`.
const runGuard = (auth: AuthOutcome) =>
  (Route.options.beforeLoad as (arg: {context: {auth: AuthOutcome}}) => void)({
    context: {auth},
  });

const SIGNED_IN = {status: 'signed-in', is_signed_in: true} as AuthOutcome;
const SIGNED_OUT: AuthOutcome = {status: 'signed-out'};
const ERROR: AuthOutcome = {status: 'error'};

describe('/users/edit auth guard (beforeLoad)', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/users/edit?tab=details');
  });

  it('redirects a signed-out visitor to sign-in with the current path as return-to', () => {
    let thrown: unknown;
    try {
      runGuard(SIGNED_OUT);
    } catch (error) {
      thrown = error;
    }
    expect(isRedirect(thrown)).toBe(true);
    expect((thrown as {options: {href: string}}).options.href).toBe(
      '/users/sign_in?user_return_to=%2Fusers%2Fedit%3Ftab%3Ddetails',
    );
  });

  it('lets a signed-in visitor through (no redirect)', () => {
    expect(() => runGuard(SIGNED_IN)).not.toThrow();
  });

  it('does not redirect on the auth error outcome — the root renders the error page', () => {
    expect(() => runGuard(ERROR)).not.toThrow();
  });
});
