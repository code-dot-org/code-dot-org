import {type Page} from '@playwright/test';

import {expect, test} from '../../shared/fixtures';
import {dismissLoginReminder} from '../../shared/ui';

/**
 * Callouts — qtip2 tooltip overlays on Blockly/HoC levels.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/callouts.feature
 *
 * Anonymous; no authentication required.
 * The @single_session Cucumber tag means scenarios share a browser session;
 * here each test uses a fresh page but callout state is session-local so
 * "show once" behavior is covered in a single test with two navigations.
 */

const LESSON2_L7 =
  '/courses/allthethingscourse/units/1/lessons/2/levels/7?noautoplay=true&show_callouts=1';

/**
 * Returns the locator for the Nth callout container (0-based).
 * Callouts render as `.cdo-qtips` elements in document order.
 */
function callout(page: Page, index: number) {
  return page.locator('.cdo-qtips').nth(index);
}

// ─── Scenario Outline: correct content, dismissable via target element ────────

const TARGET_DISMISS_CASES = [
  {
    url: '/courses/allthethingscourse/units/1/lessons/2/levels/7?noautoplay=true&show_callouts=1',
    calloutId: 0,
    text: 'After snapping all the blocks together, press "Run" to start your program.',
    closeTarget: '#runButton',
  },
  {
    url: '/courses/allthethingscourse/units/1/lessons/2/levels/7?noautoplay=true&show_callouts=1',
    calloutId: 1,
    text: 'Click here to see the code for the program you’re making',
    closeTarget: '#show-code-header',
  },
  {
    url: '/hoc/1?noautoplay=true',
    calloutId: 1,
    text: 'Hit “Run” to try your program',
    closeTarget: '#runButton',
  },
  {
    url: '/hoc/1?noautoplay=true',
    calloutId: 0,
    text: 'Drag a “move” block and snap it below the other block',
    closeTarget: "[data-id='moveForward']",
  },
  {
    url: '/hoc/14?noautoplay=true',
    calloutId: 0,
    text: 'Click here to see the code for the program you’re making',
    closeTarget: '#show-code-header',
  },
] as const;

test.describe('Callouts — target-element dismissal', () => {
  for (const {url, calloutId, text, closeTarget} of TARGET_DISMISS_CASES) {
    test(`callout ${calloutId} on ${new URL(url, 'http://x').pathname} has correct text and is dismissed by target`, async ({
      page,
    }) => {
      await page.goto(url);
      await page
        .locator('#runButton, .uitest-lab-container')
        .first()
        .waitFor({state: 'visible', timeout: 30_000});

      await expect(callout(page, calloutId)).toBeVisible();
      await expect(callout(page, calloutId)).toContainText(text);

      await page.locator(closeTarget).click();
      await callout(page, calloutId).waitFor({state: 'hidden'});
    });
  }
});

// ─── Scenario Outline: dismissable via x-button ───────────────────────────────

const X_BUTTON_CASES = [
  {
    url: '/courses/allthethingscourse/units/1/lessons/3/levels/7?noautoplay=true&show_callouts=1',
    calloutId: 0,
    text: "You have all the same blocks but they've now been arranged in categories",
  },
] as const;

test.describe('Callouts — x-button dismissal', () => {
  for (const {url, calloutId, text} of X_BUTTON_CASES) {
    test(
      `callout ${calloutId} on ${new URL(url, 'http://x').pathname} dismissed via x-button`,
      {tag: '@no_mobile'},
      async ({page}) => {
        await page.goto(url);
        await page
          .locator('#runButton, .uitest-lab-container')
          .first()
          .waitFor({state: 'visible', timeout: 30_000});
        await dismissLoginReminder(page);

        await expect(callout(page, calloutId)).toBeVisible();
        await expect(callout(page, calloutId)).toContainText(text);

        // Close via the x-button inside the callout container.
        await callout(page, calloutId).locator('> div').nth(2).click();
        await callout(page, calloutId).waitFor({state: 'hidden'});
      },
    );
  }
});

// ─── Modal ordering ───────────────────────────────────────────────────────────

test('callout 0 is visible on initial load', async ({page}) => {
  await page.goto(LESSON2_L7);
  await page.locator('#runButton').waitFor({state: 'visible', timeout: 30_000});
  await expect(callout(page, 0)).toBeVisible();
});

// ─── Closing multiple callouts using the x-button ────────────────────────────

test(
  'closing callout 1 leaves callout 0 visible; closing callout 0 hides it',
  {tag: '@no_mobile'},
  async ({page}) => {
    await page.goto(LESSON2_L7);
    await page
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 30_000});
    await dismissLoginReminder(page);

    await expect(page.locator('.tooltip-x-close').first()).toBeVisible();
    await expect(callout(page, 0)).toBeVisible();
    await expect(callout(page, 1)).toBeVisible();

    // Close callout 1 — callout 0 stays.
    await callout(page, 1).locator('> div').nth(2).click();
    await callout(page, 1).waitFor({state: 'hidden'});
    await expect(callout(page, 0)).toBeVisible();

    // Close callout 0.
    await callout(page, 0).locator('> div').nth(2).click();
    await callout(page, 0).waitFor({state: 'hidden'});
  },
);

// ─── Only show a callout once after it has been seen ─────────────────────────

test('callout shown on first visit is absent on second visit (same session)', async ({
  page,
}) => {
  // URL without show_callouts=1 uses normal display logic.
  const url =
    '/courses/allthethingscourse/units/1/lessons/2/levels/7?noautoplay=true';

  // First visit: callout exists.
  await page.goto(url);
  await page.locator('#runButton').waitFor({state: 'visible', timeout: 30_000});
  await expect(callout(page, 0)).toBeAttached();

  // Second visit (same session): callout is gone.
  await page.goto(url);
  await page.locator('#runButton').waitFor({state: 'visible', timeout: 30_000});
  await expect(callout(page, 0)).not.toBeAttached();
});

// ─── Show Code dialog is in front of callout (z-index ordering) ──────────────

test(
  'Show Code dialog modal is rendered in front of callout',
  {tag: '@no_mobile'},
  async ({page}) => {
    await page.goto(LESSON2_L7);
    await page
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 30_000});
    await dismissLoginReminder(page);

    await page.locator('#show-code-header').click();
    await page.locator('.modal-backdrop').waitFor({state: 'visible'});

    const backdropZ = await page
      .locator('.modal-backdrop')
      .evaluate(el => parseInt(window.getComputedStyle(el).zIndex) || 0);
    const qtipZ = await page
      .locator('#qtip-0')
      .evaluate(el => parseInt(window.getComputedStyle(el).zIndex) || 0);

    expect(backdropZ).toBeGreaterThan(qtipZ);
  },
);
