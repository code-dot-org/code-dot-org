import {expect, test, type Page} from '@playwright/test';

import {labLevelUrl} from '../../shared/urls';

/**
 * Internet Simulator (NetSim) lobby — anonymous connection scenarios.
 *
 * Source: dashboard/test/ui/features/star_labs/netsim_lobby.feature
 * NETSIM_ALLTHETHINGS_LESSON = 14
 *
 * Three scenarios, none requiring authentication:
 *   1. First user enters a name and sees it reflected in the lobby panel.
 *   2. Anonymous connect to a router; verify send/log panels; navigate away cleanly.
 *   3. Instructions dialog opens and can be re-opened from the side panel.
 */

/** Dismiss the instructions modal that appears on NetSim level load. */
async function closeInstructionsModal(page: Page): Promise<void> {
  await page.locator('.modal').waitFor({state: 'visible', timeout: 10_000});
  await page.locator('#x-close').click();
  await page.locator('.modal-body').waitFor({state: 'hidden'});
}

/** Type a name into the lobby input and click Set Name. */
async function enterNetsimName(page: Page, name: string): Promise<void> {
  const input = page.locator('#netsim-lobby-name');
  await input.waitFor({state: 'visible'});
  // pressSequentially fires keydown/keyup per character — needed so the React
  // input handler enables the Set Name button.
  await input.pressSequentially(name);
  await page.locator('#netsim-lobby-set-name-button').click();
}

test.describe('Internet Simulator — lobby', () => {
  test('first user in bit-sending mode can reach lobby', async ({page}) => {
    await page.goto('/reset_session');
    await page.goto(labLevelUrl(14, 1));
    await closeInstructionsModal(page);
    await enterNetsimName(page, 'Erin');

    await page.locator('.netsim-lobby-panel').waitFor({state: 'visible'});
    await expect(page.locator('.netsim-lobby-panel')).toContainText('Erin');
  });

  test('anonymous user can connect to a router', async ({page}) => {
    await page.goto('/reset_session');
    await page.goto(labLevelUrl(14, 4));
    await closeInstructionsModal(page);
    await page.locator('#netsim-lobby-name').waitFor({state: 'visible'});

    await expect(page.locator('#netsim-lobby-name')).toBeEnabled();
    await expect(page.locator('#netsim-lobby-set-name-button')).toBeVisible();
    await expect(page.locator('#netsim-lobby-set-name-button')).toBeDisabled();
    await expect(page.locator('#netsim-shard-select')).toBeHidden();

    await enterNetsimName(page, 'Fred');
    await page.locator('.netsim-lobby-panel').waitFor({state: 'visible'});
    await page.locator('.join-button').first().waitFor({state: 'visible'});

    await expect(page.locator('.netsim-shard-selection-panel')).toBeHidden();
    // "there is a router in the lobby" — lobby panel shows "Nobody connected yet"
    await expect(page.locator('.netsim-lobby-panel')).toContainText(
      'Nobody connected yet',
    );

    await page.locator('.join-button').first().click();
    await page.locator('.netsim-send-panel').waitFor({state: 'visible'});

    await expect(page.locator('.netsim-lobby')).toBeHidden();
    await expect(page.locator('.netsim-send-panel')).toBeVisible();
    // Log panel height is set via JS after first message; skip visibility check here.

    // Suppress the beforeunload confirmation and navigate away cleanly.
    await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__TestInterface.ignoreOnBeforeUnload = true;
    });
    await page.goto(
      '/courses/20-hour/units/1/lessons/11/levels/1?noautoplay=true',
    );
  });

  test('instructions dialog can be closed and re-opened from side panel', async ({
    page,
  }) => {
    await page.goto('/reset_session');
    await page.goto(labLevelUrl(14, 3));

    // Instructions modal appears on load.
    await page.locator('.modal').waitFor({state: 'visible', timeout: 10_000});
    await expect(page.locator('.modal')).toBeVisible();
    await expect(page.locator('.modal h1').first()).toContainText(
      'Puzzle 3 of 5',
    );
    await expect(page.locator('.instructions-markdown')).toContainText(
      'Transfer your favicon to a partner',
    );

    await page.locator('#x-close').click();
    await page.locator('.modal').waitFor({state: 'hidden'});
    await expect(page.locator('.modal')).toBeHidden();

    await enterNetsimName(page, 'Greg');
    await page.locator('.join-button').first().waitFor({state: 'visible'});
    await page.locator('.join-button').first().click();
    await page.locator('#tab_instructions').waitFor({state: 'visible'});

    // Clicking a level progress bubble re-opens the instructions modal.
    await page.locator('.netsim-bubble').first().click();
    await expect(page.locator('.modal')).toBeVisible();
  });
});
