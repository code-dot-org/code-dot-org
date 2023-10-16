import msg from '@cdo/locale';
import color from '@cdo/apps/util/color';
import BlockSvgFrame from './blockSvgFrame.js';

export default class BlockSvgUnused extends BlockSvgFrame {
  constructor(block) {
    var className = 'blocklyUnusedFrame';
    var text = msg.unusedCode();
    // Use dark text with lighter header fill color
    var textColor = color.black;
    var headerColor = color.lighter_gray;
    super(block, text, className, textColor, headerColor);
  }

  dispose() {
    this.frameGroup_.remove();
    this.frameGroup_ = undefined;
    this.frameClipRect_ = undefined;
    this.frameBase_ = undefined;
    this.frameHeader_ = undefined;
    this.frameText_ = undefined;
  }
}

// Added as a change listener in the wrapper.
// When a block is clicked, dragged or deleted, we remove any "Unused block" frame.
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
