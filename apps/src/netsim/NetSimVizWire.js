/**
 * @overview Wires in the visualization.
 */
'use strict';

require('../utils');
var jQuerySvgElement = require('./NetSimUtils').jQuerySvgElement;
var NetSimVizElement = require('./NetSimVizElement');
var tweens = require('./tweens');
var DataConverters = require('./DataConverters');
var NetSimConstants = require('./NetSimConstants');

var EncodingType = NetSimConstants.EncodingType;

var binaryToAB = DataConverters.binaryToAB;

/**
 * How far the flying label should rest above the wire.
 * @type {number}
 * @const
 */
var TEXT_FINAL_VERTICAL_OFFSET = -10;

/**
 * @param {NetSimVizNode} localNode
 * @param {NetSimVizNode} remoteNode
 * @constructor
 * @augments NetSimVizElement
 */
var NetSimVizWire = module.exports = function (localNode, remoteNode) {
  NetSimVizElement.call(this);

  var root = this.getRoot();
  root.addClass('viz-wire');

  /**
   * @type {jQuery} wrapped around a SVGPathElement
   * @private
   */
  this.line_ = jQuerySvgElement('path')
      .appendTo(root);

  /**
   * @type {jQuery} wrapped around a SVGTextElement
   * @private
   */
  this.questionMark_ = jQuerySvgElement('text')
      .text('?')
      .addClass('question-mark')
      .appendTo(root);

  /**
   * @type {jQuery} wrapped around a SVGTextElement
   * @private
   */
  this.text_ = jQuerySvgElement('text')
      .addClass('state-label')
      .appendTo(root);

  /**
   * X-coordinate of text label, for animation.
   * @type {number}
   * @private
   */
  this.textPosX_ = 0;

  /**
   * Y-coordinate of text label, for animation.
   * @type {number}
   * @private
   */
  this.textPosY_ = 0;

  /**
   * Flag that allows us to force an update of the text position; used
   * when we move text without tweens because that method prevents us
   * from being able to detect normally that something has changed
   * @type {boolean}
   * @private
   */
  this.forceTextPosRender_ = false;

  /**
   * SVG Path Description of this.line_, for animation
   * @type {string}
   * @private
   */
  this.pathData_ = '';

  /**
   * `TEXT_FINAL_VERTICAL_OFFSET`-offset X and Y coordinates for the
   * center of the wire; used for positioning the question mark
   * @type {{x:number, y:number}}
   * @private
   */
  this.wireCenter_ = {x: 0, y: 0};

  /**
   * Enabled encoding types.
   * @type {EncodingType[]}
   * @private
   */
  this.encodings_ = [];

  this.localVizNode = localNode;
  this.remoteVizNode = remoteNode;

  this.render();
};
NetSimVizWire.inherits(NetSimVizElement);

/**
 * Update path data for wire if we can detect pending changes
 * @param {RunLoop.Clock} [clock] - somtimes omitted during setup
 */
NetSimVizWire.prototype.render = function (clock) {

  // Cache the local position values here, so we can check later if
  // anything has changed before making an expensive `.attr` call
  var textPosX = this.textPosX_;
  var textPosY = this.textPosY_;
  var pathData = this.pathData_;
  var wireCenter = this.wireCenter_;

  // Make the call to super to update everything we can, then
  // recalculate the values of ours that are dependent on the movement
  // of our connected nodes
  NetSimVizWire.superPrototype.render.call(this, clock);

  if (this.localVizNode && this.remoteVizNode) {
    this.pathData_ = ['M', this.localVizNode.posX, this.localVizNode.posY,
        'L', this.remoteVizNode.posX, this.remoteVizNode.posY].join(' ');
    this.wireCenter_ = this.getWireCenterPosition();
  }

  // Finally, if and only if any of the values we care about have
  // changed, update our element in the DOM
  if (this.forceTextPosRender_ || textPosX !== this.textPosX_ ||
      textPosY !== this.textPosY_) {
    this.text_
        .attr('x', this.textPosX_)
        .attr('y', this.textPosY_);
    this.forceTextPosRender_ = false;
  }
  if (pathData !== this.pathData_) {
    this.line_.attr('d', this.pathData_);
  }
  if (wireCenter.x !== this.wireCenter_.x || wireCenter.y !== this.wireCenter_.y) {
    this.questionMark_
        .attr('x', this.wireCenter_.x)
        .attr('y', this.wireCenter_.y);
  }
};

/**
 * Hide this wire - used to hide the incoming wire when we're trying to show
 * simplex mode.
 */
NetSimVizWire.prototype.hide = function () {
  this.getRoot().addClass('hidden-wire');
};

/**
 * Killing a visualization node removes its ID so that it won't conflict with
 * another node of matching ID being added, and begins its exit animation.
 * @override
 */
NetSimVizWire.prototype.kill = function () {
  NetSimVizWire.superPrototype.kill.call(this);
  this.localVizNode = null;
  this.remoteVizNode = null;
};

