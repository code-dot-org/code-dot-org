import GoogleBlockly from 'blockly/core';

export default class WorkspaceSvg extends GoogleBlockly.WorkspaceSvg {
  /** Add trashcan to flyout instead of block canvas
   * @override
   */
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
  traceOn() {} // TODO
}

WorkspaceSvg.prototype.blockSpaceEditor = {
  blockLimits: {
    blockLimitExceeded: () => false, // TODO
    getLimit: () => {} // TODO
  },
  svgResize: () => {} // TODO
};

/** Force content to start in top-left corner, not scroll in all directions.
 * @override
 */
WorkspaceSvg.getContentDimensionsBounded_ = function(ws, svgSize) {
  const content = Blockly.WorkspaceSvg.getContentDimensionsExact_(ws);

  // View height and width are both in pixels, and are the same as the SVG size.
  const containerWidth = svgSize.width;
  const containerHeight = svgSize.height;

  // Add extra vertical space beneath the last block
  const extraVerticalSpace = 100;
  content.bottom += extraVerticalSpace;

  // Workspace height is either the length of the blocks or the height of the container,
  // whichever is greater.
  const height = Math.max(content.bottom, containerHeight);

  const dimensions = {
    left: 0,
    top: 0,
    height: height,
    width: containerWidth // No horizontal scroll
  };
  return dimensions;
};
