/**
 * @fileoverview Methods for graphically rendering a block as SVG.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.BlockSvgFramed');

var FRAME_MARGIN_SIDE = 15;
var FRAME_MARGIN_TOP = 10;
var FRAME_MARGIN_BOTTOM = 5;

var FRAME_HEADER_HEIGHT = 25;
var FRAME_SUBHEADER_HEIGHT = 80;

Blockly.BlockSvgFramed = function (block) {
  Blockly.BlockSvg.call(this, block);
};

goog.inherits(Blockly.BlockSvgFramed, Blockly.BlockSvg);

Blockly.BlockSvgFramed.prototype.initChildren = function () {
  // create two frame rects.  the first is light gray and unclipped. the second
  // is a darker gray, and clipped to be only the top FRAME_HEADER_HEIGHT pixels
  var clip = Blockly.createSvgElement('clipPath', {
    id: 'frameClip' + this.block_.id
  }, this.svgGroup_);
  this.frameClipRect_ = Blockly.createSvgElement('rect', {
    x: -FRAME_MARGIN_SIDE,
    y: -(FRAME_MARGIN_TOP + FRAME_HEADER_HEIGHT),
    height: FRAME_HEADER_HEIGHT,
    width: '100%'
  }, clip);
  this.frameBase_ = Blockly.createSvgElement('rect', {
    x: -FRAME_MARGIN_SIDE,
    y: -(FRAME_MARGIN_TOP + FRAME_HEADER_HEIGHT),
    fill: '#dddddd',
    stroke: '#aaaaaa',
    rx: 15,
    ry:15
  }, this.svgGroup_);
  this.frameHeader_ = Blockly.createSvgElement('rect', {
    x: -FRAME_MARGIN_SIDE,
    y: -(FRAME_MARGIN_TOP + FRAME_HEADER_HEIGHT),
    fill: '#aaaaaa',
    rx: 15,
    ry:15,
    'clip-path': 'url(#frameClip' + this.block_.id + ')'
  }, this.svgGroup_);
  this.frameText_ = Blockly.createSvgElement('text', {
    'class': 'blocklyText',
    style: 'font-size: 12pt'
  }, this.svgGroup_);
  this.frameText_.appendChild(document.createTextNode(Blockly.Msg.FUNCTION_HEADER));

  goog.base(this, 'initChildren');
};

Blockly.BlockSvgFramed.prototype.renderDraw_ = function(iconWidth, inputRows) {
  goog.base(this, 'renderDraw_', iconWidth, inputRows);

  var groupRect = this.svgPath_.getBoundingClientRect();
  var width = groupRect.width + 2 * FRAME_MARGIN_SIDE;
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

  if (!this.frameText_.getAttribute('y')) {
    // The first time we render, we want to move our Function text inside of
    // the header. The value Chrome was giving me for getBoundingRect().height
    // seemed large, so instead I determine it by diffing the locations of the
    // text's top, and the path's top.
    var textHeight = Math.abs(this.frameText_.getBoundingClientRect().top -
      this.svgPathDark_.getBoundingClientRect().top);
    this.frameText_.setAttribute('y', -(FRAME_MARGIN_TOP + (FRAME_HEADER_HEIGHT - textHeight) / 2));
  }
};

Blockly.BlockSvgFramed.prototype.dispose = function () {
  goog.base(this, 'dispose');

  this.frameClipRect_ = null;
  this.frameBase_ = null;
  this.frameHeader_ = null;
  this.frameText_ = null;
};
