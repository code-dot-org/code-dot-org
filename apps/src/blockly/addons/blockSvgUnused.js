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
    [
      Blockly.Events.CLICK,
      Blockly.Events.BLOCK_DRAG,
      Blockly.Events.BLOCK_DELETE,
    ].includes(event.type)
  ) {
    const workspace = Blockly.common.getWorkspaceById(event.workspaceId);
    const block = workspace.getBlockById(event.blockId);
    if (!block) {
      return;
    }
    block.removeUnusedBlockFrame();
  }
}

/**
 * Event handler for theme changes in the workspace.
 *
 * This function is added as a change listener to the Blockly workspace. It triggers
 * when a theme change occurs and re-renders the SVG frame. We do this because
 * high contrast themes increase the rendered size of the block.
 * to re-center it on the content.
 *
 * @param {Blockly.Events.Abstract} event - The Blockly event object.
 */
export function onThemeChange(event) {
  if (event.type === Blockly.Events.THEME_CHANGE) {
    const workspace = Blockly.common.getWorkspaceById(event.workspaceId);
    const blocks = workspace.getTopBlocks();
    blocks
      .filter(block => block.unusedSvg_)
      .forEach(block => block.unusedSvg_.render());
  }
}
