import msg from '@cdo/locale';
import color from '@cdo/apps/util/color';

const FRAME_MARGIN_SIDE = 15;
const FRAME_MARGIN_TOP = 10;
const FRAME_MARGIN_BOTTOM = 5;

const FRAME_HEADER_HEIGHT = 25;

export default class BlockSvgFunctional {
  constructor(block) {
    this.block_ = block;

    this.frameGroup_ = undefined;
    this.frameClipRect_ = undefined;
    this.frameBase_ = undefined;
    this.frameHeader_ = undefined;
    this.frameText_ = undefined;

    this.initChildren();
  }
  initChildren() {
    const frameX = -FRAME_MARGIN_SIDE;
    const frameY = -(FRAME_MARGIN_TOP + FRAME_HEADER_HEIGHT);
    // Google Blockly's block ids are randomly generated and can
    // include invalid characters for element ids. Remove everything
    // except alphanumeric characters and whitespace, then collapse
    // multiple adjacent whitespace to single spaces.
    let safeCharBlockId = this.block_.id
      .replace(/[^\w\s\']|_/g, '')
      .replace(/\s+/g, ' ');

    this.frameGroup_ = Blockly.utils.dom.createSvgElement('g', {
      class: 'blocklyFunctionalFrame'
    });

    var clip = Blockly.utils.dom.createSvgElement(
      'clipPath',
      {
        id: `frameClip${safeCharBlockId}`
      },
      this.frameGroup_
    );

    this.frameClipRect_ = Blockly.utils.dom.createSvgElement(
      'rect',
      {
        x: frameX,
        y: frameY,
        height: FRAME_HEADER_HEIGHT
      },
      clip
    );

    this.frameBase_ = Blockly.utils.dom.createSvgElement(
      'rect',
      {
        x: frameX,
        y: frameY,
        fill: color.lightest_gray,
        stroke: color.light_gray,
        rx: 15,
        ry: 15
      },
      this.frameGroup_
    );

    this.frameHeader_ = Blockly.utils.dom.createSvgElement(
      'rect',
      {
        x: frameX,
        y: frameY,
        fill: color.light_gray,
        rx: 15,
        ry: 15,
        'clip-path': `url(#frameClip${safeCharBlockId})`
      },
      this.frameGroup_
    );

    var frameTextVerticalPosition = -(
      FRAME_MARGIN_TOP +
      FRAME_HEADER_HEIGHT / 2
    );

    this.frameText_ = Blockly.utils.dom.createSvgElement(
      'text',
      {
        class: 'blocklyText',
        style: `font-size: 12pt;fill: ${color.white}`,
        y: frameTextVerticalPosition,
        'dominant-baseline': 'central'
      },
      this.frameGroup_
    );

    this.frameText_.appendChild(document.createTextNode(msg.function()));
  }

  getPadding() {
    return {
      top: FRAME_MARGIN_TOP + FRAME_HEADER_HEIGHT,
      right: FRAME_MARGIN_SIDE,
      bottom: FRAME_MARGIN_BOTTOM,
      left: FRAME_MARGIN_SIDE
    };
  }

  render(svgGroup, isRtl) {
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
    setTimeout(function() {
      Blockly.utils.dom.removeClass(frameGroup, 'hidden');
    }, 0);

    var minWidth = this.frameText_.getBoundingClientRect().width;

    var width = Math.max(groupRect.width, minWidth) + 2 * FRAME_MARGIN_SIDE;
    var height =
      groupRect.height +
      FRAME_MARGIN_TOP +
      FRAME_MARGIN_BOTTOM +
      FRAME_HEADER_HEIGHT;

    this.frameClipRect_.setAttribute('width', width);
    this.frameBase_.setAttribute('width', width);
    this.frameBase_.setAttribute('height', height);
    this.frameHeader_.setAttribute('width', width);
    this.frameHeader_.setAttribute('height', height);

    if (isRtl) {
      this.frameClipRect_.setAttribute('x', -width + FRAME_MARGIN_SIDE);
      this.frameHeader_.setAttribute('x', -width + FRAME_MARGIN_SIDE);
      this.frameBase_.setAttribute('x', -width + FRAME_MARGIN_SIDE);
      this.frameText_.setAttribute('x', -width + 2 * FRAME_MARGIN_SIDE);
    }
  }
}
