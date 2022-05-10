import GoogleBlockly from 'blockly/core';

export default class WorkspaceSvg extends GoogleBlockly.WorkspaceSvg {
  addUnusedBlocksHelpListener(helpClickFunc) {
    Blockly.bindEvent_(
      Blockly.mainBlockSpace.getCanvas(),
      Blockly.BlockSpace.EVENTS.RUN_BUTTON_CLICKED,
      Blockly.mainBlockSpace,
      function() {
        this.getTopBlocks().forEach(block => {
          if (block.disabled) {
            block.addUnusedBlockFrame(helpClickFunc);
          }
        });
      }
    );
  }
  getAllUsedBlocks() {
    return super.getAllBlocks().filter(block => !block.disabled);
  }
}
