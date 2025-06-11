import * as Blockly from 'blockly/core';

import {frameSizes} from '@/blockly/constants';

import SvgFrame from './SvgFrame';

/**
 * Represents an SVG frame specifically designed for blocks, rather than workspaces.
 */
export default class BlockSvgFrame extends SvgFrame {
  /**
   * Constructs an svg frame for a block, such as a function definition.
   */
  constructor(
    block: Blockly.BlockSvg,
    text: string | undefined,
    className: string | undefined,
    getColor: () => string,
  ) {
    text = text || 'Block';
    className = className || 'blockFrame';
    super(block, text, className, getColor);

    const frameX = -frameSizes.MARGIN_SIDE;
    const frameY = -(frameSizes.MARGIN_TOP + frameSizes.BLOCK_HEADER_HEIGHT);
    super.initChildren(frameX, frameY);
  }
}
