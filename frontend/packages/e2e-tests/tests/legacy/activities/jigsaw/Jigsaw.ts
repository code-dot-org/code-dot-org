import {expect, type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../../../shared/urls';
import {LegacyBlocklyLab} from '../../shared/LegacyBlocklyLab';

/** Minimal typed interface for Blockly globals injected into window. */
interface BlocklyWindow {
  Blockly: {
    getMainWorkspace(): BlocklyWorkspace;
    utils: {
      Coordinate: new (x: number, y: number) => unknown;
    };
  };
  appOptions: {
    level: {
      ghost: unknown;
    };
  };
}

interface BlocklyWorkspace {
  getBlockById(id: string): BlocklyBlock | null;
  getAllBlocks(): BlocklyBlock[];
  getMetricsManager(): {getViewMetrics(): BlocklyViewMetrics};
  getToolbox(): {getWidth(): number} | null;
}

interface BlocklyBlock {
  id: string;
  type: string;
  moveTo(coord: unknown): void;
  getBoundingRectangle(): BlocklyRect;
}

interface BlocklyRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface BlocklyViewMetrics {
  left: number;
  top: number;
  width: number;
  height: number;
}

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
   * Move the named block onto the jigsaw ghost slot.
   * Mirrors move_block_to_jigsaw_ghost() from blockly_helpers.rb.
   */
  async moveToGhost(blockId: string): Promise<void> {
    await this.page.evaluate((id: string) => {
      const w = window as unknown as BlocklyWindow;
      const block = w.Blockly.getMainWorkspace().getBlockById(id);
      block?.moveTo(w.appOptions.level.ghost);
    }, blockId);
  }

  /**
   * Move a block to one of the four workspace edges via the Blockly JS API.
   * Mirrors "I move block to (top|left|bottom|right) edge of workspace" from blockly.rb.
   */
  async moveBlockToEdge(
    blockId: string,
    edge: 'left' | 'right' | 'top' | 'bottom',
  ): Promise<void> {
    await this.page.evaluate(
      ({id, edge}: {id: string; edge: string}) => {
        const Blockly = (window as unknown as BlocklyWindow).Blockly;
        const workspace = Blockly.getMainWorkspace();
        const viewMetrics = workspace.getMetricsManager().getViewMetrics();
        const block = workspace.getBlockById(id);
        if (!block) throw new Error(`Block not found: ${id}`);
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
   * Mirrors get_block_absolute_left/top from blockly_helpers.rb.
   */
  async getBlockPosition(blockId: string): Promise<{x: number; y: number}> {
    return this.page.evaluate((id: string) => {
      const workspace = (
        window as unknown as BlocklyWindow
      ).Blockly.getMainWorkspace();
      const block = workspace.getBlockById(id);
      if (!block) throw new Error(`Block not found: ${id}`);
      const rect = block.getBoundingRectangle();
      return {x: rect.left, y: rect.top};
    }, blockId);
  }

  /**
   * True if the block exists and its bounding rectangle overlaps the visible
   * view area by at least 10 px on each side.
   * Mirrors "block is visible in the workspace" from blockly.rb.
   */
  async isBlockVisibleInWorkspace(blockId: string): Promise<boolean> {
    return this.page.evaluate((id: string) => {
      const Blockly = (window as unknown as BlocklyWindow).Blockly;
      const workspace = Blockly.getMainWorkspace();
      const block = workspace.getBlockById(id);
      if (!block) return false;

      const rect = block.getBoundingRectangle();
      const view = workspace.getMetricsManager().getViewMetrics();
      const toolboxWidth = workspace.getToolbox()?.getWidth() ?? 0;
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
   * True if the block still exists in the main workspace.
   * Mirrors "block has not been deleted" from blockly.rb.
   */
  async isBlockPresent(blockId: string): Promise<boolean> {
    return this.page.evaluate((id: string) => {
      const workspace = (
        window as unknown as BlocklyWindow
      ).Blockly.getMainWorkspace();
      return workspace.getAllBlocks().some(b => b.id === id);
    }, blockId);
  }

  /**
   * Count blocks of a given type in the main workspace.
   * Mirrors "the workspace has N blocks of type T" from blockly.rb.
   */
  async countBlocksOfType(blockType: string): Promise<number> {
    return this.page.evaluate((type: string) => {
      const workspace = (
        window as unknown as BlocklyWindow
      ).Blockly.getMainWorkspace();
      return workspace.getAllBlocks().filter(b => b.type === type).length;
    }, blockType);
  }
}
