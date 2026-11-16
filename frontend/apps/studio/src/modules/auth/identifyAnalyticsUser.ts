import {setUser} from '@code-dot-org/core/plugins/analytics';

import type {AuthOutcome} from './types';

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
