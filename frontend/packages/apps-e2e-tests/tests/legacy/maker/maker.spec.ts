import {expect, test} from '../../shared/fixtures';

/**
 * Maker toolkit palette group visibility.
 *
 * Source: dashboard/test/ui/features/star_labs/maker_projects.feature
 *
 * @as_student @chrome
 *
 * Confirms that /projects/makerlab enables the "Maker" Droplet palette
 * category while /projects/applab does not.
 *
 * Chromium-only: the original feature is @chrome.  In the Playwright
 * config this maps to the `chromium` project; the @no_mobile tag is
 * also applied so the test is skipped on mobile viewports.
 */
test.describe('Maker projects — palette group', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/maker_projects.feature
   * Scenario: /projects/makerlab enables maker toolkit categories
   */
  test(
    '/projects/makerlab shows Maker palette group',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      await studentPage.goto('/projects/makerlab');
      // Wait for the URL redirect to the edit page before checking the palette.
      await studentPage.waitForURL(/\/projects\/makerlab\/.+\/edit/, {
        timeout: 30_000,
      });
      await studentPage
        .locator('#runButton')
        .waitFor({state: 'visible', timeout: 60_000});

      await expect(
        studentPage
          .locator('.droplet-palette-group-header')
          .filter({hasText: 'Maker'}),
      ).toBeVisible();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/maker_projects.feature
   * Scenario: /projects/makerlab/new enables maker toolkit categories
   */
  test(
    '/projects/makerlab/new shows Maker palette group',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      await studentPage.goto('/projects/makerlab/new');
      await studentPage.waitForURL(/\/projects\/makerlab\/.+\/edit/, {
        timeout: 30_000,
      });
      await studentPage
        .locator('#runButton')
        .waitFor({state: 'visible', timeout: 60_000});

      await expect(
        studentPage
          .locator('.droplet-palette-group-header')
          .filter({hasText: 'Maker'}),
      ).toBeVisible();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/maker_projects.feature
   * Scenario: /projects/applab does not enable maker toolkit categories
   */
  test(
    '/projects/applab does not show Maker palette group',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      await studentPage.goto('/projects/applab');
      await studentPage.waitForURL(/\/projects\/applab\/.+\/edit/, {
        timeout: 30_000,
      });
      await studentPage
        .locator('#runButton')
        .waitFor({state: 'visible', timeout: 60_000});

      await expect(
        studentPage
          .locator('.droplet-palette-group-header')
          .filter({hasText: 'Maker'}),
      ).not.toBeVisible();
    },
  );
});
