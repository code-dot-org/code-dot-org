import msg from '@cdo/locale';
import {frameSizes} from './cdoConstants.js';
import SvgFrame from './svgFrame.js';

/**
 * Represents an SVG frame specifically designed for workspaces.
 * Created for the modal function editor, these frames fill the size of the
 * visible workspace, or surround the workspace content, whichever is greater.
 */
export default class WorkspaceSvgFrame extends SvgFrame {
  /**
   * Constructs a WorkspaceSvgFrame instance for a workspace.
   * @param {Workspace} workspace - The workspace associated with the frame.
   * @param {string} text - The text to display in the frame.
   * @param {string} className - The CSS class name for styling.
   * @param {string} textColor - The color for the frame's text.
   * @param {string} headerColor - The color for the frame's header.
   */
  constructor(workspace, text, className, textColor, headerColor) {
    className = className || 'blocklyWorkspaceFrame';
    text = text || msg.function();
    super(workspace, text, className, textColor, headerColor);

    const frameX = this.element_.toolbox_.width_ + frameSizes.MARGIN_SIDE / 2;
    const frameY =
      frameSizes.MARGIN_TOP -
      this.element_.getMetricsManager().getMetrics().viewTop;
    super.initChildren(frameX, frameY);
    this.addBrowserResizeListener();
    this.element_.addChangeListener(onWorkspaceChange);
  }

  /**
   * Adds a browser resize listener to re-render the frame on resize.
   * Resizing the browser window also resizes the visible workspace area,
   * so we want to resize the frame as well.
   */
  addBrowserResizeListener() {
    window.addEventListener('resize', () => {
      // Frame size can depend upon workspace size, so we re-render.
      this.render(this.element_.svgGroup_, this.element_.RTL);
    });
  }

  /**
   * Overrides the standard render to create a frame within the element, rather than around it.
   */
  render() {
    var minWidth = this.frameText_.getBoundingClientRect().width;
    var width =
      Math.max(
        minWidth,
        this.element_.getMetricsManager().getMetrics().contentWidth
      ) +
      2 * frameSizes.MARGIN_SIDE;

    var height =
      this.element_.getMetricsManager().getMetrics().contentHeight +
      frameSizes.MARGIN_TOP +
      frameSizes.MARGIN_BOTTOM +
      frameSizes.HEADER_HEIGHT;
    // Increase the frame size to the full workspace.
    // Get the height and width of the rendered workspace, not including toolbox
    const viewMetrics = this.element_.getMetricsManager().getViewMetrics();
    // Set the height and width based on the workspace size, unless the block content is bigger.
    width = Math.max(width, viewMetrics.width - frameSizes.MARGIN_SIDE);
    height = Math.max(
      height,
      viewMetrics.height - frameSizes.MARGIN_TOP - frameSizes.MARGIN_BOTTOM
    );
    super.render(width, height);

    const frameY =
      frameSizes.MARGIN_TOP -
      // Get top-edge of the visible portion of the workspace
      this.element_.getMetricsManager().getMetrics().viewTop;

    // Move the workspace frame up as the user scrolls down
    this.frameClipRect_.setAttribute('y', frameY);
    this.frameBase_.setAttribute('y', frameY);
    this.frameHeader_.setAttribute('y', frameY);
    this.frameText_.setAttribute('y', frameY + frameSizes.HEADER_HEIGHT / 2);
  }
}
/**
 * Event handler for changes in the workspace.
 *
 * This function is added as a change listener to the Blockly workspace. It triggers
 * when certain types of workspace events occur and re-renders the SVG frame
 * to re-center it on the content.
 *
 * @param {Blockly.Events.Abstract} event - The Blockly event object.
 */
function onWorkspaceChange(event) {
  if (
    [
      Blockly.Events.DELETE,
      Blockly.Events.MOVE,
      Blockly.Events.THEME_CHANGE,
      Blockly.Events.VIEWPORT_CHANGE,
    ].includes(event.type)
  ) {
    const workspace = Blockly.common.getWorkspaceById(event.workspaceId);
    const svgFrame = workspace.svgFrame_;
    svgFrame.render();
  }
}
