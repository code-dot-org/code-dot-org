import GoogleBlockly from 'blockly/core';
import BlockSvgUnused from './blockSvgUnused';

export default class BlockSvg extends GoogleBlockly.BlockSvg {
  constructor(workspace, prototypeName, opt_id) {
    super(workspace, prototypeName, ++Blockly.uidCounter_); // Use counter instead of randomly generated IDs
  }

  addUnusedBlockFrame(helpClickFunc) {
    if (!this.unusedSvg_) {
      this.unusedSvg_ = new BlockSvgUnused(this, helpClickFunc);
    }
    this.unusedSvg_.render(this.svgGroup_);
  }

  isUnused() {
    const isTopBlock = this.previousConnection === null;
    const hasParentBlock = !!this.parentBlock_;
    return !(isTopBlock || hasParentBlock);
  }

  isVisible() {
    // TODO (eventually), but all Flappy blocks are visible, so this won't be a problem
    // until we convert other labs
    return true;
  }

  dispose() {
    super.dispose();
    this.removeUnusedBlockFrame();
  }

  isUserVisible() {
    return false; // TODO - used for EXTRA_TOP_BLOCKS_FAIL feedback
  }

  render(opt_bubble) {
    super.render(opt_bubble);
    this.removeUnusedBlockFrame();
  }

  removeUnusedBlockFrame() {
    if (this.unusedSvg_) {
      this.unusedSvg_.dispose();
      this.unusedSvg_ = null;
    }
  }

  getHexColour() {
    return super.getColour();
  }
}
