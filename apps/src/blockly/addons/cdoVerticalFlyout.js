import GoogleBlockly from 'blockly/core';

export default class VerticalFlyout extends GoogleBlockly.VerticalFlyout {
  /**
   * @override
   * This is copied almost entirely from
   * https://github.com/google/blockly/blob/master/core/flyout_vertical.js#L322
   * We override flyoutWidth to constrain it to be at most 40% of the total
   * workspace space.
   * Once https://github.com/google/blockly/issues/5684 is resolved, we can
   * remove this duplicated code and use the API to set the max width of the flyout.
   **/
  reflowInternal_() {
    this.workspace_.scale = this.getFlyoutScale();
    var flyoutWidth = 0;
    var blocks = this.workspace_.getTopBlocks(false);
    for (let i = 0, block; (block = blocks[i]); i++) {
      var width = block.getHeightWidth().width;
      if (block.outputConnection) {
        width -= this.tabWidth_;
      }
      flyoutWidth = Math.max(flyoutWidth, width);
    }
    for (let i = 0, button; (button = this.buttons_[i]); i++) {
      flyoutWidth = Math.max(flyoutWidth, button.width);
    }
    flyoutWidth += this.MARGIN * 1.5 + this.tabWidth_;
    flyoutWidth *= this.workspace_.scale;
    flyoutWidth += Blockly.Scrollbar.scrollbarThickness;

    /* Begin CDO Customization */
    const isMainWorkspace =
      this.targetWorkspace.id === Blockly.getMainWorkspace()?.id;
    if (isMainWorkspace) {
      // Constrain the main workspace flyout to not be wider than 40% of the total workspace space.
      flyoutWidth = Math.min(
        flyoutWidth,
        this.targetWorkspace.getMetricsManager().getSvgMetrics().width * 0.4
      );
    } else {
      if (Blockly.getMainWorkspace()) {
        // Before the modal editor workspace is opened, its svg metrics are unreliable.
        // Assume the flyout should have the same width as the main workspace.
        flyoutWidth = Blockly.getMainWorkspace()
          .getMetricsManager()
          .getFlyoutMetrics().width;
      }
    }
    /* End CDO Customization */

    if (this.width_ !== flyoutWidth) {
      for (let i = 0, block; (block = blocks[i]); i++) {
        if (this.RTL) {
          // With the flyoutWidth known, right-align the blocks.
          var oldX = block.getRelativeToSurfaceXY().x;
          var newX = flyoutWidth / this.workspace_.scale - this.MARGIN;
          if (!block.outputConnection) {
            newX -= this.tabWidth_;
          }
          block.moveBy(newX - oldX, 0);
        }
        if (block.flyoutRect_) {
          this.moveRectToBlock_(block.flyoutRect_, block);
        }
      }
      if (this.RTL) {
        // With the flyoutWidth known, right-align the buttons.
        for (let i = 0, button; (button = this.buttons_[i]); i++) {
          var y = button.getPosition().y;
          var x =
            flyoutWidth / this.workspace_.scale -
            button.width -
            this.MARGIN -
            this.tabWidth_;
          button.moveTo(x, y);
        }
      }

      if (
        this.targetWorkspace.toolboxPosition === this.toolboxPosition_ &&
        this.toolboxPosition_ === Blockly.utils.toolbox.Position.LEFT &&
        !this.targetWorkspace.getToolbox()
      ) {
        // This flyout is a simple toolbox. Reposition the workspace so that (0,0)
        // is in the correct position relative to the new absolute edge (ie
        // toolbox edge).
        this.targetWorkspace.translate(
          this.targetWorkspace.scrollX + flyoutWidth,
          this.targetWorkspace.scrollY
        );
      }

      // Record the width for workspace metrics and .position.
      this.width_ = flyoutWidth;
      this.position();
      this.targetWorkspace.recordDragTargets();
    }
  }

  resize() {
    if (!this.targetWorkspace) {
      return;
    }
    this.reflowInternal_();
    const toolboxWidth = Blockly.cdoUtils.getToolboxWidth();
    document.getElementById('toolbox-header').style.width = toolboxWidth + 'px';
  }
}
