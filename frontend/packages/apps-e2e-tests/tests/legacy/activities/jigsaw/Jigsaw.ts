import {expect, type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../../../shared/urls';
import {LegacyBlocklyLab} from '../../shared/LegacyBlocklyLab';

/**
 * Page Object for the Jigsaw lab — lesson 1 of allthethingscourse.
 *
 * Jigsaw hides #runButton immediately after mount, so waitForInitialLoad()
 * and waitForReady() are overridden to use the Blockly workspace SVG instead.
 * Puzzles complete automatically when the block lands in the correct slot;
 * no Run button click is needed. Congrats appears inside a modal.
 */
export class Jigsaw extends LegacyBlocklyLab {
  /** The Blockly SVG workspace — visible once the lab is initialized. */
  readonly workspace: Locator;

  /** Blank jigsaw tile image — `img[src*="jigsaw/blank.png"]`. */
  readonly blankImage: Locator;

  protected override get congratsSelector(): string {
    return '.modal .congrats';
  }

  constructor(page: Page) {
    super(page);
    this.workspace = page.locator('.blocklyWorkspace');
    this.blankImage = page.locator('img[src*="jigsaw/blank.png"]');
  }

  protected buildLevelUrl(level: number): string {
    return labLevelUrl(1, level);
  }

  protected override async waitForInitialLoad(): Promise<void> {
    await expect(this.workspace).toBeVisible();
  }

  override async waitForReady(): Promise<void> {
    await expect(this.workspace).toBeVisible();
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
   * Move a block to one of the four workspace edges via the Blockly JS API.
   * Mirrors "I move block to (top|left|bottom|right) edge of workspace" from
   * blockly.rb: calculates position from viewMetrics so half the block's
   * dimension hangs past the boundary, then calls block.moveTo().
   *
   * @param blockId - Blockly block ID (e.g. 'jigsaw_2A')
   * @param edge - which edge to move toward
   */
  async moveBlockToEdge(
    blockId: string,
    edge: 'left' | 'right' | 'top' | 'bottom',
  ): Promise<void> {
    await this.page.evaluate(
      ({id, edge}) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Blockly = (window as any).Blockly;
        const workspace = Blockly.getMainWorkspace();
        const viewMetrics = workspace.getMetricsManager().getViewMetrics();
        const block = workspace.getBlockById(id);
        const boundingRect = block.getBoundingRectangle();

        const blockWidth = boundingRect.right - boundingRect.left;
        const blockHeight = boundingRect.bottom - boundingRect.top;

        let x: number;
        let y: number;

        switch (edge) {
          case 'left':
            x = viewMetrics.left - blockWidth / 2;
            y = boundingRect.top;
            break;
          case 'right':
            x = viewMetrics.left + viewMetrics.width - blockWidth / 2;
            y = boundingRect.top;
            break;
          case 'top':
            x = boundingRect.left;
            y = viewMetrics.top - blockHeight / 2;
            break;
          case 'bottom':
          default:
            x = boundingRect.left;
            y = viewMetrics.top + viewMetrics.height - blockHeight / 2;
            break;
        }

        block.moveTo(new Blockly.utils.Coordinate(x, y));
      },
      {id: blockId, edge},
    );
  }

  /**
   * Return workspace-coordinate position of a block's top-left corner.
   *
   * @param blockId - Blockly block ID
   */
  async getBlockPosition(blockId: string): Promise<{x: number; y: number}> {
    return this.page.evaluate((id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const workspace = (window as any).Blockly.getMainWorkspace();
      const block = workspace.getBlockById(id);
      const rect = block.getBoundingRectangle();
      return {x: rect.left, y: rect.top};
    }, blockId);
  }

  /**
   * True if the block exists and its bounding rectangle overlaps the visible
   * view area by at least 10 px on each side.
   * Mirrors the Cucumber "block is visible in the workspace" step from
   * blockly.rb (blockBottom > viewTop+margin, etc.).
   *
   * @param blockId - Blockly block ID
   */
  async isBlockVisibleInWorkspace(blockId: string): Promise<boolean> {
    return this.page.evaluate((id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Blockly = (window as any).Blockly;
      const workspace = Blockly.getMainWorkspace();
      const block = workspace.getBlockById(id);
      if (!block) return false;

      const rect = block.getBoundingRectangle();
      const view = workspace.getMetricsManager().getViewMetrics();
      const toolboxWidth = workspace.getToolbox()
        ? workspace.getToolbox().getWidth()
        : 0;
      const margin = 10;

      return (
        rect.bottom > view.top + margin &&
        rect.top < view.top + view.height - margin &&
        rect.left < view.left + view.width - margin &&
        rect.right > view.left + toolboxWidth + margin
      );
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
