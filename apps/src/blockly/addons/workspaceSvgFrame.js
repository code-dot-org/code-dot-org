import msg from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {frameSizes} from './cdoConstants.js';

export default class WorkspaceSvgFrame {
  constructor(workspace, text, className, textColor, headerColor) {
    this.workspace_ = workspace;
    this.text = text || 'default' || msg.function();
    this.className = className || 'blocklyWorkspaceFrame';
    this.textColor = textColor || color.white;
    this.headerColor = headerColor || color.light_gray;
    this.baseColor = color.lightest_gray;

    this.frameGroup_ = undefined;
    this.frameClipRect_ = undefined;
    this.frameBase_ = undefined;
    this.frameHeader_ = undefined;
    this.frameText_ = undefined;

    this.initChildren();
    this.addBrowserResizeListener();
    this.workspace_.addChangeListener(onWorkspaceChange);
  }

  initChildren() {
    const frameX = this.workspace_.toolbox_.width_ + frameSizes.MARGIN_SIDE / 2;
    const frameY =
      frameSizes.MARGIN_TOP -
      this.workspace_.getMetricsManager().getMetrics().viewTop;
    // Google Blockly's block ids are randomly generated and can
    // include invalid characters for element ids. Remove everything
    // except alphanumeric characters and whitespace, then collapse
    // multiple adjacent whitespace to single spaces.
    let safeCharBlockId = this.workspace_.id
      .replace(/[^\w\s\']|_/g, '')
      .replace(/\s+/g, ' ');

    this.frameGroup_ = Blockly.utils.dom.createSvgElement('g', {
      class: this.className,
    });

    const clip = Blockly.utils.dom.createSvgElement(
      'clipPath',
      {
        id: `frameClip${safeCharBlockId}`,
      },
      this.frameGroup_
    );
    this.frameClipRect_ = Blockly.utils.dom.createSvgElement(
      'rect',
      {
        x: frameX,
        y: frameY,
        height: frameSizes.HEADER_HEIGHT,
      },
      clip
    );

    this.frameBase_ = Blockly.utils.dom.createSvgElement(
      'rect',
      {
        x: frameX,
        y: frameY,
        fill: this.baseColor,
        stroke: this.headerColor,
        rx: 15,
        ry: 15,
      },
      this.frameGroup_
    );

    this.frameHeader_ = Blockly.utils.dom.createSvgElement(
      'rect',
      {
        x: frameX,
        y: frameY,
        fill: this.headerColor,
        rx: 15,
        ry: 15,
        'clip-path': `url(#frameClip${safeCharBlockId})`,
      },
      this.frameGroup_
    );

    var frameTextVerticalPosition = frameY + frameSizes.HEADER_HEIGHT / 2;

    this.frameText_ = Blockly.utils.dom.createSvgElement(
      'text',
      {
        class: 'blocklyText',
        style: `font-size: 12pt;fill: ${this.textColor}`,
        x: frameX + frameSizes.MARGIN_SIDE,
        y: frameTextVerticalPosition,
        'dominant-baseline': 'central',
      },
      this.frameGroup_
    );
    this.frameText_.appendChild(document.createTextNode(this.text));
  }

  addBrowserResizeListener() {
    window.addEventListener('resize', () => {
      // Frame size can depend upon workspace size, so we re-render.
      this.render(this.workspace_.svgGroup_, this.workspace_.RTL);
    });
  }
  getPadding() {
    return {
      top: frameSizes.MARGIN_TOP + frameSizes.HEADER_HEIGHT,
      right: frameSizes.MARGIN_SIDE,
      bottom: frameSizes.MARGIN_BOTTOM,
      left: frameSizes.MARGIN_SIDE,
    };
  }

  dispose() {
    if (this.frameGroup_) {
      this.frameGroup_.remove();
    }
    this.frameGroup_ = undefined;
    this.frameClipRect_ = undefined;
    this.frameBase_ = undefined;
    this.frameHeader_ = undefined;
    this.frameText_ = undefined;
  }

  render() {
    const svgGroup = this.workspace_.svgGroup_;
    const isRtl = this.workspace_.RTL;
    const frameY =
      frameSizes.MARGIN_TOP -
      this.workspace_.getMetricsManager().getMetrics().viewTop;

    this.frameGroup_.remove();
    svgGroup.prepend(this.frameGroup_);

    Blockly.utils.dom.addClass(this.frameGroup_, 'hidden');
    var frameGroup = this.frameGroup_;
    // Trigger the CSS fade-in transition.
    setTimeout(function () {
      Blockly.utils.dom.removeClass(frameGroup, 'hidden');
    }, 0);

    var minWidth = this.frameText_.getBoundingClientRect().width;
    var width =
      Math.max(
        minWidth,
        this.workspace_.getMetricsManager().getMetrics().contentWidth
      ) +
      2 * frameSizes.MARGIN_SIDE;

    var height =
      this.workspace_.getMetricsManager().getMetrics().contentHeight +
      frameSizes.MARGIN_TOP +
      frameSizes.MARGIN_BOTTOM +
      frameSizes.HEADER_HEIGHT;

    // Increase the frame size to the full workspace.
    // Get the height and width of the rendered workspace, not including toolbox
    const viewMetrics = this.workspace_.getMetricsManager().getViewMetrics();
    // Set the height and width based on the workspace size, unless the block content is bigger.
    width = Math.max(width, viewMetrics.width - frameSizes.MARGIN_SIDE);
    height = Math.max(
      height,
      viewMetrics.height - frameSizes.MARGIN_TOP - frameSizes.MARGIN_BOTTOM
    );

    this.frameClipRect_.setAttribute('width', width);
    this.frameClipRect_.setAttribute('y', frameY);
    this.frameBase_.setAttribute('width', width);
    this.frameBase_.setAttribute('height', height);
    this.frameBase_.setAttribute('y', frameY);
    this.frameHeader_.setAttribute('width', width);
    this.frameHeader_.setAttribute('height', height);
    this.frameHeader_.setAttribute('y', frameY);
    this.frameText_.setAttribute('y', frameY + frameSizes.HEADER_HEIGHT / 2);

    if (isRtl) {
      this.frameClipRect_.setAttribute('x', -width + frameSizes.MARGIN_SIDE);
      this.frameHeader_.setAttribute('x', -width + frameSizes.MARGIN_SIDE);
      this.frameBase_.setAttribute('x', -width + frameSizes.MARGIN_SIDE);
      this.frameText_.setAttribute('x', -width + 2 * frameSizes.MARGIN_SIDE);
    }
  }
}
// Added as a change listener in the wrapper.
// When the workspace is updated, we re-render the SVG to re-center it on the content.
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
