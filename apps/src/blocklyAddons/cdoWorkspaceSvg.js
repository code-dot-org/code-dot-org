import GoogleBlockly from 'blockly/core';

export default class WorkspaceSvg extends GoogleBlockly.WorkspaceSvg {
  addUnusedBlocksHelpListener() {} // TODO
  getAllUsedBlocks() {
    return super.getAllBlocks();
  }
  getToolboxWidth() {
    return Blockly.mainBlockSpace.getMetrics().toolboxWidth;
  }
  isReadOnly() {
    return false; // TODO
  }
  setEnableToolbox() {} // TODO
}

WorkspaceSvg.prototype.blockSpaceEditor = {
  blockLimits: {
    blockLimitExceeded: () => false, // TODO
    getLimit: () => {} // TODO
  }
};
