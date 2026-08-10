import {expect, test} from '@playwright/test';

import {SignInPage} from '../pages/sign-in';
import {createUser, resetSession} from '../shared/auth';
import {analyze} from '../shared/axe';

/**
 * Cached-unit level URL with login_required param. After sign-in the server
 * strips the param. ui-test-oceans is a UI-test-only course listed in
 * UI_TEST_CACHED_UNITS_MAP (lib/cdo/http_cache.rb) and seeded by
 * `rake seed:ui_test`, so this exercises the cached-unit redirect branch
 * without depending on production curriculum.
 */
const LEVEL_PATH = '/courses/ui-test-oceans/units/1/lessons/1/levels/1';
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
    await signIn.fillCredentials({email, password});
    await signIn.submit();

    // The post-sign-in redirect lands on the original level path (no login_required param).
    await expect(page).toHaveURL(
      url =>
        url.pathname.endsWith(LEVEL_PATH) &&
        !url.searchParams.has('login_required'),
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
      url =>
        url.pathname.endsWith(LEVEL_PATH) &&
        !url.searchParams.has('login_required'),
    );
  });

  /**
   * Accessibility baseline scan. The page currently ships a known batch of WCAG
   * violations we cannot fix all at once. Rather than fail outright or skip a11y
   * coverage entirely, we bound the violation set with two lists:
   *
   *   - REQUIRED: violations present on every target. The scan must report all of
   *     them; if one disappears it was fixed (a happy regression) and should be
   *     promoted out of this list.
   *   - IN_TRANSITION: violations we have fixed in source but whose fix may not be
   *     live on the scan target yet. The suite scans whatever is deployed
   *     (test-studio by default, a PR's own build under Drone), so a fix lands in
   *     code before it reaches test-studio. These are tolerated whether present
   *     (pre-deploy) or absent (post-deploy / PR build). Once a fix is everywhere,
   *     delete its entry — leaving it only widens the tolerance window.
   *
   * Any violation outside REQUIRED ∪ IN_TRANSITION fails the test (a real
   * regression). This is granular to the rule id, not the node count.
   *
   * TODO: drive both lists to empty and switch back to `toEqual([])`.
   */
  test('login page accessibility violations match documented baseline', async ({
    page,
  }) => {
    await page.goto('/', {waitUntil: 'domcontentloaded'});

    const REQUIRED_VIOLATIONS = [
      'color-contrast', // serious: insufficient text/background contrast
      'heading-order', // moderate: heading levels skipped
      'page-has-heading-one', // moderate: page lacks a top-level <h1>
      'region', // moderate: content not contained in a landmark
    ];
    const IN_TRANSITION_VIOLATIONS = [
      'image-alt', // fixed: decorative OAuth logos now carry alt=""
      'label', // fixed: sign-in login field now bound via f.label :login
    ];
    const allowed = new Set([
      ...REQUIRED_VIOLATIONS,
      ...IN_TRANSITION_VIOLATIONS,
    ]);

    // Default rules, not WCAG-only: REQUIRED needs best-practice ids (region etc.).
    const violations = Object.keys(await analyze(page));

    // No violation outside the documented set — catches genuine new regressions.
    expect(violations.filter(id => !allowed.has(id)).sort()).toEqual([]);

    // Every required violation is still present — catches a happy regression that
    // should shrink the REQUIRED list.
    expect(REQUIRED_VIOLATIONS.filter(id => !violations.includes(id))).toEqual(
      [],
    );
  });
});
