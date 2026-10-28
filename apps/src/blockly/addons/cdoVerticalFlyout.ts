import * as BlocklyCore from 'blockly/core';

import {ExtendedWorkspaceSvg} from '../types';

// The flyout's widest share of the workspace. A workspace that names a
// width to keep lets the flyout past the share while that much remains.
const MAX_FLYOUT_SHARE = 0.4;

export default class VerticalFlyout extends BlocklyCore.VerticalFlyout {
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
      // Constrain the flyout to a share of the total main workspace space,
      // or to what leaves the workspace its named width, whichever is more.
      // Before the modal editor workspace is opened, its svg metrics are unreliable.
      const total = mainWorkspace?.getMetricsManager().getSvgMetrics().width;
      const keep = (mainWorkspace as ExtendedWorkspaceSvg | undefined)
        ?.workspaceMinWidth;
      flyoutWidth = Math.min(
        flyoutWidth,
        Math.max(total * MAX_FLYOUT_SHARE, keep ? total - keep : 0)
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
