import {createStudent, signOut} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Login redirect via ?login_required=true on cached level pages.
 *
 * Source:
 *   dashboard/test/ui/features/platform/login_redirect.feature
 *
 * The `mc` level is specifically chosen because it is seeded in the test
 * environment and is a cached unit.
 */

const MC_LEVEL_URL = '/courses/mc/units/1/lessons/1/levels/1';

test.describe('Login redirect', () => {
  test('signed-out student is redirected to sign-in then back to level', async ({
    page,
  }) => {
    const {email, password} = await createStudent(page);
    await signOut(page);

    await page.goto(`${MC_LEVEL_URL}?login_required=true`);
    await page.waitForURL(/\/users\/sign_in/, {timeout: 30_000});
    await page.locator('#signin').waitFor({state: 'visible', timeout: 15_000});

    // Sign in via the UI form (mirrors `I fill in username and password for X`).
    await page.locator('#user_login').fill(email);
    await page.locator('#user_password').fill(password);
    await Promise.all([
      page.waitForNavigation({timeout: 30_000}),
      page.locator('#signin-button').click(),
    ]);

    await page.waitForURL(new RegExp(MC_LEVEL_URL.replace(/\//g, '\\/')), {
      timeout: 30_000,
    });
  });

  test('already-signed-in student accesses level directly with login_required', async ({
    page,
  }) => {
    await createStudent(page);

    // Student is already signed in; ?login_required should not redirect.
    await page.goto(`${MC_LEVEL_URL}?login_required=true`);
    await page.waitForURL(new RegExp(MC_LEVEL_URL.replace(/\//g, '\\/')), {
      timeout: 30_000,
    });
    expect(page.url()).not.toContain('sign_in');
  });
});
