import {expect, test} from '@playwright/test';

import {Flappy} from '../activities/flappy/Flappy';

/** Flappy workspace XML loaded before sharing — establishes the block structure. */
const FLAPPY_PUZZLE_XML =
  '<xml>' +
  '<block type="flappy_whenClick" deletable="false" id="whenClick">' +
  '<next><block type="flappy_flap_height" id="flapHeight">' +
  '<title name="VALUE">Flappy.FlapHeight.NORMAL</title>' +
  '<next><block type="flappy_playSound" id="playSound">' +
  '<title name="VALUE">"sfx_wing"</title>' +
  '</block></next>' +
  '</block></next>' +
  '</block>' +
  '<block type="when_run" deletable="false">' +
  '<next><block type="flappy_setSpeed">' +
  '<title name="VALUE">Flappy.LevelSpeed.NORMAL</title>' +
  '</block></next>' +
  '</block>' +
  '<block type="flappy_whenCollideObstacle" deletable="false">' +
  '<next><block type="flappy_endGame"></block></next>' +
  '</block>' +
  '<block type="flappy_whenEnterObstacle" deletable="false">' +
  '<next><block type="flappy_incrementPlayerScore"></block></next>' +
  '</block>' +
  '</xml>';

/**
 * Flappy share page — game state and "View Code" redirect.
 *
 * Source: dashboard/test/ui/features/star_labs/sharepage.feature
 * Scenario: Share a flappy game, visit the share page, and visit the workspace
 *
 * Flow:
 *  1. Load Flappy level 10, inject puzzle blocks, trigger share dialog via rightButton.
 *  2. Navigate to the share URL; verify game state transitions on the share page.
 *  3. Use the small-footer "How it Works (View Code)" link to open the workspace.
 *  4. Verify game state transitions again on the workspace page.
 *  5. Assert block parent relationships: flapHeight is child of whenClick, etc.
 */
test.describe('Flappy — share page', () => {
  test('share page game states and workspace block structure', async ({
    page,
  }) => {
    const flappy = new Flappy(page);
    await flappy.gotoLevel(10);

    await flappy.loadBlocksXml(FLAPPY_PUZZLE_XML);

    await flappy.runButton.click();
    await flappy.rightButton.click();
    await flappy.xClose.waitFor({state: 'visible'});

    await flappy.ensureShareDialogOpen();
    const shareUrl = await flappy.getShareUrl();

    await page.goto(shareUrl);
    // Wait for Flappy to initialise on the share page.
    await page.waitForFunction(
      () => typeof (window as any).Flappy !== 'undefined', // eslint-disable-line @typescript-eslint/no-explicit-any
    );
    await flappy.runButton.waitFor({state: 'visible'});

    expect(await flappy.gameState()).toBe(0); // WAITING

    await flappy.runButton.click();
    expect(await flappy.gameState()).toBe(0); // still WAITING — game loop started but no flap

    await flappy.waitForFirstTick();
    expect(await flappy.tickCount()).toBeGreaterThan(0);

    await flappy.simulateFlappyMousedown();
    expect(await flappy.gameState()).toBe(1); // ACTIVE

    // Open the small-footer menu and click "How it Works (View Code)".
    await flappy.footerMoreButton.click();
    await page
      .locator('ul#more-menu')
      .getByText('How it Works (View Code)')
      .click();

    await page.waitForURL('**/edit**');
    // dashboard-history navigation sets history.state to null.
    const historyState = await page.evaluate(() => window.history.state);
    expect(historyState).toBeNull();

    await flappy.codeWorkspace.waitFor({state: 'visible'});

    // Wait for Flappy to reinitialise on the workspace page.
    await page.waitForFunction(
      () => typeof (window as any).Flappy !== 'undefined', // eslint-disable-line @typescript-eslint/no-explicit-any
    );

    expect(await flappy.gameState()).toBe(0); // WAITING on workspace page

    await flappy.runButton.click();
    expect(await flappy.gameState()).toBe(0);

    await flappy.waitForFirstTick();
    expect(await flappy.tickCount()).toBeGreaterThan(0);

    await flappy.simulateFlappyMousedown();
    expect(await flappy.gameState()).toBe(1); // ACTIVE

    // Verify block parent relationships in the workspace SVG.
    const flapHeight = flappy.blockLocator('flapHeight');
    await expect(flapHeight.locator('xpath=..')).toHaveAttribute(
      'data-id',
      'whenClick',
    );

    const playSound = flappy.blockLocator('playSound');
    await expect(playSound.locator('xpath=..')).toHaveAttribute(
      'data-id',
      'flapHeight',
    );
  });
});
