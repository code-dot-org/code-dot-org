import {type Page} from '@playwright/test';

import {expect, test} from '../../shared/fixtures';
import {dismissLoginReminder} from '../../shared/ui';

const CSF_LEVEL_URL =
  '/courses/ui-test-csf/units/1/lessons/1/levels/1?noautoplay=true';
const HOC_DANCE_LEVEL_URL =
  '/courses/allthethingscourse/units/1/lessons/37/levels/2?noautoplay=true';

/**
 * Remove both persistence layers used by SignInCalloutWrapper.
 *
 * Source Cucumber uses `delete the cookie named "hide_signin_callout"` and
 * `clear session storage`; doing both from the page context is the same user
 * state reset without relying on Selenium cookie primitives.
 */
async function clearSigninCalloutState(page: Page) {
  await page.evaluate(() => {
    document.cookie =
      'hide_signin_callout=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    sessionStorage.clear();
  });
}

/**
 * Navigate to the UI-test CSF level and wait for the user-visible ready state.
 */
async function gotoCsfLevel(page: Page) {
  await page.goto(CSF_LEVEL_URL);
  await expect(page.locator('#runButton')).toBeVisible();
}

/**
 * Visible callout close control.
 *
 * Agent Browser showed the Cucumber wrapper `.uitest-signincallout` has a 0x0
 * box while the popover content and close button inside it are visible.  The
 * close button is the user-visible readiness signal.
 */
function signinCalloutCloseButton(page: Page) {
  return page.locator('.uitest-signincallout [aria-label="Close"]');
}

/**
 * Source: dashboard/test/ui/features/star_labs/signin_callout.feature
 * Source: dashboard/test/ui/features/star_labs/signin_callout2.feature
 */
test.describe('Sign-in callout', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/reset_session');
    await clearSigninCalloutState(page);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/signin_callout.feature
   * Scenario: Should be able to clear cookies and session storage to see callout again
   * @no_mobile
   */
  test('clearing cookie and session storage shows the callout again', async ({
    page,
  }) => {
    await gotoCsfLevel(page);
    await expect(signinCalloutCloseButton(page)).toBeVisible();

    await dismissLoginReminder(page);
    await page.reload();
    await expect(signinCalloutCloseButton(page)).not.toBeAttached();

    await clearSigninCalloutState(page);
    await page.reload();
    await expect(page.locator('#runButton')).toBeVisible();
    await expect(signinCalloutCloseButton(page)).toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/signin_callout.feature
   * Scenario: Should not see callout on CSF coursea lesson if logged in
   * @as_student
   */
  test('signed-in students do not see the callout', async ({studentPage}) => {
    await gotoCsfLevel(studentPage);
    await expect(signinCalloutCloseButton(studentPage)).not.toBeAttached();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/signin_callout2.feature
   * Scenario: Clicking anywhere should dismiss the login reminder
   */
  test('dismissing the callout leaves instructions and run button usable', async ({
    page,
  }) => {
    await gotoCsfLevel(page);
    await expect(signinCalloutCloseButton(page)).toBeVisible();

    await dismissLoginReminder(page);

    await expect(page.locator('.instructions-markdown p')).toHaveText(
      'Draw the foot of the man with one line',
    );
    await expect(page.locator('#runButton')).toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/signin_callout2.feature
   * Scenario: See age callout, not signin callout on hour of code
   */
  test('age dialog suppresses the sign-in callout on Hour of Code', async ({
    page,
  }) => {
    await page.goto(HOC_DANCE_LEVEL_URL);
    await expect(page.locator('#runButton')).toBeVisible();
    await page.locator('#p5_loading').waitFor({state: 'hidden'});

    await expect(page.locator('#uitest-age-selector')).toBeVisible();
    await expect(signinCalloutCloseButton(page)).not.toBeAttached();

    await page.locator('#uitest-age-selector').selectOption('10');
    await page.locator('#uitest-submit-age').click();
    await expect(page.locator('#runButton')).toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/signin_callout2.feature
   * Scenario: After dismissing the callout, it should not reappear upon refresh
   */
  test('dismissed callout stays hidden after reload', async ({page}) => {
    await gotoCsfLevel(page);
    await expect(signinCalloutCloseButton(page)).toBeVisible();

    await dismissLoginReminder(page);
    await page.reload();

    await expect(page.locator('#runButton')).toBeVisible();
    await expect(signinCalloutCloseButton(page)).not.toBeAttached();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/signin_callout2.feature
   * Scenario: Nested callouts should work as expected
   */
  test('dismissing the callout reveals top instructions', async ({page}) => {
    await gotoCsfLevel(page);
    await expect(signinCalloutCloseButton(page)).toBeVisible();

    await dismissLoginReminder(page);

    await expect(page.locator('.csf-top-instructions p')).toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/signin_callout2.feature
   * Scenario: Should be immediately redirected to sign in if pressing sign in button
   */
  test('sign-in link still navigates to the sign-in page while callout is visible', async ({
    page,
  }) => {
    await gotoCsfLevel(page);
    await expect(signinCalloutCloseButton(page)).toBeVisible();

    await page.getByRole('link', {name: 'Sign in', exact: true}).click();

    await expect(page).toHaveURL(/\/users\/sign_in/);
  });
});
