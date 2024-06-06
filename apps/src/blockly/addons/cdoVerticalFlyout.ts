import GoogleBlockly from 'blockly/core';

import {ExtendedWorkspaceSvg} from '../types';

export default class VerticalFlyout extends GoogleBlockly.VerticalFlyout {
  /**
   * @override
   * This is copied almost entirely from
   * https://github.com/google/blockly/blob/master/core/flyout_vertical.js#L322
   * We override flyoutWidth to constrain it to be at most 40% of the total
   * workspace space. Later, we resize the flyout's workspace to fill this smaller container.
   * This is necessary to ensure that the delete area doesn't extend into the main workspace.
   * If Blockly adds an API to set the max width of the flyout, we can remove this override.
   **/
  reflowInternal_() {
    this.workspace_.scale = this.getFlyoutScale();
    let flyoutWidth = 0;
    const blocks = this.workspace_.getTopBlocks(false);
    for (let i = 0, block; (block = blocks[i]); i++) {
      let width = block.getHeightWidth().width;
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
    const mainWorkspace = Blockly.getMainWorkspace();
    const functionEditorWorkspace = Blockly.getFunctionEditorWorkspace();

    if (
      [mainWorkspace, functionEditorWorkspace].includes(
        this.targetWorkspace as ExtendedWorkspaceSvg
      )
    ) {
      // Constrain the flyout to not be wider than 40% of the total main workspace space.
      flyoutWidth = Math.min(
        flyoutWidth,
        // Before the modal editor workspace is opened, its svg metrics are unreliable.
        mainWorkspace?.getMetricsManager().getSvgMetrics().width * 0.4
      );
    }

    /* End CDO Customization */

    if (this.width_ !== flyoutWidth) {
      for (let i = 0, block; (block = blocks[i]); i++) {
        if (this.RTL) {
          // With the flyoutWidth known, right-align the blocks.
          const oldX = block.getRelativeToSurfaceXY().x;
          let newX = flyoutWidth / this.workspace_.scale - this.MARGIN;
          if (!block.outputConnection) {
            newX -= this.tabWidth_;
          }
          block.moveBy(newX - oldX, 0);
        }
        if (this.rectMap_.has(block)) {
          this.moveRectToBlock_(this.rectMap_.get(block)!, block);
        }
      }
      if (this.RTL) {
        // With the flyoutWidth known, right-align the buttons.
        for (let i = 0, button; (button = this.buttons_[i]); i++) {
          const y = button.getPosition().y;
          const x =
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

      /* Begin CDO Customization */
      Blockly.svgResize(this.workspace_);
      /* End CDO Customization */

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
    const header = document.getElementById('toolbox-header');
    if (header) {
      header.style.width = toolboxWidth + 'px';
    }
  }
}
