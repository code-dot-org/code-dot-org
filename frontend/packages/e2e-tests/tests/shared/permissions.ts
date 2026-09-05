import {type Page} from '@playwright/test';

import {requestWithCsrf} from './api';

/** A UserPermission grantable to the current session via TestController's *_access actions. */
export type Permission =
  | 'facilitator'
  | 'program_manager'
  | 'universal_instructor'
  | 'workshop_organizer';

const ENDPOINTS: Record<Permission, string> = {
  facilitator: '/api/test/facilitator_access',
  program_manager: '/api/test/program_manager_access',
  universal_instructor: '/api/test/universal_instructor_access',
  workshop_organizer: '/api/test/workshop_organizer_access',
};

/**
 * Grant a UserPermission to the currently signed-in user via the matching
 * TestController *_access endpoint. The page must already be on the target
 * host with an authenticated session. UserPermission#permission= appends to
 * the user's permission list rather than replacing it, but a fresh test user
 * per scenario is still the norm here — LandingPage.jsx's tab logic treats
 * facilitator as taking priority over universal_instructor on the same user.
 */
export async function grantPermission(
  page: Page,
  permission: Permission,
): Promise<void> {
  const path = ENDPOINTS[permission];
  const {ok, status} = await requestWithCsrf(page, 'POST', path);
  if (!ok) {
    throw new Error(`${path} failed: ${status}`);
  }
}
