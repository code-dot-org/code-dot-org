import msg from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {frameSizes} from './cdoConstants.js';

export default class BlockSvgFrame {
  constructor(block, text, className, textColor, headerColor) {
    this.block_ = block;
    this.text = text || msg.block();
    this.className = className || 'blocklyFrame';
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
  }

  initChildren() {
    const frameX = -frameSizes.MARGIN_SIDE;
    const frameY = -(frameSizes.MARGIN_TOP + frameSizes.HEADER_HEIGHT);
    // Google Blockly's block ids are randomly generated and can
    // include invalid characters for element ids. Remove everything
    // except alphanumeric characters and whitespace, then collapse
    // multiple adjacent whitespace to single spaces.
    let safeCharBlockId = this.block_.id
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

    var frameTextVerticalPosition = -(
      frameSizes.MARGIN_TOP +
      frameSizes.HEADER_HEIGHT / 2
    );

    this.frameText_ = Blockly.utils.dom.createSvgElement(
      'text',
      {
        class: 'blocklyText',
        style: `font-size: 12pt;fill: ${this.textColor}`,
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
      this.render(this.block_.svgGroup_, this.block_.RTL);
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

  render(svgGroup, isRtl, minWidthAdjustment) {
    if (!svgGroup) {
      return;
    }
    // Remove ourselves from the DOM and calculate the size of our
    // container, then insert ourselves into the container.
    // We do this because otherwise, the value returned by
    // getBoundingClientRect would take our size into account, and we
    // would 'grow' every time render was called.
    this.frameGroup_.remove();
    var groupRect = svgGroup.getBoundingClientRect();
    svgGroup.prepend(this.frameGroup_);

    Blockly.utils.dom.addClass(this.frameGroup_, 'hidden');
    var frameGroup = this.frameGroup_;
    // Trigger the CSS fade-in transition.
    setTimeout(function () {
      Blockly.utils.dom.removeClass(frameGroup, 'hidden');
    }, 0);

    var minWidth =
      this.frameText_.getBoundingClientRect().width + minWidthAdjustment
        ? minWidthAdjustment
        : 0;
    var width =
      Math.max(groupRect.width, minWidth) + 2 * frameSizes.MARGIN_SIDE;

    var height =
      groupRect.height +
      frameSizes.MARGIN_TOP +
      frameSizes.MARGIN_BOTTOM +
      frameSizes.HEADER_HEIGHT;

    // Increase the frame size to the full workspace if it's the modal editor.
    if (this.block_.workspace.id === Blockly.functionEditor.getWorkspaceId()) {
      // Get the height and width of the rendered workspace, not including toolbox
      const viewMetrics = this.block_.workspace
        .getMetricsManager()
        .getViewMetrics();
      // Set the height and width based on the workspace size, unless the block content is bigger.
      width = Math.max(width, viewMetrics.width - frameSizes.MARGIN_SIDE);
      height = Math.max(
        height,
        viewMetrics.height - frameSizes.MARGIN_TOP - frameSizes.MARGIN_BOTTOM
      );
    }
    this.frameClipRect_.setAttribute('width', width);
    this.frameBase_.setAttribute('width', width);
    this.frameBase_.setAttribute('height', height);
    this.frameHeader_.setAttribute('width', width);
    this.frameHeader_.setAttribute('height', height);

    if (isRtl) {
      this.frameClipRect_.setAttribute('x', -width + frameSizes.MARGIN_SIDE);
      this.frameHeader_.setAttribute('x', -width + frameSizes.MARGIN_SIDE);
      this.frameBase_.setAttribute('x', -width + frameSizes.MARGIN_SIDE);
      this.frameText_.setAttribute('x', -width + 2 * frameSizes.MARGIN_SIDE);
    }
  }
}
