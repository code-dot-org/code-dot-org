import msg from '@cdo/locale';
import color from '@cdo/apps/util/color';
import BlockSvgFrame from './blockSvgFrame.js';

/**
 * Represents an SVG frame specifically designed for unused blocks.
 * These frames use different style rules and are removed when the block is touched.
 */
export default class BlockSvgUnused extends BlockSvgFrame {
  /**
   * Constructs an svg frame for an unused block.
   * @param {Element} block - The unused block element associated with the frame.
   */
  constructor(block) {
    var className = 'blocklyUnusedFrame';
    var text = msg.unusedCode();
    // Use dark text with lighter header fill color
    var textColor = color.black;
    var headerColor = color.lighter_gray;
    super(block, text, className, textColor, headerColor);
  }
}

/**
 * Event handler for block click, drag, or delete events.
 * Removes the "Unused block" frame when a block is touched.
 * @param {Object} event - The Blockly event object.
 */
export function onBlockClickDragDelete(event) {
  if (
    event.type === Blockly.Events.CLICK ||
    event.type === Blockly.Events.BLOCK_DRAG ||
    event.type === Blockly.Events.BLOCK_DELETE
  ) {
    const workspace = Blockly.common.getWorkspaceById(event.workspaceId);
    const block = workspace.getBlockById(event.blockId);
    if (!block) {
      return;
    }
    block.removeUnusedBlockFrame();
  }
}
