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

/**
 * Select a locale and submit the containing locale form deterministically.
 * The dashboard locale selector posts a form and redirects; submitting the
 * form directly avoids racing the page's change handler during parallel runs.
 *
 * @param page - Playwright page
 * @param selector - CSS selector for the locale select
 * @param value - locale value to submit
 * @param expectedUrl - expected URL after the locale redirect
 */
async function selectLocaleAndWaitForRedirect(
  page: Page,
  selector: string,
  value: string,
  expectedUrl: RegExp,
): Promise<void> {
  await Promise.all([
    page.waitForURL(expectedUrl, {
      waitUntil: 'commit',
      timeout: 30_000,
    }),
    page.locator(selector).evaluate((selectElement, localeValue) => {
      const select = selectElement as HTMLSelectElement;
      select.value = localeValue as string;
      select.form?.submit();
    }, value),
  ]);
}

test.describe('Global Edition — region select', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/global_edition/region_select.feature
   * Scenario: User can switch between the international and regional versions using the language selector on a Studio page
   */
  test(
    'Studio page: switch between English and Farsi using the locale dropdown',
    {tag: '@no_mobile'},
    async ({page}) => {
      await page.goto('/reset_session');
      await page.goto('/users/sign_in?lang=en-US');
      await expect(page.locator('#locale option:checked')).toContainText(
        'English',
        {timeout: 10_000},
      );

      // Switch to Farsi — triggers a full-page navigation.
      await selectLocaleAndWaitForRedirect(
        page,
        '#locale',
        'fa-IR',
        /\/fa\/users\/sign_in\?lang=fa-IR/,
      );
      await expect(page).toHaveURL(/\/fa\/users\/sign_in\?lang=fa-IR/);
      await expect(page.locator('#locale option:checked')).toContainText(
        'فارسی',
      );

      // Navigating to / while in Farsi locale redirects to the Farsi sign-in.
      await page.goto('/');
      await expect(page).toHaveURL(/\/fa\/users\/sign_in/, {timeout: 15_000});

      // Switch back to English.
      await selectLocaleAndWaitForRedirect(
        page,
        '#locale',
        'en-US',
        /\/users\/sign_in\?lang=en-US/,
      );
      await expect(page).toHaveURL(/\/users\/sign_in\?lang=en-US/);
      await expect(page.locator('#locale option:checked')).toContainText(
        'English',
      );
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/global_edition/region_select.feature
   * Scenario: User can switch to regional versions using the language selector on a Lab page
   */
  test(
    'Lab page: switch between English and Farsi using the locale form',
    {tag: '@no_mobile'},
    async ({page}) => {
      await page.goto('/reset_session');
      await page.goto('/projects/artist/new?lang=en-US');
      await waitForLabLoad(page);
      await expect(page.locator('.uitest-instructionsTab')).toContainText(
        'Instructions',
        {timeout: 15_000},
      );
      await expect(page.locator('#localeForm option:checked')).toContainText(
        'English',
      );

      // Switch to Farsi.
      await selectLocaleAndWaitForRedirect(
        page,
        '#localeForm select[name="locale"]',
        'fa-IR',
        /\/fa\/projects\/artist\/.*\/edit\?lang=fa-IR/,
      );
      await waitForLabLoad(page);
      await expect(page.locator('.uitest-instructionsTab')).toContainText(
        'دستورالعمل',
        {timeout: 15_000},
      );
      await expect(page.locator('#localeForm option:checked')).toContainText(
        'فارسی',
      );

      // Switch back to English.
      await selectLocaleAndWaitForRedirect(
        page,
        '#localeForm select[name="locale"]',
        'en-US',
        /\/projects\/artist\/.*\/edit\?lang=en-US/,
      );
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
