import {type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../../../shared/urls';
import {LegacyBlocklyLab} from '../../shared/LegacyBlocklyLab';
import {waitForStableVisualLayout} from '../../shared/visualReadiness';

/**
 * Page Object for the Bounce lab — lesson 1 of the events course.
 * Extends LegacyBlocklyLab with keyboard helpers and the freeplay finish button.
 */
export class Bounce extends LegacyBlocklyLab {
  /** Finish button shown in freeplay mode after pressing Run. */
  readonly finishButton: Locator;

  constructor(page: Page) {
    super(page);
    this.finishButton = page.locator('#finishButton');
  }

  protected buildLevelUrl(level: number): string {
    return labLevelUrl(1, level, 'events');
  }

  /**
   * Press and hold a keyboard key for the duration of the current assertion.
   * Call releaseKey() with the same name when done.
   *
   * @param key - Playwright key name (e.g. 'ArrowLeft', 'ArrowUp')
   */
  async holdKey(key: string): Promise<void> {
    await this.page.keyboard.down(key);
  }

  /**
   * Wait for Bounce's game, instructions, and Blockly panes to reach their
   * post-overlay visual layout before taking a screenshot.
   */
  async expectInitialVisualReady(): Promise<void> {
    await this.runButton.waitFor({state: 'visible', timeout: 30_000});
    await this.instructionsPanel.waitFor({state: 'visible', timeout: 30_000});
    await this.page.locator('#svgBounce').waitFor({
      state: 'visible',
      timeout: 30_000,
    });
    await this.page.locator('#overlay').waitFor({
      state: 'hidden',
      timeout: 30_000,
    });

    await this.page.waitForFunction(
      () => {
        const instructions = document.querySelector('.csf-top-instructions');
        const workspace = document.querySelector('.blocklySvg');
        const bounce = document.querySelector('#svgBounce');
        if (!instructions || !workspace || !bounce) return false;

        const instructionsRect = instructions.getBoundingClientRect();
        const workspaceRect = workspace.getBoundingClientRect();
        const bounceRect = bounce.getBoundingClientRect();

        return (
          instructionsRect.height > 80 &&
          instructionsRect.height < 130 &&
          workspaceRect.top > instructionsRect.bottom &&
          bounceRect.width >= 240 &&
          bounceRect.height >= 240
        );
      },
      undefined,
      {timeout: 30_000},
    );

    await waitForStableVisualLayout(this.page, [
      '#svgBounce',
      '.csf-top-instructions',
      '.blocklySvg',
      '.blocklyBlockCanvas',
    ]);
  }

  /**
   * Release a previously held keyboard key.
   *
   * @param key - Playwright key name matching the one passed to holdKey()
   */
  async releaseKey(key: string): Promise<void> {
    await this.page.keyboard.up(key);
  }

  /** Click the freeplay finish button to submit the open-ended level. */
  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
