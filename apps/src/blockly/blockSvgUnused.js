import msg from '@cdo/locale';
const FRAME_MARGIN_SIDE = 15;
const FRAME_MARGIN_TOP = 10;
const FRAME_MARGIN_BOTTOM = 5;

const FRAME_HEADER_HEIGHT = 25;

export const BlockSvgUnused = function(block, helpClickFunc) {
  this.block_ = block;
  this.helpClickFunc_ = helpClickFunc;

  this.frameGroup_ = undefined;
  this.frameClipRect_ = undefined;
  this.frameBase_ = undefined;
  this.frameHeader_ = undefined;
  this.frameText_ = undefined;
  this.frameHelp_ = undefined;

  this.initChildren();
};

BlockSvgUnused.UNUSED_BLOCK_HELP_EVENT = 'blocklyUnusedBlockHelpClicked';

BlockSvgUnused.prototype.initChildren = function() {
  this.frameGroup_ = Blockly.utils.dom.createSvgElement('g', {
    class: 'blocklyUnusedFrame'
  });

  var clip = Blockly.utils.dom.createSvgElement(
    'clipPath',
    {
      id: `frameClip${this.block_.id}`
    },
    this.frameGroup_
  );
  this.frameClipRect_ = Blockly.utils.dom.createSvgElement(
    'rect',
    {
      x: -FRAME_MARGIN_SIDE,
      y: -(FRAME_MARGIN_TOP + FRAME_HEADER_HEIGHT),
      height: FRAME_HEADER_HEIGHT
    },
    clip
  );

  this.frameBase_ = Blockly.utils.dom.createSvgElement(
    'rect',
    {
      x: -FRAME_MARGIN_SIDE,
      y: -(FRAME_MARGIN_TOP + FRAME_HEADER_HEIGHT),
      fill: '#e7e8ea',
      stroke: '#c6cacd',
      rx: 15,
      ry: 15
    },
    this.frameGroup_
  );

  this.frameHeader_ = Blockly.utils.dom.createSvgElement(
    'rect',
    {
      x: -FRAME_MARGIN_SIDE,
      y: -(FRAME_MARGIN_TOP + FRAME_HEADER_HEIGHT),
      fill: '#c6cacd',
      rx: 15,
      ry: 15,
      'clip-path': `url(#frameClip${this.block_.id.replace(/\)/g, '\\)')})`
    },
    this.frameGroup_
  );

  var frameTextVerticalPosition = -(FRAME_MARGIN_TOP + FRAME_HEADER_HEIGHT / 2);
  if (Blockly.ieVersion()) {
    // in non-IE browsers, we use dominant-baseline to vertically center
    // our text. That is unfortunately not supported in IE, so we
    // manually offset by 4 pixels to compensate.
    frameTextVerticalPosition += 4;
  }
  this.frameText_ = Blockly.utils.dom.createSvgElement(
    'text',
    {
      class: 'blocklyText',
      style: 'font-size: 12pt;fill: black',
      y: frameTextVerticalPosition,
      'dominant-baseline': 'central'
    },
    this.frameGroup_
  );
  this.frameText_.appendChild(document.createTextNode(msg.unusedCode()));

  this.frameHelp_ = Blockly.utils.dom.createSvgElement(
    'g',
    {
      class: 'blocklyHelp'
    },
    this.frameGroup_
  );
  Blockly.utils.dom.createSvgElement(
    'circle',
    {
      fill: '#7665a0',
      r: FRAME_HEADER_HEIGHT * 0.75 * 0.5
    },
    this.frameHelp_
  );
  Blockly.utils.dom
    .createSvgElement(
      'text',
      {
        class: 'blocklyText',
        y: Blockly.ieVersion() ? 4 : 0, // again, offset text manually in IE
        'dominant-baseline': 'central',
        'text-anchor': 'middle'
      },
      this.frameHelp_
    )
    .appendChild(document.createTextNode('?'));
};

/**
 * @override
 */
BlockSvgUnused.prototype.getPadding = function() {
  return {
    top: FRAME_MARGIN_TOP + FRAME_HEADER_HEIGHT,
    right: FRAME_MARGIN_SIDE,
    bottom: FRAME_MARGIN_BOTTOM,
    left: FRAME_MARGIN_SIDE
  };
};

BlockSvgUnused.prototype.bindClickEvent = function() {
  if (this.isbound_) {
    return;
  }
  this.isbound_ = true;

  // We bind to mousedown rather than click so we can interrupt the drag
  // that would otherwise be initiated.
  Blockly.bindEvent_(this.frameHelp_, 'mousedown', this, function(e) {
    if (Blockly.isRightButton(e)) {
      // Right-click.
      return;
    }

    this.helpClickFunc_(e);
    e.stopPropagation();
    e.preventDefault();
  });
};

BlockSvgUnused.prototype.render = function(svgGroup) {
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

  this.bindClickEvent();

  var minWidth =
    this.frameText_.getBoundingClientRect().width +
    this.frameHelp_.getBoundingClientRect().width;

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

  if (Blockly.RTL) {
    this.frameClipRect_.setAttribute('x', -width + FRAME_MARGIN_SIDE);
    this.frameHeader_.setAttribute('x', -width + FRAME_MARGIN_SIDE);
    this.frameBase_.setAttribute('x', -width + FRAME_MARGIN_SIDE);
    this.frameText_.setAttribute('x', -width + 2 * FRAME_MARGIN_SIDE);
  }

  this.frameHelp_.setAttribute(
    'transform',
    'translate(' +
      (width - 2 * FRAME_MARGIN_SIDE) +
      ',' +
      -(FRAME_MARGIN_TOP + FRAME_HEADER_HEIGHT / 2) +
      ')'
  );
};

BlockSvgUnused.prototype.dispose = function() {
  this.frameGroup_.remove();
  this.frameGroup_ = undefined;
  this.frameClipRect_ = undefined;
  this.frameBase_ = undefined;
  this.frameHeader_ = undefined;
  this.frameText_ = undefined;
  this.frameHelp_ = undefined;
};
