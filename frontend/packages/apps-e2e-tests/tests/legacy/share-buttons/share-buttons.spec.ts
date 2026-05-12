import {devices, type Page} from '@playwright/test';

import {createStudent} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

const {defaultBrowserType: _defaultBrowserType, ...IPHONE_12_CONTEXT_OPTIONS} =
  devices['iPhone 12'];
void _defaultBrowserType;

/**
 * Open the project share dialog and return the share URL from the copy-button.
 * Clicks .project_share, waits for #sharing-dialog-copy-button, reads its value.
 * Mirrors the Cucumber "I open the project share dialog" + "I save the share URL"
 * steps from project_steps.rb.
 *
 * @param page - Playwright page with an open project page
 * @param bypassHitTargeting - use DOM click when a mobile rotate overlay
 *   intercepts pointer events during share URL setup
 * @returns share URL extracted from the copy-button input value attribute
 */
async function openShareDialogAndGetUrl(
  page: Page,
  bypassHitTargeting = false,
): Promise<string> {
  const dismissWarning = page.locator('#dismiss-icon');
  if (await dismissWarning.isVisible()) {
    await dismissWarning.click({force: true});
  }

  if (bypassHitTargeting) {
    await page.locator('.project_share').first().click({force: true});
  } else {
    await page.locator('.project_share').first().click();
  }
  const copyButton = page.locator('#sharing-dialog-copy-button');
  await expect(copyButton).toBeVisible({timeout: 15_000});
  const url = await copyButton.getAttribute('value');
  if (!url)
    throw new Error('share URL not found in #sharing-dialog-copy-button');
  return url;
}

/**
 * Return the share URL for a project edit URL.
 *
 * Code.org project share pages use the same URL as the edit page without the
 * trailing `/edit` segment. This matches the destination reached by the
 * Cucumber "I navigate to the shared version of my project" helper while
 * avoiding mobile toolbar overlays during setup.
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
 * Create a project in the active page context and open its share page.
 *
 * The visible readiness signal is the project edit URL, followed by
 * `#gameButtons` on the share page.
 *
 * @param page - Playwright page using the phone context
 * @param projectUrl - relative project family URL, e.g. `/projects/gamelab/`
 */
async function openPhoneSharePage(
  page: Page,
  projectUrl: string,
): Promise<void> {
  await createStudent(page);
  await page.goto(projectUrl);
  await page.waitForURL(/\/projects\/(?:gamelab|spritelab)\/[^/]+\/edit/, {
    timeout: 60_000,
  });
  await page.goto(deriveShareUrlFromEditUrl(page.url()));
  await page
    .locator('#gameButtons')
    .waitFor({state: 'visible', timeout: 30_000});
}

/**
 * Share-page "How it Works (View Code)" button visibility.
 *
 * Source: dashboard/test/ui/features/star_labs/share_buttons.feature
 */
test.describe('Share Buttons — "How it Works" button presence', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/share_buttons.feature
   * Scenario: How It Works Button appears for Sprite Lab share page
   */
  test(
    '"How it Works" button present on Sprite Lab share page',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      await studentPage.goto('/projects/spritelab');
      await studentPage
        .locator('#runButton')
        .waitFor({state: 'visible', timeout: 60_000});

      const shareUrl = await openShareDialogAndGetUrl(studentPage);
      await studentPage.goto(shareUrl);

      // #open-workspace is the "How it Works (View Code)" button on p5-lab share pages.
      await expect(studentPage.locator('#open-workspace')).toBeVisible({
        timeout: 30_000,
      });
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/share_buttons.feature
   * Scenario: How It Works Button does not appear for Game Lab share page
   */
  test(
    '"How it Works" button absent on Game Lab share page',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      await studentPage.goto('/projects/gamelab');
      await studentPage
        .locator('#runButton')
        .waitFor({state: 'visible', timeout: 60_000});

      const shareUrl = await openShareDialogAndGetUrl(studentPage);
      await studentPage.goto(shareUrl);

      // Wait for #gameButtons to confirm the Game Lab share page is loaded.
      await studentPage
        .locator('#gameButtons')
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(studentPage.locator('#open-workspace')).not.toBeAttached();
    },
  );
});

test.describe('Share Buttons — phone D-pad presence', () => {
  test.skip(
    ({browserName}) => browserName === 'firefox',
    'Playwright Firefox does not support isMobile contexts. Source: dashboard/test/ui/features/star_labs/share_buttons.feature @only_phone D-pad scenarios.',
  );
  test.use(IPHONE_12_CONTEXT_OPTIONS);

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/share_buttons.feature
   * Scenario: Dpad does not appear for Sprite Lab Share
   */
  test('D-pad is absent on Sprite Lab phone share page', async ({page}) => {
    await openPhoneSharePage(page, '/projects/spritelab/');
    await expect(page.locator('#studio-dpad-rim')).not.toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/share_buttons.feature
   * Scenario: Dpad appears for Game Lab Share
   */
  test('D-pad is present on Game Lab phone share page', async ({page}) => {
    await openPhoneSharePage(page, '/projects/gamelab/');
    await expect(page.locator('#studio-dpad-rim')).toBeVisible();
  });
});
