import {expect, test} from '@playwright/test';

import {SignInPage} from '../pages/sign-in';
import {createUser, resetSession} from '../shared/auth';

/** MC level URL with login_required param. After sign-in the server strips the param. */
const LEVEL_PATH = '/courses/mc/units/1/lessons/1/levels/1';
const LEVEL_WITH_LOGIN_REQUIRED = `${LEVEL_PATH}?login_required=true`;

test.describe('Navigating to a level page with login required', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/login_redirect.feature
   * "Student navigates to provided cached level link with a login_required parameter"
   */
  test('Student navigates to provided cached level link with a login_required parameter', async ({
    page,
  }) => {
    const signIn = new SignInPage(page);

    // Seed CSRF token, create + sign-in user, then clear the session to simulate
    // a signed-out student visiting a cached level link.
    await page.goto('/');
    const {email, password} = await createUser(page, {
      type: 'student',
      name: 'Carah Student',
    });
    await resetSession(page);

    // Navigate to the level with login_required=true; server redirects to /users/sign_in.
    await page.goto(LEVEL_WITH_LOGIN_REQUIRED, {waitUntil: 'domcontentloaded'});
    await expect(page).toHaveURL(/\/users\/sign_in/);

    // Sign-in form is server-rendered and present immediately.
    await signIn.waitForForm();

    // Fill credentials and submit; server redirects back to the level (no login_required).
    await signIn.fillCredentials(email, password);
    await signIn.submit();

    // The post-sign-in redirect lands on the original level path (no login_required param).
    await expect(page).toHaveURL(
      new RegExp(LEVEL_PATH + '(?!.*login_required)'),
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/login_redirect.feature
   * "Student already logged in navigates to provided cached level link with a login_required parameter"
   */
  test('Student already logged in navigates to provided cached level link with a login_required parameter', async ({
    page,
  }) => {
    // Create a student who has never signed in (sign_in_count:0), then go home.
    // The user is already signed in via the API call inside createUser.
    await page.goto('/');
    await createUser(page, {
      type: 'student',
      name: 'François Student',
      signInCount: 0,
    });
    await page.goto('/', {waitUntil: 'domcontentloaded'});

    // Already signed in: navigating to the level with login_required=true triggers
    // cached_page_auth_redirect, which resolves directly to the level URL (no param).
    // The locale prefix (/pl/, /cn/, etc.) varies per session — match on path only.
    await page.goto(LEVEL_WITH_LOGIN_REQUIRED, {waitUntil: 'domcontentloaded'});
    await expect(page).toHaveURL(
      new RegExp(LEVEL_PATH + '(?!.*login_required)'),
    );
  });
});
