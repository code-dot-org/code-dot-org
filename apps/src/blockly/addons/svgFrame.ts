import {BlockSvg, WorkspaceSvg} from 'blockly';

import {commonI18n} from '@cdo/apps/types/locale';
import color from '@cdo/apps/util/color';

import {frameSizes} from './cdoConstants';

/**
 * Represents an SVG frame element, used for Blockly block elements.
 */
export default class SvgFrame {
  protected element_: BlockSvg | WorkspaceSvg;
  protected text: string;
  protected className: string;
  protected getColor: () => string;
  protected headerColor: string;
  protected baseColor: string;
  protected textColor: string;
  protected headerHeight: number;
  protected fontSize: number;
  protected frameGroup_: SVGElement | undefined;
  protected frameClipRect_: SVGElement | undefined;
  protected frameBase_: SVGElement | undefined;
  protected frameHeader_: SVGElement | undefined;
  protected frameText_: SVGElement | undefined;

  /**
   * Constructs an SvgFrame instance.
   * @param {Element} element - The block or workspace associated with the frame.
   * @param {string} [text] - The text to display in the frame.
   * @param {string} [className] - The CSS class name for styling.
   * @param {Function} [getColor] - Get the color for the frame's header. This function should return a color value.
   * @param {number} [headerHeight] - An optional override for the header size, used for workspace frames.
   * @param {number} [fontSize] - An optional override for the size of the header text.
   */
  constructor(
    element: BlockSvg | WorkspaceSvg,
    text: string | undefined,
    className: string | undefined,
    getColor: () => string,
    headerHeight?: number,
    fontSize?: number
  ) {
    this.element_ = element;
    this.text = text || commonI18n.block();
    this.className = className || 'svgFrame';
    this.getColor = getColor;
    this.headerColor = this.getColor() || color.light_gray;
    this.baseColor = getBaseColor(this.headerColor);
    this.textColor = color.white;
    this.headerHeight = headerHeight || frameSizes.BLOCK_HEADER_HEIGHT;
    this.fontSize = fontSize || 12;

    this.frameGroup_ = undefined;
    this.frameClipRect_ = undefined;
    this.frameBase_ = undefined;
    this.frameHeader_ = undefined;
    this.frameText_ = undefined;
  }

  dispose() {
    this.frameGroup_?.remove();
    this.frameGroup_ = undefined;
    this.frameClipRect_ = undefined;
    this.frameBase_ = undefined;
    this.frameHeader_ = undefined;
    this.frameText_ = undefined;
  }

