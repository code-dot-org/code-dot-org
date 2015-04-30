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
  this.text_ = jQuerySvgElement('text')
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
  if (this.localVizNode && this.remoteVizNode) {
    pathData = 'M ' + this.localVizNode.posX + ' ' + this.localVizNode.posY +
        ' L ' + this.remoteVizNode.posX + ' ' + this.remoteVizNode.posY;
  }
  this.line_.attr('d', pathData);
  this.text_
      .attr('x', this.textPosX_)
      .attr('y', this.textPosY_);

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
 * @param {string} newState - "0" or "1" for off and on.
 */
NetSimVizWire.prototype.animateSetState = function (newState) {
  // Remove all our tweens, we reset our animation now.
  this.stopAllAnimation();

  this.getRoot().removeClass('state-unknown');
  if (newState === '0') {
    this.getRoot().addClass('state-off');
    this.getRoot().removeClass('state-on');
  } else if (newState === '1') {
    this.getRoot().addClass('state-on');
    this.getRoot().removeClass('state-off');
  }

  var flyOutMs = 300;
  var holdPositionMs = 300;
  this.text_.text(this.getDisplayBit_(newState));
  this.tweenTextFromLocalToWire(flyOutMs, tweens.easeOutQuad);

  this.doAfterDelay(flyOutMs + holdPositionMs, function () {
    this.getRoot().removeClass('state-on');
    this.getRoot().removeClass('state-off');
    this.getRoot().addClass('state-unknown');
  }.bind(this));
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
 * Stops any existing motion animation and begins an animated motion to the
 * given coordinates.  Note: This animates the VizEntity's root group.
 * @param {number} [duration=600] in milliseconds
 * @param {TweenFunction} [tweenFunction=linear]
 */
NetSimVizWire.prototype.tweenTextFromLocalToWire = function (duration,
    tweenFunction) {
  if (!(this.localVizNode && this.remoteVizNode)) {
    return;
  }

  // Snap text to initial position
  this.textPosX_ = this.localVizNode.posX;
  this.textPosY_ = this.localVizNode.posY;

  var newX = (this.remoteVizNode.posX - this.localVizNode.posX) / 2 +
      this.localVizNode.posX;
  var newY = (this.remoteVizNode.posY - this.remoteVizNode.posY) / 2 +
      this.localVizNode.posY + TEXT_FINAL_VERTICAL_OFFSET;

  // Add two new tweens, one for each axis
  if (duration > 0) {
    this.tweens_.push(new tweens.TweenValueTo(this, 'textPosX_', newX, duration,
        tweenFunction));
    this.tweens_.push(new tweens.TweenValueTo(this, 'textPosY_', newY, duration,
        tweenFunction));
  } else {
    this.textPosX_ = newX;
    this.textPosY_ = newY;
  }

};