/**
 * Update encoding-view settings.  Determines how bit sets/reads are
 * displayed when animating above the wire.
 *
 * @param {EncodingType[]} newEncodings
 */
NetSimVizWire.prototype.setEncodings = function (newEncodings) {
  this.encodings_ = newEncodings;
};

/**
 * Kick off an animation of the wire state being set by the local viznode.
 * @param {"0"|"1"} newState
 */
NetSimVizWire.prototype.animateSetState = function (newState) {
  if (!(this.localVizNode && this.remoteVizNode)) {
    return;
  }

  var flyOutMs = 300;
  var holdPositionMs = 300;

  this.stopAllAnimation();
  this.setWireClasses_(newState);
  this.text_.text(this.getDisplayBit_(newState));
  this.snapTextToPosition(this.getLocalNodePosition());
  this.tweenTextToPosition(this.getWireCenterPosition(), flyOutMs,
      tweens.easeOutQuad);
  this.doAfterDelay(flyOutMs + holdPositionMs, function () {
    this.setWireClasses_('unknown');
  }.bind(this));
};

/**
 * Kick off an animation of the wire state being read by the local viznode.
 * @param {"0"|"1"} newState
 */
NetSimVizWire.prototype.animateReadState = function (newState) {
  if (!(this.localVizNode && this.remoteVizNode)) {
    return;
  }

  var holdPositionMs = 300;
  var flyToNodeMs = 300;

  this.stopAllAnimation();
  this.setWireClasses_(newState);
  this.text_.text(this.getDisplayBit_(newState));
  this.snapTextToPosition(this.getWireCenterPosition());
  this.doAfterDelay(holdPositionMs, function () {
    this.tweenTextToPosition(this.getLocalNodePosition(), flyToNodeMs,
        tweens.easeOutQuad);
    this.setWireClasses_('unknown');
  }.bind(this));
};

/**
 * Adds/removes classes from the SVG root according to the given wire state.
 * Passing anything other than "1" or "0" will put the wire in an "unknown"
 * state, which begins a CSS transition fade back to gray.
 * @param {"0"|"1"|*} newState
 * @private
 */
NetSimVizWire.prototype.setWireClasses_ = function (newState) {
  var stateOff = (newState === '0');
  var stateOn = (!stateOff && newState === '1');
  var stateUnknown = (!stateOff && !stateOn);

  this.getRoot().toggleClass('state-on', stateOn);
  this.getRoot().toggleClass('state-off', stateOff);
  this.getRoot().toggleClass('state-unknown', stateUnknown);
};

/**
 * Get an appropriate "display bit" to show above the wire, given the
 * current enabled encodings (should match the "set wire" button label)
 * @param {"0"|"1"} wireState
 * @returns {string} a display bit appropriate to the enabled encodings.
 * @private
 */
NetSimVizWire.prototype.getDisplayBit_ = function (wireState) {
  if (this.isEncodingEnabled_(EncodingType.A_AND_B) &&
      !this.isEncodingEnabled_(EncodingType.BINARY)) {
    wireState = binaryToAB(wireState);
  }
  return wireState;
};

/**
 * Check whether the given encoding is currently displayed by the panel.
 * @param {EncodingType} queryEncoding
 * @returns {boolean}
 * @private
 */
NetSimVizWire.prototype.isEncodingEnabled_ = function (queryEncoding) {
  return this.encodings_.some(function (enabledEncoding) {
    return enabledEncoding === queryEncoding;
  });
};

/**
 * Creates an animated motion from the text's current position to the
 * given coordinates.
 * @param {{x:number, y:number}} destination
 * @param {number} [duration=600] in milliseconds
 * @param {TweenFunction} [tweenFunction=linear]
 */
NetSimVizWire.prototype.tweenTextToPosition = function (destination, duration,
    tweenFunction) {
  if (duration > 0) {
    this.tweens_.push(new tweens.TweenValueTo(this, 'textPosX_', destination.x,
        duration, tweenFunction));
    this.tweens_.push(new tweens.TweenValueTo(this, 'textPosY_', destination.y,
        duration, tweenFunction));
  } else {
    this.textPosX_ = destination.x;
    this.textPosY_ = destination.y;
    this.forceTextPosRender_ = true;
  }
};

/**
 * Snaps the text to the given position.
 * @param {{x:number, y:number}} destination
 */
NetSimVizWire.prototype.snapTextToPosition = function (destination) {
  this.tweenTextToPosition(destination, 0);
};

/**
 * @returns {{x:number, y:number}}
 */
NetSimVizWire.prototype.getLocalNodePosition = function () {
  return {
    x: this.localVizNode.posX,
    y: this.localVizNode.posY
  };
};

/**
 * @returns {{x:number, y:number}}
 */
NetSimVizWire.prototype.getWireCenterPosition = function () {
  return {
    x: (this.remoteVizNode.posX - this.localVizNode.posX) / 2 +
        this.localVizNode.posX,
    y: (this.remoteVizNode.posY - this.remoteVizNode.posY) / 2 +
        this.localVizNode.posY + TEXT_FINAL_VERTICAL_OFFSET
  };
};
