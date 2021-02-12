import GoogleBlockly from 'blockly/core';

export default class BlockDragSurfaceSvg extends GoogleBlockly.BlockDragSurfaceSvg {
  /**
   * @override
   * Add blue background (debugging only)
   * add wheel listener
   */
  createDom() {
    super.createDom();
    this.SVG_.setAttribute('style', 'background: skyblue');
    Blockly.bindEventWithChecks_(this.SVG_, 'wheel', this, this.onMouseWheel_);
  }

  // Listen for mouse wheel events and pass through to the main workspace
  onMouseWheel_(e) {
    Blockly.mainBlockSpace.onMouseWheel_(e);
  }
}