  initChildren(frameX: number, frameY: number) {
    // Google Blockly's block ids are randomly generated and can
    // include invalid characters for element ids. Remove everything
    // except alphanumeric characters and whitespace, then collapse
    // multiple adjacent whitespace to single spaces.
    const safeCharBlockId = this.element_.id
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
        height: this.headerHeight,
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
        rx: 4,
        ry: 4,
      },
      this.frameGroup_
    );

    this.frameHeader_ = Blockly.utils.dom.createSvgElement(
      'rect',
      {
        x: frameX,
        y: frameY,
        fill: this.headerColor,
        rx: 4,
        ry: 4,
        'clip-path': `url(#frameClip${safeCharBlockId})`,
      },
      this.frameGroup_
    );

    const frameTextVerticalPosition = frameY + this.headerHeight / 2;

    this.frameText_ = Blockly.utils.dom.createSvgElement(
      'text',
      {
        class: 'blocklyText',
        style: `font-size: ${this.fontSize}pt;fill: ${this.textColor}`,
        x: frameX + frameSizes.MARGIN_SIDE,
        y: frameTextVerticalPosition,
        'dominant-baseline': 'central',
      },
      this.frameGroup_
    );
    this.frameText_.appendChild(document.createTextNode(this.text));
    if (this.element_.RTL) {
      // Place frame text on right side of header.
      this.frameText_?.setAttribute(
        'x',
        `${-this.frameText_?.getBoundingClientRect().width}`
      );
    }
  }

  getPadding() {
    return {
      top: frameSizes.MARGIN_TOP + this.headerHeight,
      right: frameSizes.MARGIN_SIDE,
      bottom: frameSizes.MARGIN_BOTTOM,
      left: frameSizes.MARGIN_SIDE,
    };
  }

  /**
   * Render the frame with an optional width and height. If args are unspecified,
   * frame will be rendered based on the size of svg rectangle, plus margins.
   * @param {number} [width] - The optional width of the frame.
   * @param {number} [height] - The optional height of the frame.
   */
  render(width?: number, height?: number) {
    if (
      !this.frameGroup_ ||
      !this.frameClipRect_ ||
      !this.frameBase_ ||
      !this.frameHeader_ ||
      !this.frameText_
    ) {
      // If we haven't initialized our children yet, do nothing.
      return;
    }
    // In BlockSvg the method to get svgGroup is getSvgRoot()
    // In WorkspaceSvg it's getSvgGroup()
    const svgGroup =
      'getSvgRoot' in this.element_
        ? this.element_.getSvgRoot()
        : this.element_.getSvgGroup();
    const isRtl = this.element_.RTL;
    // Remove ourselves from the DOM and calculate the size of our
    // container, then insert ourselves into the container.
    // We do this because otherwise, the value returned by
    // getBoundingClientRect would take our size into account, and we
    // would 'grow' every time render was called.
    this.frameGroup_.remove();
    const groupRect = svgGroup.getBoundingClientRect();
    svgGroup.prepend(this.frameGroup_);

    Blockly.utils.dom.addClass(this.frameGroup_, 'hidden');
    const frameGroup = this.frameGroup_;
    // Trigger the CSS fade-in transition.
    setTimeout(function () {
      Blockly.utils.dom.removeClass(frameGroup, 'hidden');
    }, 0);

    const minWidth = this.frameText_?.getBoundingClientRect().width || 0;
    width =
      width || Math.max(groupRect.width, minWidth) + 2 * frameSizes.MARGIN_SIDE;

    height =
      height ||
      groupRect.height +
        frameSizes.MARGIN_TOP +
        frameSizes.MARGIN_BOTTOM +
        this.headerHeight;

    this.headerColor = this.getColor() || color.light_gray;
    this.baseColor = getBaseColor(this.headerColor);

    this.frameClipRect_.setAttribute('width', `${width}`);
    this.frameBase_.setAttribute('width', `${width}`);
    this.frameBase_.setAttribute('height', `${height}`);
    this.frameBase_.setAttribute('stroke', this.headerColor);
    this.frameBase_.setAttribute('fill', this.baseColor);
    this.frameHeader_.setAttribute('width', `${width}`);
    this.frameHeader_.setAttribute('height', `${height}`);
    this.frameHeader_.setAttribute('fill', this.headerColor);

    if (isRtl) {
      // In RTL the 0 x coordinate is on the right side of the block.
      this.frameClipRect_.setAttribute(
        'x',
        `${-width + frameSizes.MARGIN_SIDE}`
      );
      this.frameHeader_.setAttribute('x', `${-width + frameSizes.MARGIN_SIDE}`);
      this.frameBase_.setAttribute('x', `${-width + frameSizes.MARGIN_SIDE}`);
      // The text should be on the right side of the header, placed so that the
      // entire text is visible (hence the x-coordinate is -width). There is no need
      // for a margin because there is padding around the block already, past the
      // 0 coordinate.
      this.frameText_.setAttribute(
        'x',
        `${-this.frameText_.getBoundingClientRect().width}`
      );
    }
  }
}

function getBaseColor(headerColor: string) {
  // Add transparency
  const baseColor = headerColor + '33';
  // Check that string is a valid hex color with transparency
  // '#' and eight characters 0-F
  if (/^#[0-9A-F]{8}$/i.test(baseColor)) {
    return baseColor;
  } else {
    return color.lightest_gray;
  }
}
