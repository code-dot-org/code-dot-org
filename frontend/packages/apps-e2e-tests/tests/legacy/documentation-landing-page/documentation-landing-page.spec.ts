import {expect, test} from '../../shared/fixtures';

/**
 * Documentation landing page — /docs/ and /docs/ide/applab/.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/documentation_landing_page.feature
 *
 * Both scenarios tagged @no_mobile and @single_session (anonymous, no auth).
 */

test.describe('Documentation landing page', () => {
  test(
    '/docs/ displays IDE and Sprite Lab sections',
    {tag: '@no_mobile'},
    async ({page}) => {
      await page.goto('/docs/');
      await page
        .locator('.container.main')
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(page.locator('.container.main')).toContainText('IDEs');
      await expect(page.locator('.container.main')).toContainText('Sprite Lab');
    },
  );

  test(
    '/docs/ide/applab/ displays App Lab documentation',
    {tag: '@no_mobile'},
    async ({page}) => {
      await page.goto('/docs/ide/applab/');
      await page
        .locator('.container.main')
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(page.locator('h1').first()).toContainText(
        'App Lab Documentation',
      );
      await expect(page.locator('.page-content')).toContainText('UI controls');
      await expect(page.locator('.page-content')).toContainText('onEvent');
      await expect(page.locator('.nav-bar')).toContainText('UI controls');
    },
  );
});
