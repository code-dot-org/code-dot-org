import {isRedirect} from '@tanstack/react-router';
import {beforeEach, describe, expect, it} from 'vitest';

import type {AuthOutcome} from '@/modules/auth/types';

import {Route} from '../new';

const runGuard = (auth: AuthOutcome) =>
  (Route.options.beforeLoad as (arg: {context: {auth: AuthOutcome}}) => void)({
    context: {auth},
  });

const SIGNED_IN = {status: 'signed-in', is_signed_in: true} as AuthOutcome;
const SIGNED_OUT: AuthOutcome = {status: 'signed-out'};
const ERROR: AuthOutcome = {status: 'error'};

describe('/projects/build-lab/new auth guard', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/projects/build-lab/new');
  });

  it('redirects a signed-out visitor to Rails sign-in', () => {
    let thrown: unknown;
    try {
      runGuard(SIGNED_OUT);
    } catch (error) {
      thrown = error;
    }

    expect(isRedirect(thrown)).toBe(true);
    const options = (
      thrown as {options: {href: string; reloadDocument?: boolean}}
    ).options;
    expect(options.href).toBe(
      '/users/sign_in?user_return_to=%2Fprojects%2Fbuild-lab%2Fnew',
    );
    expect(options.reloadDocument).toBe(true);
  });

  it('lets a signed-in visitor reach the project creation loader', () => {
    expect(() => runGuard(SIGNED_IN)).not.toThrow();
  });

  it('does not redirect the auth error outcome', () => {
    expect(() => runGuard(ERROR)).not.toThrow();
  });
});
