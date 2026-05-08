import {type Page} from '@playwright/test';

import {expect, test} from '../../shared/fixtures';

/**
 * Open the project share dialog and return the share URL from the copy-button.
 * Clicks .project_share, waits for #sharing-dialog-copy-button, reads its value.
 * Mirrors the Cucumber "I open the project share dialog" + "I save the share URL"
 * steps from project_steps.rb.
 *
 * @param page - Playwright page with an open project page
 * @returns share URL extracted from the copy-button input value attribute
 */
async function openShareDialogAndGetUrl(page: Page): Promise<string> {
  await page.locator('.project_share').first().click();
  const copyButton = page.locator('#sharing-dialog-copy-button');
  await expect(copyButton).toBeVisible({timeout: 15_000});
  const url = await copyButton.getAttribute('value');
  if (!url)
    throw new Error('share URL not found in #sharing-dialog-copy-button');
  return url;
}

/**
 * Share-page "How it Works (View Code)" button visibility.
 *
 * Source:
 *   dashboard/test/ui/features/star_labs/share_buttons.feature
 *
 * Scenarios 1–2 are ported.  Scenarios 3–4 (@only_phone DPad) are skipped —
 * no phone Playwright project configuration exists.
 */
test.describe('Share Buttons — "How it Works" button presence', () => {
  test(
    '"How it Works" button present on Sprite Lab share page',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      // Source: "How It Works Button appears for Sprite Lab share page"
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

  test(
    '"How it Works" button absent on Game Lab share page',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      // Source: "How It Works Button does not appear for Game Lab share page"
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
