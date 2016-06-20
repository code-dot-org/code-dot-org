/**
 * @fileoverview
 */

/* global Blockly, goog, document */
'use strict';

goog.provide('Blockly.BlockSvgUnused');

var FRAME_MARGIN_SIDE = 15;
var FRAME_MARGIN_TOP = 10;
var FRAME_MARGIN_BOTTOM = 5;

var FRAME_HEADER_HEIGHT = 25;

Blockly.BlockSvgUnused = function (block) {
  this.block_ = block;

  this.bindData_ = undefined;

  this.frameGroup_ = undefined;
  this.frameClipRect_ = undefined;
  this.frameBase_ = undefined;
  this.frameHeader_ = undefined;
  this.frameText_ = undefined;
  this.frameHelp_ = undefined;

  this.initChildren();
};

Blockly.BlockSvgUnused.UNUSED_BLOCK_HELP_EVENT = 'blocklyUnusedBlockHelpClicked';

Blockly.BlockSvgUnused.prototype.initChildren = function () {

  // Unhide when run button pressed. Save binding data so we can unbind.
  this.bindData_ = Blockly.bindEvent_(Blockly.mainBlockSpace.getCanvas(),
      Blockly.BlockSpace.EVENTS.RUN_BUTTON_CLICKED, this, this.unhide.bind(this));

  this.frameGroup_ = Blockly.createSvgElement('g', {
    'class': 'blocklyUnusedFrame'
  });

  var clip = Blockly.createSvgElement('clipPath', {
    id: 'frameClip' + this.block_.id
  }, this.frameGroup_);
  this.frameClipRect_ = Blockly.createSvgElement('rect', {
    x: -FRAME_MARGIN_SIDE,
    y: -(FRAME_MARGIN_TOP + FRAME_HEADER_HEIGHT),
    height: FRAME_HEADER_HEIGHT,
    width: '100%'
  }, clip);

  this.frameBase_ = Blockly.createSvgElement('rect', {
    x: -FRAME_MARGIN_SIDE,
    y: -(FRAME_MARGIN_TOP + FRAME_HEADER_HEIGHT),
    fill: '#e7e8ea',
    stroke: '#c6cacd',
    rx: 15,
    ry:15
  }, this.frameGroup_);

  this.frameHeader_ = Blockly.createSvgElement('rect', {
    x: -FRAME_MARGIN_SIDE,
    y: -(FRAME_MARGIN_TOP + FRAME_HEADER_HEIGHT),
    fill: '#c6cacd',
    rx: 15,
    ry:15,
    'clip-path': 'url(#frameClip' + this.block_.id + ')'
  }, this.frameGroup_);

  this.frameText_ = Blockly.createSvgElement('text', {
    'class': 'blocklyText',
    style: 'font-size: 12pt',
    y: -(FRAME_MARGIN_TOP + FRAME_HEADER_HEIGHT / 2),
    'dominant-baseline': 'central'
  }, this.frameGroup_);
  this.frameText_.appendChild(document.createTextNode(Blockly.Msg.UNUSED_CODE));

  this.frameHelp_ = Blockly.createSvgElement('g', {
    'class': 'blocklyHelp'
  }, this.frameGroup_);
  Blockly.createSvgElement('circle', {
    stroke: "#ffffff",
    fill: '#59b9dc',
    r: FRAME_HEADER_HEIGHT * 0.75 * 0.5
  }, this.frameHelp_);
  Blockly.createSvgElement('text', {
    'class': 'blocklyText',
    style: 'font-size: 12pt',
    dx: -FRAME_HEADER_HEIGHT * 0.75 * 0.5 * 0.5,
    dy: FRAME_HEADER_HEIGHT * 0.75 * 0.5 * 0.5
  }, this.frameHelp_).appendChild(document.createTextNode("?"));
};

/**
 * @override
 */
Blockly.BlockSvgUnused.prototype.getPadding = function () {
  return {
    top: FRAME_MARGIN_TOP + FRAME_HEADER_HEIGHT,
    right: FRAME_MARGIN_SIDE,
    bottom: FRAME_MARGIN_BOTTOM,
    left: FRAME_MARGIN_SIDE
  };
};

Blockly.BlockSvgUnused.prototype.bindClickEvent = function () {
  if (this.isbound_) {
    return;
  }
  this.isbound_ = true;

  // We bind to mousedown rather than click so we can interrupt the drag
  // that would otherwise be initiated.
  Blockly.bindEvent_(this.frameHelp_, 'mousedown', this, function (e) {
    if (Blockly.isRightButton(e)) {
      // Right-click.
      return;
    }

    this.frameHelp_.dispatchEvent(new Event(Blockly.BlockSvgUnused.UNUSED_BLOCK_HELP_EVENT, {
      bubbles: true
    }));
    e.stopPropagation();
    e.preventDefault();
  });
};

Blockly.BlockSvgUnused.prototype.unhide = function () {
  this.frameGroup_ && Blockly.removeClass_(this.frameGroup_, 'hidden');
};

Blockly.BlockSvgUnused.prototype.render = function (svgGroup) {

  // Remove ourselves from the DOM and calculate the size of our
  // container, then insert ourselves into the container.
  // We do this because otherwise, the value returned by
  // getBoundingClientRect would take our size into account, and we
  // would 'grow' every time render was called.
  goog.dom.removeNode(this.frameGroup_);
  var groupRect = svgGroup.getBoundingClientRect();
  goog.dom.insertChildAt(svgGroup, this.frameGroup_, 0);

  Blockly.addClass_(this.frameGroup_, 'hidden');

  this.bindClickEvent();

  var minWidth = this.frameText_.getBoundingClientRect().width + this.frameHelp_.getBoundingClientRect().width;

  var width = Math.max(groupRect.width, minWidth) + 2 * FRAME_MARGIN_SIDE;
  var height = groupRect.height + FRAME_MARGIN_TOP + FRAME_MARGIN_BOTTOM + FRAME_HEADER_HEIGHT;

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

  this.frameHelp_.setAttribute('transform', 'translate(' + (width - 2 * FRAME_MARGIN_SIDE) + ',' + (-(FRAME_MARGIN_TOP + FRAME_HEADER_HEIGHT / 2)) + ')');
};

Blockly.BlockSvgUnused.prototype.dispose = function () {
  if (this.bindData_) {
    Blockly.unbindEvent_(this.bindData_);
  }
  goog.dom.removeNode(this.frameGroup_);
  this.frameGroup_ = undefined;
  this.frameClipRect_ = undefined;
  this.frameBase_ = undefined;
  this.frameHeader_ = undefined;
  this.frameText_ = undefined;
  this.frameHelp_ = undefined;
};
