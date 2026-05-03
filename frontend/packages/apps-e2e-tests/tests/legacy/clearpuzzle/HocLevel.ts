import {expect} from '@playwright/test';

import {LegacyBlocklyLab} from '../shared/LegacyBlocklyLab';

/**
 * Page Object for an Hour of Code level (/hoc/N).
 *
 * Used to test the clear-puzzle workspace feature, which resets the
 * Blockly workspace to its initial levelbuilder state via
 * #clear-puzzle-header → modal → #confirm-button.
 */
export class HocLevel extends LegacyBlocklyLab {
  protected buildLevelUrl(level: number): string {
    return `/hoc/${level}?noautoplay=true`;
  }

  /**
   * Dispose a block from the workspace via the Blockly JS API.
   * Mirrors delete_block() from blockly_helpers.rb.
   *
   * @param blockId - data-id of the block to remove
   */
  async deleteBlock(blockId: string): Promise<void> {
    await this.page.evaluate((id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const workspace = (window as any).Blockly.getMainWorkspace();
      workspace.getBlockById(id).dispose();
    }, blockId);
  }

  /** Click the clear-puzzle toolbar button to open the confirmation modal. */
  async clearPuzzle(): Promise<void> {
    await this.page.locator('#clear-puzzle-header').click();
  }

  /**
   * Wait for the clear-puzzle confirmation modal and click the confirm button.
   * Must be called after clearPuzzle().
   */
  async confirmClear(): Promise<void> {
    await expect(this.page.locator('.modal')).toBeVisible();
    await this.page.locator('#confirm-button').click();
  }

  /**
   * Assert that childId's SVG element is a direct DOM child of parentId's
   * SVG element. Mirrors "block is child of block" from blockly.rb.
   *
   * @param childId - data-id of the child block
   * @param parentId - expected data-id of the parent element
   */
  async expectBlockIsChildOf(childId: string, parentId: string): Promise<void> {
    const child = this.blockLocator(childId);
    await expect(child.locator('xpath=..')).toHaveAttribute(
      'data-id',
      parentId,
    );
  }
}
