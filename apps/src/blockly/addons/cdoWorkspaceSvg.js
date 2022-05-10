import GoogleBlockly from 'blockly/core';

export default class WorkspaceSvg extends GoogleBlockly.WorkspaceSvg {
  getAllUsedBlocks() {
    return super.getAllBlocks().filter(block => !block.disabled);
  }
}
