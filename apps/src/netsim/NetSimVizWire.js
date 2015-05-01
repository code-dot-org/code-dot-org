/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxstatements: 200
 */
'use strict';

require('../utils');
var jQuerySvgElement = require('./netsimUtils').jQuerySvgElement;
var NetSimVizEntity = require('./NetSimVizEntity');
var NetSimVizNode = require('./NetSimVizNode');
var tweens = require('./tweens');
var dataConverters = require('./dataConverters');
var netsimConstants = require('./netsimConstants');

var EncodingType = netsimConstants.EncodingType;

var binaryToAB = dataConverters.binaryToAB;

/**
 * How far the flying label should rest above the wire.
 * @type {number}
 * @const
 */
var TEXT_FINAL_VERTICAL_OFFSET = -10;

/**
 *
 * @param sourceWire
 * @param {function} getEntityByID - Allows this wire to search
 *        for other entities in the simulation
 * @constructor
 * @augments NetSimVizEntity
 */
var NetSimVizWire = module.exports = function (sourceWire, getEntityByID) {
  NetSimVizEntity.call(this, sourceWire);

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
   * Enabled encoding types.
   * @type {EncodingType[]}
   * @private
   */
  this.encodings_ = [];

  /**
   * Bound getEntityByID method from vizualization controller.
   * @type {Function}
   * @private
   */
  this.getEntityByID_ = getEntityByID;

  this.localVizNode = null;
  this.remoteVizNode = null;

  this.configureFrom(sourceWire);
  this.render();
};
NetSimVizWire.inherits(NetSimVizEntity);

/**
 * Configuring a wire means looking up the viz nodes that will be its endpoints.
 * @param {NetSimWire} sourceWire
 */
NetSimVizWire.prototype.configureFrom = function (sourceWire) {
  this.localVizNode = this.getEntityByID_(NetSimVizNode, sourceWire.localNodeID);
  this.remoteVizNode = this.getEntityByID_(NetSimVizNode, sourceWire.remoteNodeID);

  if (this.localVizNode) {
    this.localVizNode.setAddress(sourceWire.localAddress);
  }

  if (this.remoteVizNode) {
    this.remoteVizNode.setAddress(sourceWire.remoteAddress);
  }
};

/**
 * Update path data for wire.
 */
NetSimVizWire.prototype.render = function () {
  NetSimVizWire.superPrototype.render.call(this);

  var pathData = 'M 0 0';
  var wireCenter = { x: 0, y: 0 };
  if (this.localVizNode && this.remoteVizNode) {
    pathData = 'M ' + this.localVizNode.posX + ' ' + this.localVizNode.posY +
        ' L ' + this.remoteVizNode.posX + ' ' + this.remoteVizNode.posY;
    wireCenter = this.getWireCenterPosition();
  }
  this.line_.attr('d', pathData);
  this.text_
      .attr('x', this.textPosX_)
      .attr('y', this.textPosY_);
  this.questionMark_
      .attr('x', wireCenter.x)
      .attr('y', wireCenter.y);

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
