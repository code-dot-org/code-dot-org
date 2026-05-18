import {expect, type Page} from '@playwright/test';

import {flappyLevelUrl, labLevelUrl} from '../../shared/urls';
import {LegacyBlocklyLab} from '../shared/LegacyBlocklyLab';

type BlockOffset = {
  x: number;
  y: number;
};

type BlocklyWindow = Window &
  typeof globalThis & {
    Blockly: {
      mainBlockSpace: {
        clear(): void;
      };
    };
    __TestInterface: {
      arrangeBlockPosition(blocksXml: string, options: object): string;
      loadBlocks(blocksXml: string): void;
    };
  };

/**
 * Page Object for the legacy Blockly auto-layout regression levels.
 */
export class BlockLayout extends LegacyBlocklyLab {
  constructor(page: Page) {
    super(page);
  }

  protected buildLevelUrl(level: number): string {
    return flappyLevelUrl(level);
  }

  async gotoFlappyLevel10(): Promise<void> {
    await this.gotoLevel(10);
  }

  async gotoPlayLabLevel4(): Promise<void> {
    await this.navigate(labLevelUrl(5, 4));
  }

  /**
   * Mirrors clear_main_block_space from dashboard/test/ui/features/step_definitions/blockly.rb.
   */
  async clearWorkspace(): Promise<void> {
    await expect
      .poll(async () =>
        this.page.evaluate(() => {
          const win = window as BlocklyWindow;
          return Boolean(win.Blockly?.mainBlockSpace);
        }),
      )
      .toBe(true);

    await this.page.evaluate(() => {
      const win = window as BlocklyWindow;
      win.Blockly.mainBlockSpace.clear();
    });
  }

  /**
   * Run the product's test-only arranger and load the returned XML.
   */
  async loadArrangedBlocksXml(blocksXml: string): Promise<void> {
    await this.page.evaluate((xml: string) => {
      const win = window as BlocklyWindow;
      const arrangedBlocksXml = win.__TestInterface.arrangeBlockPosition(
        xml,
        {},
      );
      win.__TestInterface.loadBlocks(arrangedBlocksXml);
    }, blocksXml);
  }

  /**
   * Assert the block's SVG translate offset matches Cucumber's +/-3px tolerance.
   */
  async expectBlockNearOffset(
    blockId: string,
    expectedX: number,
    expectedY: number,
  ): Promise<void> {
    await expect(this.blockLocator(blockId)).toBeAttached();
    const point = await this.blockOffset(blockId);

    expect(
      Math.abs(point.x - expectedX),
      `${blockId} x offset`,
    ).toBeLessThanOrEqual(3);
    expect(
      Math.abs(point.y - expectedY),
      `${blockId} y offset`,
    ).toBeLessThanOrEqual(3);
  }

  private async blockOffset(blockId: string): Promise<BlockOffset> {
    return this.page.evaluate((id: string) => {
      const block = document.querySelector<SVGGElement>(
        `.blocklySvg [data-id="${id}"]`,
      );
      if (!block) {
        throw new Error(`Blockly block ${id} was not found`);
      }

      const firstTransform = block.transform.baseVal.getItem(0);
      if (firstTransform.type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
        throw new Error(
          `Blockly block ${id} has no leading translate transform`,
        );
      }

      return {
        x: firstTransform.matrix.e,
        y: firstTransform.matrix.f,
      };
    }, blockId);
  }
}
