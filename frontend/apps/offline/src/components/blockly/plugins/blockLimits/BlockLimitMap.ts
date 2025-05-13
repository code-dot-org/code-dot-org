import * as Blockly from 'blockly/core';

import type {Theme} from '../../types';

import BlockLimitIndicator from './BlockLimitIndicator';

interface ExtendedBlockInfo extends Blockly.utils.toolbox.BlockInfo {
  limit: string;
}

/**
 * This maintains the block limits for levels that want you to only use a
 * certain number of blocks.
 *
 * This also helps track how many of such blocks currently exist within
 * the tracked workspace.
 */
class BlockLimitMap {
  private blockLimitMap: Map<string, number>;
  private blockCountMap: Map<string, number>;
  private blockIndicatorMap: Map<string, BlockLimitIndicator>;
  private theme: Theme;

  /**
   * Constructs the initial block limit map from the toolbox blocks definition.
   */
  constructor(
    toolboxBlocks: Blockly.utils.toolbox.ToolboxItemInfo[],
    theme: Theme,
  ) {
    // Define the blockLimitMap and blockCountMap and map to track the
    // indicator elements on the toolboxes.
    this.blockLimitMap = new Map<string, number>();
    this.blockCountMap = new Map<string, number>();
    this.blockIndicatorMap = new Map<string, BlockLimitIndicator>();
    this.theme = theme;

    // Iterate over each block element
    toolboxBlocks.forEach(blockElement => {
      if ((blockElement as ExtendedBlockInfo).limit) {
        const extendedInfo = blockElement as ExtendedBlockInfo;
        const limit = parseInt(extendedInfo.limit ?? '');

        if (!isNaN(limit)) {
          // Extract type and add to blockLimitMap
          const type = extendedInfo.type;
          if (type) {
            this.blockLimitMap.set(type, limit);
          }
        }
      }
    });

    // Set the count map to 0s
    this.clear();
  }

  /**
   * Returns whether or not the given block type is represented.
   */
  has(blockType: string): boolean {
    return this.blockLimitMap.has(blockType);
  }

  /**
   * Sets the current count for the given block type.
   */
  set(blockType: string, count: number) {
    this.blockCountMap.set(blockType, count);
  }

  /**
   * Increments the current count for the given block type.
   */
  increment(blockType: string) {
    this.set(blockType, this.get(blockType) + 1);
  }

  /**
   * Gets the block count for the given block type.
   */
  get(blockType: string): number {
    return this.blockCountMap.get(blockType) || 0;
  }

  /**
   * Gets the maximum number of blocks for the given type.
   */
  limitFor(blockType: string): number {
    return this.blockLimitMap.get(blockType) || Infinity;
  }

  /**
   * Gets the number of blocks remaining for the given type.
   */
  remainingFor(blockType: string): number {
    return this.limitFor(blockType) - this.get(blockType);
  }

  /**
   * Instantiates, if needed, a block indicator for the given block.
   */
  indicatorFor(
    blockType: string,
    block: Blockly.BlockSvg,
  ): BlockLimitIndicator {
    const key = `${blockType}-${block.id}`;
    const ret = this.blockIndicatorMap.get(key);

    if (!ret) {
      const newIndicator = new BlockLimitIndicator(
        block,
        this.limitFor(blockType),
        this.theme,
      );
      this.blockIndicatorMap.set(key, newIndicator);
      return newIndicator;
    }

    return ret;
  }

  /**
   * Returns the number of limited block types.
   */
  get size(): number {
    return this.blockLimitMap.size;
  }

  /**
   * Clears the block limit counts.
   */
  clear() {
    this.blockCountMap.clear();
    this.blockLimitMap.forEach((_, type) => {
      this.blockCountMap.set(type, 0);
    });
  }
}

export default BlockLimitMap;
