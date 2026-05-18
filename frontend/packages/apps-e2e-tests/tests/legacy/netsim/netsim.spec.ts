import {expect, test} from '@playwright/test';

import {NetSim} from './NetSim';

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

test.describe('Internet Simulator — lobby', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/netsim_lobby.feature
   * Scenario: First user in bit-sending mode can reach lobby
   */
  test('first user in bit-sending mode can reach lobby', async ({page}) => {
    const netsim = new NetSim(page);
    await netsim.gotoLevel(1);
    await netsim.closeInstructionsModal();
    await netsim.enterName('Erin');

    await netsim.lobbyPanel.waitFor({state: 'visible'});
    await expect(netsim.lobbyPanel).toContainText('Erin');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/netsim_lobby.feature
   * Scenario: When not logged in, can connect to a router
   */
  test('anonymous user can connect to a router', async ({page}) => {
    const netsim = new NetSim(page);
    await netsim.gotoLevel(4);
    await netsim.closeInstructionsModal();
    await netsim.lobbyNameInput.waitFor({state: 'visible'});

    await expect(netsim.lobbyNameInput).toBeEnabled();
    await expect(netsim.setNameButton).toBeVisible();
    await expect(netsim.setNameButton).toBeDisabled();
    await expect(netsim.shardSelect).toBeHidden();

    await netsim.enterName('Fred');
    // Webkit under parallel load can be slow to establish the netsim WS
    // connection; 30 s matches the Cucumber implicit wait ceiling.
    await netsim.lobbyPanel.waitFor({state: 'visible', timeout: 30_000});
    await netsim.joinButton.waitFor({state: 'visible', timeout: 30_000});

    await expect(netsim.shardSelectionPanel).toBeHidden();
    // "there is a router in the lobby" — lobby panel shows "Nobody connected yet"
    await expect(netsim.lobbyPanel).toContainText('Nobody connected yet');

    await netsim.joinButton.click();
    await netsim.sendPanel.waitFor({state: 'visible'});

    await expect(netsim.lobby).toBeHidden();
    await expect(netsim.sendPanel).toBeVisible();

    // Suppress the beforeunload confirmation and navigate away cleanly.
    await netsim.suppressBeforeUnload();
    await page.goto(
      '/courses/20-hour/units/1/lessons/11/levels/1?noautoplay=true',
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/netsim_lobby.feature
   * Scenario: NetSim uses the instructions dialog
   */
  test('instructions dialog can be closed and re-opened from side panel', async ({
    page,
  }) => {
    const netsim = new NetSim(page);
    await netsim.gotoLevel(3);

    // Instructions modal appears on load.
    await netsim.modal.waitFor({state: 'visible', timeout: 10_000});
    await expect(netsim.modal).toBeVisible();
    await expect(netsim.modalHeading).toContainText('Puzzle 3 of 5');
    await expect(netsim.modalInstructions).toContainText(
      'Transfer your favicon to a partner',
    );

    await netsim.closeButton.click();
    await netsim.modal.waitFor({state: 'hidden'});
    await expect(netsim.modal).toBeHidden();

    await netsim.enterName('Greg');
    await netsim.joinButton.waitFor({state: 'visible'});
    await netsim.joinButton.click();
    await netsim.tabInstructions.waitFor({state: 'visible'});

    // Clicking a level progress bubble re-opens the instructions modal.
    await netsim.instructionsBubble.click();
    await expect(netsim.modal).toBeVisible();
  });
});
