import GoogleBlockly from 'blockly/core';

export default class BlockSvg extends GoogleBlockly.BlockSvg {
  constructor(workspace, prototypeName, opt_id) {
    super(workspace, prototypeName, ++Blockly.uidCounter_); // Use counter instead of randomly generated IDs

    this.canDisconnectFromParent_ = true;
  }

  /**
   * @override
   * Disable overwrite checks
   */
  mixin(mixinObj, opt_disableCheck) {
    super.mixin(mixinObj, true);
  }

  setCanDisconnectFromParent(canDisconnect) {
    this.canDisconnectFromParent_ = canDisconnect;
  }

  dispose() {
    super.dispose();
    this.removeUnusedBlockFrame();
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

  getHexColour() {
    return super.getColour();
  }
}
