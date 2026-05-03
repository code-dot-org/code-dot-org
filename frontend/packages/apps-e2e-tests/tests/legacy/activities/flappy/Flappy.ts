import {type Locator, type Page} from '@playwright/test';

import {flappyLevelUrl} from '../../../shared/urls';
import {LegacyBlocklyLab} from '../../shared/LegacyBlocklyLab';

/**
 * Page Object for the Flappy lab.
 * Flappy uses a standalone /flappy/{N} route and shows its congrats inside a
 * modal rather than the default overlay.
 * Extends LegacyBlocklyLab with Flappy-specific game-event methods.
 */
export class Flappy extends LegacyBlocklyLab {
  /**
   * Triggers Flappy.onPuzzleComplete() — appears after a successful run.
   * Used to advance to the share/congrats dialog without playing the full game.
   */
  readonly rightButton: Locator;

  constructor(page: Page) {
    super(page);
    this.rightButton = page.locator('#rightButton');
  }

  protected override get congratsSelector(): string {
    return '.modal .congrats';
  }

  protected buildLevelUrl(level: number): string {
    return flappyLevelUrl(level);
  }

  /**
   * Simulate a mouse-down (bird flap) event in the Flappy game.
   * Equivalent to: evaluate JavaScript expression "Flappy.onMouseDown(), true;"
   */
  async flap(): Promise<void> {
    await this.page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).Flappy.onMouseDown();
    });
  }

  /**
   * Override the Flappy gravity constant.
   * Setting gravity to a negative value (e.g. -1) makes the bird float upward,
   * passing all pipes and triggering level completion in one flap.
   *
   * @param value - value to assign to Flappy.gravity
   */
  async setGravity(value: number): Promise<void> {
    await this.page.evaluate(v => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).Flappy.gravity = v;
    }, value);
  }

  /**
   * Load blocks from a legacy XML string via __TestInterface.loadBlocks().
   * Use this instead of loadBlocks() when the source is raw Blockly XML
   * (not JSON serialisation format).
   *
   * @param xml - Blockly workspace XML string
   */
  async loadBlocksXml(xml: string): Promise<void> {
    await this.page.evaluate(x => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__TestInterface.loadBlocks(x);
    }, xml);
  }

  /**
   * Return the current Flappy game state integer.
   * 0 = WAITING, 1 = ACTIVE, 2 = ENDING, 3 = OVER.
   */
  async gameState(): Promise<number> {
    return this.page.evaluate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      () => (window as any).Flappy.gameState as number,
    );
  }

  /**
   * Return the current Flappy tick count.
   * A positive value confirms the game loop is running.
   */
  async tickCount(): Promise<number> {
    return this.page.evaluate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      () => (window as any).Flappy.tickCount as number,
    );
  }

  /**
   * Wait until the game loop has fired at least one tick.
   * Use after run() to confirm the Flappy engine is executing before
   * reading game state or tick count.
   */
  async waitForFirstTick(): Promise<void> {
    await this.page.waitForFunction(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      () => ((window as any).Flappy?.tickCount ?? 0) > 0,
    );
  }

  /**
   * Dispatch a mousedown event on the last <rect> in #svgFlappy.
   * Mirrors the Cucumber step "I simulate a mousedown on the svg":
   *   $('svgFlappy rect').last().simulate('mousedown')
   * This is the "tap to flap" input in game-ACTIVE state.
   */
  async simulateFlappyMousedown(): Promise<void> {
    await this.page
      .locator('#svgFlappy rect')
      .last()
      .dispatchEvent('mousedown');
  }

  /**
   * Read the share URL from the copy-button's value attribute.
   * The congrats/share dialog must already be open before calling this.
   */
  async getShareUrl(): Promise<string> {
    const btn = this.page.locator('#sharing-dialog-copy-button');
    await btn.waitFor({state: 'visible'});
    const url = await btn.getAttribute('value');
    if (!url)
      throw new Error('share URL not found in #sharing-dialog-copy-button');
    return url;
  }

  /**
   * Ensure the share dialog is showing the copy-button.
   * If the congrats overlay was dismissed before the share input appeared,
   * re-run through again-button → reset → run → rightButton to reopen it.
   * Mirrors the Cucumber "reopen the congrats dialog unless I see the sharing input" step.
   */
  async ensureShareDialogOpen(): Promise<void> {
    if (await this.page.locator('#sharing-dialog-copy-button').isVisible()) {
      return;
    }
    await this.againButton.click();
    await this.page.locator(this.congratsSelector).waitFor({state: 'hidden'});
    await this.resetButton.click();
    await this.runButton.click();
    await this.rightButton.click();
    await this.page.locator(this.congratsSelector).waitFor({state: 'visible'});
  }
}
