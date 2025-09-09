import * as GoogleBlockly from 'blockly/core';

import {ExtendedWorkspaceSvg} from '../types';

export default class VerticalFlyout extends GoogleBlockly.VerticalFlyout {
  /**
   * @override
   * This is copied almost entirely from
   * https://github.com/google/blockly/blob/rc/v12.0.0/core/flyout_vertical.ts#L300
   * We override flyoutWidth to constrain it to be at most 40% of the total
   * workspace space. Later, we resize the flyout's workspace to fill this smaller container.
   * This is necessary to ensure that the delete area doesn't extend into the main workspace.
   * If Blockly adds an API to set the max width of the flyout, we can remove this override.
   **/
  protected override reflowInternal_() {
    this.workspace_.scale = this.getFlyoutScale();
    let flyoutWidth = this.getContents().reduce((maxWidthSoFar, item) => {
      return Math.max(
        maxWidthSoFar,
        item.getElement().getBoundingRectangle().getWidth()
      );
    }, 0);
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

    if (this.getWidth() !== flyoutWidth) {
      if (this.RTL) {
        // With the flyoutWidth known, right-align the flyout contents.
        for (const item of this.getContents()) {
          const oldX = item.getElement().getBoundingRectangle().left;
          const newX =
            flyoutWidth / this.workspace_.scale -
            item.getElement().getBoundingRectangle().getWidth() -
            this.MARGIN -
            this.tabWidth_;
          item.getElement().moveBy(newX - oldX, 0);
        }
      }

      // TODO(#7689): Remove this.
      // Workspace with no scrollbars where this is permanently
      // open on the left.
      // If scrollbars exist they properly update the metrics.
      if (
        !this.targetWorkspace.scrollbar &&
        !this.autoClose &&
        this.targetWorkspace.getFlyout() === this &&
        this.toolboxPosition_ === Blockly.utils.toolbox.Position.LEFT
      ) {
        this.targetWorkspace.translate(
          this.targetWorkspace.scrollX + flyoutWidth,
          this.targetWorkspace.scrollY
        );
      }

      this.width_ = flyoutWidth;

      /* Begin CDO Customization */
      Blockly.svgResize(this.workspace_);
      /* End CDO Customization */

      this.position();
      this.targetWorkspace.resizeContents();
      this.targetWorkspace.recordDragTargets();
    }
  }
}
