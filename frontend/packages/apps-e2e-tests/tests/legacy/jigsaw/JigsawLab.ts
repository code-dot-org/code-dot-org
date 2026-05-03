import {expect, type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../../shared/urls';
import {LegacyBlocklyLab} from '../shared/LegacyBlocklyLab';

/**
 * Page Object for the Jigsaw lab — lesson 1 of allthethingscourse.
 *
 * Jigsaw hides #runButton immediately after mount, so gotoLevel() waits for
 * the Blockly workspace SVG instead. Puzzles complete automatically when the
 * block is placed in the correct slot; no Run button click is needed.
 * Congrats appears inside a modal, so congratsSelector is overridden.
 */
export class JigsawLab extends LegacyBlocklyLab {
  /** The Blockly SVG workspace, used as a ready signal since #runButton is hidden. */
  readonly workspace: Locator;

  protected override get congratsSelector(): string {
    return '.modal .congrats';
  }

  constructor(page: Page) {
    super(page);
    this.workspace = page.locator('.blocklyWorkspace');
  }

  protected buildLevelUrl(level: number): string {
    return labLevelUrl(1, level);
  }

  /**
   * Navigate to a jigsaw level, bypassing the standard runButton-based ready
   * check. Waits for the Blockly workspace SVG to confirm initialization.
   */
  override async gotoLevel(level: number): Promise<void> {
    const url = this.buildLevelUrl(level);
    await this.page.goto('/reset_session');
    await this.page.goto(url);
    await expect(this.workspace).toBeVisible();
    await this.dismissOptionalOverlays();
    await expect(this.page.locator('.uitest-signincallout')).toBeHidden();
  }

  /**
   * Drag the named block onto the jigsaw ghost slot.
   * Mirrors move_block_to_jigsaw_ghost() from blockly_helpers.rb.
   *
   * @param blockId - Blockly block ID (e.g. 'jigsaw_2A')
   */
  async moveToGhost(blockId: string): Promise<void> {
    await this.page.evaluate((id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const workspace = (window as any).Blockly.getMainWorkspace();
      const block = workspace.getBlockById(id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      block.moveTo((window as any).appOptions.level.ghost);
    }, blockId);
  }

  /**
   * Connect fromId's previous connection to toId's next connection.
   * Mirrors connect_block() from blockly_helpers.rb.
   *
   * @param fromId - block to move (e.g. 'jigsaw_3B')
   * @param toId - target block (e.g. 'jigsaw_3A')
   */
  async connectBlocks(fromId: string, toId: string): Promise<void> {
    await this.page.evaluate(
      ({fromId, toId}: {fromId: string; toId: string}) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const workspace = (window as any).Blockly.getMainWorkspace();
        const blockToMove = workspace.getBlockById(fromId);
        const targetBlock = workspace.getBlockById(toId);
        targetBlock.nextConnection.connect(blockToMove.previousConnection);
      },
      {fromId, toId},
    );
  }
}
