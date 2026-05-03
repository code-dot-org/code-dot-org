import {expect, test} from '@playwright/test';

/**
 * Curriculum Catalog — signed-out user behavior.
 *
 * Source: dashboard/test/ui/features/acquisition_products/curriculum_catalog.feature
 *
 * One porteable scenario (signed-out only).  Auth-required scenarios
 * (signed-in student, signed-in teacher) are skipped — require createStudent /
 * createTeacher fixtures not yet wired to catalog tests.
 */
test.describe('Curriculum Catalog — signed-out', () => {
  test('signed-out user is redirected to sign-in when clicking Assign', async ({
    page,
  }) => {
    await page.goto('/catalog');

    await page
      .locator('h4', {hasText: 'AI for Oceans'})
      .waitFor({state: 'visible'});

    // Click the assign button for "AI for Oceans".
    await page
      .locator('[aria-label="Assign AI for Oceans to your classroom"]')
      .click();

    await expect(
      page.locator('h3', {
        hasText: 'Sign in or create account to assign a curriculum',
      }),
    ).toBeVisible();

    // Follow the sign-in link and verify the sign-in page loads.
    await page.locator('a', {hasText: 'Sign in or create account'}).click();
    await expect(
      page.locator('h2', {hasText: 'Have an account already? Sign in'}),
    ).toBeVisible();
  });
});
