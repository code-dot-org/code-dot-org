import {expect, type Locator, type Page} from '@playwright/test';

import {LegacyBlocklyLab} from './legacy-blockly-lab';

/** Craft (Minecraft) lab — simple, aquatic, designer, and agent variants. */
export class CraftLab extends LegacyBlocklyLab {
  /** Phaser game canvas inside the visualization area. */
  readonly gameCanvas: Locator;

  /** Score display shown in designer variant. */
  readonly scoreDisplay: Locator;

  constructor(page: Page) {
    super(page);
    this.gameCanvas = page.locator('#minecraft-frame canvas');
    this.scoreDisplay = page.locator('.score-display');
  }

  /** Navigate to a craft level by direct level ID. */
  async gotoLevelById(levelId: number): Promise<void> {
    await this.page.goto(`/levels/${levelId}?noautoplay=true`, {
      waitUntil: 'domcontentloaded',
    });
    await this.waitForCraftReady();
  }

  /** Wait for the Phaser game to fully initialize. */
  async waitForCraftReady(): Promise<void> {
    await this.waitForReady();
    await expect(this.gameCanvas).toBeVisible({timeout: 30_000});
  }

  /** Execute a block program by calling the game API directly. */
  async executeApi(calls: string): Promise<void> {
    await this.page.evaluate(apiCalls => {
      const craft = (window as any).Craft;
      const api = craft.gameController.codeOrgAPI;
      const fn = new Function('api', apiCalls);
      fn(api);
    }, calls);
  }

  /** Click Run and wait for execution to finish (success or failure dialog). */
  async runAndWaitForResult(): Promise<void> {
    await this.runButton.click();
    await this.page.waitForFunction(
      () => {
        const craft = (window as any).Craft;
        if (!craft?.gameController) return false;
        const gc = craft.gameController;
        return gc.levelModel?.hasSucceeded || gc.attemptRunning === false;
      },
      {timeout: 30_000},
    );
  }

  /** Check the player position via the game model. */
  async getPlayerPosition(): Promise<{x: number; y: number}> {
    return this.page.evaluate(() => {
      const gc = (window as any).Craft.gameController;
      const pos = gc.levelModel.player.position;
      return {x: pos.x, y: pos.y};
    });
  }

  /** Check whether the level reports success. */
  async hasSucceeded(): Promise<boolean> {
    return this.page.evaluate(() => {
      const gc = (window as any).Craft.gameController;
      return gc.levelModel?.hasSucceeded === true;
    });
  }

  /** Get the current score (designer variant). */
  async getScore(): Promise<number> {
    return this.page.evaluate(() => {
      const gc = (window as any).Craft.gameController;
      return gc.levelModel?.score ?? 0;
    });
  }
}
