import {devices, type Page} from '@playwright/test';

import {createStudent} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

const {defaultBrowserType: _defaultBrowserType, ...IPHONE_12_CONTEXT_OPTIONS} =
  devices['iPhone 12'];
void _defaultBrowserType;

/**
 * Share-page logo click navigates to /home.
 *
 * Source: dashboard/test/ui/features/star_labs/sharepage_logo.feature
 *
 * @no_mobile (4 desktop scenarios ported)
 * @only_mobile scenarios are skipped — no mobile Playwright project.
 *
 * @single_session note: original feature is tagged @single_session (no
 * page reload between scenarios), but each Playwright test gets a fresh
 * browser context so shared-session state is not relied on here.
 */

/**
 * Open the share dialog and return the share URL.
 * Clicks .project_share, waits for #sharing-dialog-copy-button, reads value.
 *
 * @param page - authenticated Playwright page on a project URL
 * @returns share URL string
 */
async function getShareUrl(page: Page): Promise<string> {
  await page.locator('.project_share').first().click();
  const copyButton = page.locator('#sharing-dialog-copy-button');
  await expect(copyButton).toBeVisible({timeout: 15_000});
  const url = await copyButton.getAttribute('value');
  if (!url)
    throw new Error('share URL not found in #sharing-dialog-copy-button');
  return url;
}

/**
 * Navigate to a project's share page and verify the logo navigates to /home.
 * Mirrors "Select the logo on a <lab> share page while logged in" scenarios.
 *
 * @param page - authenticated Playwright page
 * @param projectUrl - relative URL of the project (e.g. '/projects/applab')
 */
async function testSharePageLogo(
  page: Page,
  projectUrl: string,
): Promise<void> {
  await page.goto(projectUrl);
  await page.locator('#runButton').waitFor({state: 'visible', timeout: 60_000});
  // Dismiss the intro overlay so it does not intercept the Share button click.
  const overlay = page.locator('#overlay');
  if (await overlay.isVisible()) {
    await page.evaluate(() =>
      (document.querySelector('#overlay') as HTMLElement)?.click(),
    );
    await overlay.waitFor({state: 'hidden', timeout: 10_000});
  }

  const shareUrl = await getShareUrl(page);
  await page.goto(shareUrl);
  // Cucumber "I wait to see '#runButton'" checks DOM presence (find_elements
  // non-empty), not visibility. App Lab / Game Lab share pages autoplay and
  // hide #runButton while PlayLab / Artist keep it visible — but it is always
  // attached once the lab has initialized. Use 'attached' to match the
  // Cucumber semantics; 'visible' times out on autoplay labs.
  await page
    .locator('#runButton')
    .waitFor({state: 'attached', timeout: 60_000});

  // The share page should not show the full Code Studio header banner.
  await expect(
    page.locator('div').filter({hasText: /^STUDIO$/}),
  ).not.toBeAttached();

  // Click the logo image and verify it navigates to the home page.
  await page.locator('#logo-img img').first().click();
  await page.waitForURL('**/home', {timeout: 15_000});
}

/**
 * Return the public share URL for a project edit URL.
 *
 * Code.org project share URLs are the project edit URLs without the trailing
 * `/edit` segment. This avoids mobile toolbar overlays during setup.
 *
 * @param editUrl - absolute project edit URL
 * @returns absolute project share URL
 */
function deriveShareUrlFromEditUrl(editUrl: string): string {
  const url = new URL(editUrl);
  if (!url.pathname.endsWith('/edit')) {
    throw new Error(`project edit URL not found: ${editUrl}`);
  }
  url.pathname = url.pathname.replace(/\/edit$/, '');
  url.search = '';
  url.hash = '';
  return url.toString();
}

/**
 * Create a signed-in project, sign out, then open the project's mobile share page.
 *
 * The source Cucumber scenario names this a logged-out mobile share page check.
 * The visible readiness signal on the share page is the attached `#runButton`.
 *
 * @param page - Playwright page using a phone context
 * @param projectUrl - relative project family URL, e.g. `/projects/gamelab`
 */
async function openLoggedOutMobileSharePage(
  page: Page,
  projectUrl: string,
): Promise<void> {
  await createStudent(page);
  await page.goto(projectUrl);
  await page.waitForURL(/\/projects\/(?:applab|gamelab)\/[^/]+\/edit/, {
    timeout: 60_000,
  });

  const shareUrl = deriveShareUrlFromEditUrl(page.url());
  await page.goto('/reset_session');
  await page.goto(shareUrl);
  await page
    .locator('#runButton')
    .waitFor({state: 'attached', timeout: 60_000});
}

test.describe('Share page — logo navigates to /home', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/sharepage_logo.feature
   * Scenario: Select the logo on an applab share page while logged in and visit the homepage
   */
  test(
    'App Lab share page logo navigates to /home',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      await testSharePageLogo(studentPage, '/projects/applab');
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/sharepage_logo.feature
   * Scenario: Select the logo on a playlab share page while logged in and visit the homepage
   */
  test(
    'PlayLab share page logo navigates to /home',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      await testSharePageLogo(studentPage, '/projects/playlab');
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/sharepage_logo.feature
   * Scenario: Select the logo on a gamelab share page while logged in and visit the homepage
   */
  test(
    'Game Lab share page logo navigates to /home',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      await testSharePageLogo(studentPage, '/projects/gamelab');
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/sharepage_logo.feature
   * Scenario: Select the logo on an artist share page while logged in and visit the homepage
   */
  test(
    'Artist share page logo navigates to /home',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      await testSharePageLogo(studentPage, '/projects/artist');
    },
  );
});

test.describe('Share page — mobile logged-out logo absence', () => {
  test.skip(
    ({browserName}) => browserName === 'firefox',
    'Playwright Firefox does not support isMobile contexts. Source: dashboard/test/ui/features/star_labs/sharepage_logo.feature @only_mobile logo scenarios.',
  );
  test.use(IPHONE_12_CONTEXT_OPTIONS);

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/sharepage_logo.feature
   * Scenario: When on an applab share page while logged out on mobile, there is no logo.
   */
  test('App Lab mobile share page has no logo when logged out', async ({
    page,
  }) => {
    await openLoggedOutMobileSharePage(page, '/projects/applab');
    await expect(page.locator('#main_logo')).not.toBeAttached();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/sharepage_logo.feature
   * Scenario: When on a gamelab share page while logged out on mobile, there is no logo.
   */
  test('Game Lab mobile share page has no logo when logged out', async ({
    page,
  }) => {
    await openLoggedOutMobileSharePage(page, '/projects/gamelab');
    await expect(page.locator('#main_logo')).not.toBeAttached();
  });
});
