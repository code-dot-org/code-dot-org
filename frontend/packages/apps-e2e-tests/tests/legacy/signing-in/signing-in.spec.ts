import {createTeacher, createStudent, signOut} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Sign in via the /users/sign_in form — student and teacher paths.
 *
 * Source:
 *   dashboard/test/ui/features/platform/signing_in.feature
 *
 * Scenarios 1–3 are ported. Skipped:
 * - EU student scenario (requires geolocation / locale setup)
 * - @as_taught_student scenario (requires section code fixture)
 */

test.describe('Signing in', () => {
  test('student sign in from studio.code.org', async ({page}) => {
    const {email, password, displayName} = await createStudent(page);
    await signOut(page);

    await page.goto('/users/sign_in');
    await page.locator('#signin').waitFor({state: 'visible', timeout: 30_000});

    await page.locator('#user_login').fill(email);
    await page.locator('#user_password').fill(password);
    await Promise.all([
      page.waitForNavigation({timeout: 30_000}),
      page.locator('#signin-button').click(),
    ]);

    await page.waitForURL(/\/home/, {timeout: 30_000});
    await page
      .locator('#header_user_menu')
      .waitFor({state: 'visible', timeout: 15_000});
    await expect(page.locator('.display_name')).toContainText(displayName);
  });

  // EU student scenario requires geolocation/locale setup — skipped.
  test.fixme('student sign in from studio.code.org (EU)', async () => {});

  test('teacher sign in from studio.code.org', async ({page}) => {
    const {email, password, displayName} = await createTeacher(page);
    await signOut(page);

    await page.goto('/users/sign_in');
    await page.locator('#signin').waitFor({state: 'visible', timeout: 30_000});

    await page.locator('#user_login').fill(email);
    await page.locator('#user_password').fill(password);
    await Promise.all([
      page.waitForNavigation({timeout: 30_000}),
      page.locator('#signin-button').click(),
    ]);

    await page.waitForURL(/\/teacher_dashboard\/home/, {timeout: 30_000});
    await page
      .locator('#header_user_menu')
      .waitFor({state: 'visible', timeout: 15_000});
    await expect(page.locator('.display_name')).toContainText(displayName);
  });

  // @as_taught_student scenario requires section code fixture — skipped.
  test.fixme(
    'signed-out joining non-picture non-word section goes to link account page',
    async () => {},
  );
});
