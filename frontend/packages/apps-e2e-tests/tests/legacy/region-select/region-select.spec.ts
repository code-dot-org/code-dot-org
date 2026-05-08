import {type Page} from '@playwright/test';

import {expect, test} from '../../shared/fixtures';

/**
 * Global Edition — region/language selector on Studio and Lab pages.
 *
 * Source:
 *   dashboard/test/ui/features/platform/global_edition/region_select.feature
 *
 * Anonymous; no authentication required.
 * The @no_mobile tag from the feature is preserved.
 */

/**
 * Waits for a lab page to finish loading after navigation.
 * Mirrors the `I wait for the lab page to fully load` Cucumber step:
 *   wait for #runButton, wait for .header_user, dismiss #overlay if present.
 *
 * @param page - Playwright page
 */
async function waitForLabLoad(page: Page): Promise<void> {
  await page.locator('#runButton').waitFor({state: 'visible', timeout: 30_000});
  await page
    .locator('.header_user')
    .first()
    .waitFor({state: 'visible', timeout: 30_000});
  const overlay = page.locator('#overlay');
  if (await overlay.isVisible({timeout: 1_000}).catch(() => false)) {
    await overlay.click();
  }
}

test.describe('Global Edition — region select', () => {
  test(
    'Studio page: switch between English and Farsi using the locale dropdown',
    {tag: '@no_mobile'},
    async ({page}) => {
      await page.goto('/users/sign_in');
      await expect(page.locator('#locale option:checked')).toContainText(
        'English',
        {timeout: 10_000},
      );

      // Switch to Farsi — triggers a full-page navigation.
      await Promise.all([
        page.waitForURL(/\/fa\/users\/sign_in/, {
          waitUntil: 'domcontentloaded',
          timeout: 30_000,
        }),
        page.locator('#locale').selectOption({label: 'فارسی'}),
      ]);
      await expect(page).toHaveURL(/\/fa\/users\/sign_in\?lang=fa-IR/);
      await expect(page.locator('#locale option:checked')).toContainText(
        'فارسی',
      );

      // Navigating to / while in Farsi locale redirects to the Farsi sign-in.
      await page.goto('/');
      await expect(page).toHaveURL(/\/fa\/users\/sign_in/, {timeout: 15_000});

      // Switch back to English.
      await Promise.all([
        page.waitForURL(/\/users\/sign_in\?lang=en-US/, {
          waitUntil: 'domcontentloaded',
          timeout: 30_000,
        }),
        page.locator('#locale').selectOption({label: 'English'}),
      ]);
      await expect(page).toHaveURL(/\/users\/sign_in\?lang=en-US/);
      await expect(page.locator('#locale option:checked')).toContainText(
        'English',
      );
    },
  );

  test(
    'Lab page: switch between English and Farsi using the locale form',
    {tag: '@no_mobile'},
    async ({page}) => {
      await page.goto('/projects/artist/new');
      await waitForLabLoad(page);
      await expect(page.locator('.uitest-instructionsTab')).toContainText(
        'Instructions',
        {timeout: 15_000},
      );
      await expect(page.locator('#localeForm option:checked')).toContainText(
        'English',
      );

      // Switch to Farsi.
      await Promise.all([
        page.waitForURL(/\/fa\/projects\/artist\/.*\/edit\?lang=fa-IR/, {
          waitUntil: 'domcontentloaded',
          timeout: 30_000,
        }),
        page
          .locator('#localeForm select[name="locale"]')
          .selectOption({label: 'فارسی'}),
      ]);
      await waitForLabLoad(page);
      await expect(page.locator('.uitest-instructionsTab')).toContainText(
        'دستورالعمل',
        {timeout: 15_000},
      );
      await expect(page.locator('#localeForm option:checked')).toContainText(
        'فارسی',
      );

      // Switch back to English.
      await Promise.all([
        page.waitForURL(/\/projects\/artist\/.*\/edit\?lang=en-US/, {
          waitUntil: 'domcontentloaded',
          timeout: 30_000,
        }),
        page
          .locator('#localeForm select[name="locale"]')
          .selectOption({label: 'English'}),
      ]);
      await waitForLabLoad(page);
      await expect(page.locator('.uitest-instructionsTab')).toContainText(
        'Instructions',
        {timeout: 15_000},
      );
      await expect(page.locator('#localeForm option:checked')).toContainText(
        'English',
      );
    },
  );
});
