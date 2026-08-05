import {setUser} from '@code-dot-org/core/plugins/analytics';

import type {AuthOutcome} from './types';

/**
 * Attaches the resolved auth outcome to the analytics session. Sign-out is a
 * Rails redirect, so the root route's `beforeLoad` is the only auth seam:
 * identity is re-stated on every navigation and the plugin drops the repeats.
 */
export function identifyAnalyticsUser(auth: AuthOutcome): void {
  setUser(
    auth.status === 'signed-in'
      ? {
          userId: String(auth.id),
          userType: auth.user_type,
          isVerifiedInstructor: auth.is_verified_instructor,
          educatorRole: auth.educator_role,
        }
      : null,
  );
}
