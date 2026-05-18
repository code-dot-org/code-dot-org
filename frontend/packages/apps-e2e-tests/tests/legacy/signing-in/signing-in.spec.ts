import {
  createSection,
  createTeacher,
  createStudent,
  signOut,
} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Sign in via the /users/sign_in form — student and teacher paths.
 *
 * Source:
 *   dashboard/test/ui/features/platform/signing_in.feature
 *
 * All scenarios are ported.
 */

test.describe('Signing in', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/signing_in.feature
   * Scenario: Student sign in from studio.code.org
   */
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

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/signing_in.feature
   * Scenario: Student sign in from studio.code.org in the eu
   */
  test('student sign in from studio.code.org in the eu', async ({page}) => {
    const {email, password, displayName} = await createStudent(page, {
      name: 'Alice',
      country_code: 'DE',
      data_transfer_agreement_accepted: true,
    });
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

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/signing_in.feature
   * Scenario: Teacher sign in from studio.code.org
   */
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

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/signing_in.feature
   * Scenario: Signed-out joining non-picture non-word section from sign in page goes to link account page
   */
  test('signed-out joining non-picture non-word section from sign in page goes to link account page', async ({
    page,
  }) => {
    await createTeacher(page);
    const {sectionCode} = await createSection(page);
    await signOut(page);

    await page.goto('/users/sign_in/');
    await expect(page.locator('#section_code')).toBeVisible({
      timeout: 30_000,
    });
    await page.locator('#section_code').fill(sectionCode);

    await Promise.all([
      page.waitForNavigation({timeout: 30_000}),
      page.locator('.section-sign-in button').click(),
    ]);

    await expect(page.locator('a', {hasText: 'Create an account'})).toBeVisible(
      {timeout: 30_000},
    );
  });
});
