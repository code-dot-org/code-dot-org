import {expect, test} from '../../shared/fixtures';

/**
 * Public project gallery — signed-out view at /projects/public.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/projects/public_project_gallery_signed_out.feature
 *
 * Anonymous; no authentication required.
 */

test.describe('Public project gallery — signed out', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/projects/public');
  });

  test('gallery shows expected elements', async ({page}) => {
    await expect(page.locator('h1')).toContainText('Projects', {
      timeout: 30_000,
    });
    await expect(page.locator('#uitest-public-projects')).toBeVisible();
  });

  test('gallery shows expected project types', async ({page}) => {
    await page
      .locator('#uitest-public-projects')
      .waitFor({state: 'visible', timeout: 30_000});
    await page
      .locator('.ui-project-app-type-area')
      .first()
      .waitFor({state: 'attached'});
    // At least one project type area exists.
    await expect(page.locator('.ui-project-app-type-area')).not.toHaveCount(0);
    await expect(page.locator('.ui-featured')).toContainText(
      'Featured Projects',
    );
  });
});
