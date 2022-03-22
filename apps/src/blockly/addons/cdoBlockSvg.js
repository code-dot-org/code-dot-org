import GoogleBlockly from 'blockly/core';
import BlockSvgUnused from './blockSvgUnused';

export default class BlockSvg extends GoogleBlockly.BlockSvg {
  constructor(workspace, prototypeName, opt_id) {
    super(workspace, prototypeName, ++Blockly.uidCounter_); // Use counter instead of randomly generated IDs

    this.canDisconnectFromParent_ = true;
  }

  addUnusedBlockFrame(helpClickFunc) {
    if (!this.unusedSvg_) {
      this.unusedSvg_ = new BlockSvgUnused(this, helpClickFunc);
    }
    this.unusedSvg_.render(this.svgGroup_);
  }

  /**
   * @override
   * Disable overwrite checks
   */
  mixin(mixinObj, opt_disableCheck) {
    super.mixin(mixinObj, true);
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

  setCanDisconnectFromParent(canDisconnect) {
    this.canDisconnectFromParent_ = canDisconnect;
  }

  dispose() {
    super.dispose();
    this.removeUnusedBlockFrame();
  }

  getTitles() {
    let fields = [];
    this.inputList.forEach(input => {
      input.fieldRow.forEach(field => {
        fields.push(field);
      });
    });
    return fields;
  }

  getTitleValue(name) {
    return super.getFieldValue(name);
  }

  isUserVisible() {
    return false; // TODO - used for EXTRA_TOP_BLOCKS_FAIL feedback
  }

  onMouseDown_(e) {
    if (!Blockly.utils.isRightButton(e) && !this.canDisconnectFromParent_) {
      return;
    }
    super.onMouseDown_(e);
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
