import {ToolboxType} from '../constants';

export function getToolboxType() {
  const workspace = Blockly.getMainWorkspace();
  if (workspace.flyout_) {
    return ToolboxType.UNCATEGORIZED;
  } else if (workspace.toolbox_) {
    return ToolboxType.CATEGORIZED;
  } else {
    return ToolboxType.NONE;
  }
}

export function getToolboxWidth() {
  const workspace = Blockly.getMainWorkspace();
  const metrics = workspace.getMetrics();
  switch (getToolboxType()) {
    case ToolboxType.CATEGORIZED:
      return metrics.toolboxWidth;
    case ToolboxType.UNCATEGORIZED:
      return metrics.flyoutWidth;
    case ToolboxType.NONE:
      return 0;
  }
}

export function setHSV(block, h, s, v) {
  block.setColour(Blockly.utils.colour.hsvToHex(h, s, v * 255));
}

export function addUnusedBlocksHelpListener(helpClickFunc) {
  Blockly.bindEvent_(
    Blockly.getMainWorkspace().getCanvas(),
    Blockly.BlockSpace.EVENTS.RUN_BUTTON_CLICKED,
    Blockly.getMainWorkspace(),
    function() {
      this.getTopBlocks().forEach(block => {
        if (block.disabled) {
          block.addUnusedBlockFrame(helpClickFunc);
        }
      });
    }
  );
}
