import {beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('@code-dot-org/core/plugins/analytics', () => ({setUser: vi.fn()}));

import {setUser} from '@code-dot-org/core/plugins/analytics';

import {identifyAnalyticsUser} from '../identifyAnalyticsUser';
import type {AuthOutcome} from '../types';

const SIGNED_IN = {
  status: 'signed-in',
  id: 42,
  user_type: 'teacher',
  is_verified_instructor: true,
  educator_role: 'librarian',
} as unknown as AuthOutcome;

beforeEach(() => vi.clearAllMocks());

describe('identifyAnalyticsUser', () => {
  it('reports every dimension the legacy reporter carried', () => {
    identifyAnalyticsUser(SIGNED_IN);

    expect(setUser).toHaveBeenCalledWith({
      userId: '42',
      userType: 'teacher',
      isVerifiedInstructor: true,
      educatorRole: 'librarian',
    });
  });

  it('clears the identity when signed out', () => {
    identifyAnalyticsUser({status: 'signed-out'});

    expect(setUser).toHaveBeenCalledWith(null);
  });

  it('clears the identity when auth could not be resolved', () => {
    identifyAnalyticsUser({status: 'error'});

    expect(setUser).toHaveBeenCalledWith(null);
  });
});
