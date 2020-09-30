import GoogleBlockly from 'blockly/core';

export default class WorkspaceSvg extends GoogleBlockly.WorkspaceSvg {
  addTrashcan() {
    if (!Blockly.Trashcan) {
      throw Error('Missing require for Blockly.Trashcan');
    }
    /** @type {Blockly.Trashcan} */
    this.trashcan = new Blockly.Trashcan(this);
    var svgTrashcan = this.trashcan.createDom();
    this.flyout_.svgGroup_.appendChild(svgTrashcan);
    this.hideTrashcan();
  }
  addUnusedBlocksHelpListener(helpClickFunc) {
    Blockly.mainBlockSpace.addChangeListener(Blockly.Events.disableOrphans);

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
  getToolboxWidth() {
    return Blockly.mainBlockSpace.getMetrics().toolboxWidth;
  }

  // Use visibility:hidden not display:none to hide the trashcan so that it still takes up space, which is important
  // for how the lid opening works.
  hideTrashcan() {
    document
      .querySelectorAll('.blocklyFlyout .blocklyWorkspace')
      .forEach(x => (x.style.visibility = 'visible'));
    document
      .querySelectorAll('.blocklyTrash')
      .forEach(x => (x.style.visibility = 'hidden'));
  }

  isReadOnly() {
    return false; // TODO
  }
  setEnableToolbox() {} // TODO
  showTrashcan() {
    document
      .querySelectorAll('.blocklyFlyout .blocklyWorkspace')
      .forEach(x => (x.style.visibility = 'hidden'));
    document
      .querySelectorAll('.blocklyTrash')
      .forEach(x => (x.style.visibility = 'visible'));
  }
}

WorkspaceSvg.prototype.blockSpaceEditor = {
  blockLimits: {
    blockLimitExceeded: () => false, // TODO
    getLimit: () => {} // TODO
  },
  svgResize: () => {} // TODO
};
