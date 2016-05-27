/**
 * @overview Nodes in the visualization.
 */
'use strict';

require('../utils'); // Provides Function.prototype.inherits
var NetSimConstants = require('./NetSimConstants');
var jQuerySvgElement = require('./NetSimUtils').jQuerySvgElement;
var NetSimVizElement = require('./NetSimVizElement');
var tweens = require('./tweens');

var DnsMode = NetSimConstants.DnsMode;

var NetSimGlobals = require('./NetSimGlobals');

/**
 * The narrowest that a text bubble is allowed to be.
 * @type {number}
 * @const
 */
var TEXT_MIN_WIDTH = 30;

/**
 * Width to add to the bubble beyond the width of the student's name.
 * @type {number}
 * @const
 */
var TEXT_PADDING_X = 20;

/**
 * Height to add to the bubble beyond the height of the student's name.
 * @type {number}
 * @const
 */
var TEXT_PADDING_Y = 10;

/**
 * @param {boolean} useBackgroundAnimation - changes the behavior of this node
 *        when it's in the background layer.
 * @constructor
 * @augments NetSimVizElement
 */
var NetSimVizNode = module.exports = function (useBackgroundAnimation) {
  NetSimVizElement.call(this);

  /**
   * @private {string}
   */
  this.address_ = undefined;

  /**
   * @private {DnsMode}
   */
  this.dnsMode_ = undefined;

  /**
   * Whether to start or update any tweens while the node is in the background
   * layer.
   * @private {boolean}
   */
  this.useBackgroundAnimation_ = useBackgroundAnimation;

  /**
   * @type {boolean}
   */
  this.isRouter = false;

  /**
   * @type {boolean}
   */
  this.isLocalNode = false;

  /**
   * @type {boolean}
   */
  this.isDnsNode = false;

  // Give our root node a useful class
  var root = this.getRoot();
  root.addClass('viz-node');

  // Going for a diameter of _close_ to 75
  var radius = 37;
  var textVerticalOffset = 4;

  /**
   *
   * @type {jQuery}
   * @private
   */
  jQuerySvgElement('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', radius)
      .appendTo(root);

  this.nameGroup_ = jQuerySvgElement('g')
      .attr('transform', 'translate(0,0)')
      .appendTo(root);

  this.displayName_ = jQuerySvgElement('text')
      .attr('x', 0)
      .attr('y', textVerticalOffset);

  this.nameBox_ = jQuerySvgElement('rect')
      .addClass('name-box');

  this.nameGroup_
      .append(this.nameBox_)
      .append(this.displayName_);

  this.addressGroup_ = jQuerySvgElement('g')
      .attr('transform', 'translate(0,30)')
      .hide()
      .appendTo(root);

  this.addressBox_ = jQuerySvgElement('rect')
      .addClass('address-box')
      .appendTo(this.addressGroup_);

  this.addressText_ = jQuerySvgElement('text')
      .addClass('address-box')
      .attr('x', 0)
      .attr('y', textVerticalOffset)
      .text('?')
      .appendTo(this.addressGroup_);

  // Set an initial default tween for zooming in from nothing.
  if (this.useBackgroundAnimation_) {
    this.snapToScale(0);
    this.tweenToScale(0.5, 800, tweens.easeOutElastic);
  } else {
    this.snapToScale(0.5);
  }
};
NetSimVizNode.inherits(NetSimVizElement);

/**
 * Flag this viz node as the simulation local node.
 */
NetSimVizNode.prototype.setIsLocalNode = function () {
  this.isLocalNode = true;
  this.getRoot().addClass('local-node');
};

/**
 * Change the display name of the viz node
 * @param {string} newName
 */
NetSimVizNode.prototype.setName = function (newName) {
  this.displayName_.text(newName);
  this.resizeNameBox_();
};

/** @private */
NetSimVizNode.prototype.resizeNameBox_ = function () {
  this.resizeRectToText_(this.nameBox_, this.displayName_);
};

/** @private */
NetSimVizNode.prototype.resizeAddressBox_ = function () {
  this.resizeRectToText_(this.addressBox_, this.addressText_);
};

/**
 * Utility for resizing a background rounded-rect to fit the given text element.
 * @param {jQuery} rect
 * @param {jQuery} text
 * @private
 */
NetSimVizNode.prototype.resizeRectToText_ = function (rect, text) {
  try {
    var box = text[0].getBBox();
    var width = Math.max(TEXT_MIN_WIDTH, box.width + TEXT_PADDING_X);
    var height = box.height + TEXT_PADDING_Y;
    var halfWidth = width / 2;
    var halfHeight = height / 2;
    rect.attr('x', -halfWidth)
        .attr('y', -halfHeight)
        .attr('rx', halfHeight)
        .attr('ry', halfHeight)
        .attr('width', width)
        .attr('height', height);
  } catch (e) {
    // Just allow this to be a no-op if it fails.  In some browsers,
    // getBBox will throw if the element is not yet in the DOM.
  }
};

/**
 * Killing a visualization node removes its ID so that it won't conflict with
 * another node of matching ID being added, and begins its exit animation.
 * @override
 */
NetSimVizNode.prototype.kill = function () {
  NetSimVizNode.superPrototype.kill.call(this);
  this.stopAllAnimation();
  this.tweenToScale(0, 200, tweens.easeInQuad);
};

/**
 * Provides drifting animation for nodes in the background.
 * @param {RunLoop.Clock} clock
 */
NetSimVizNode.prototype.tick = function (clock) {
  NetSimVizNode.superPrototype.tick.call(this, clock);

  // Trigger a new drift if we're in the background and the last one finished.
  if (this.useBackgroundAnimation_ && !this.isForeground &&
      this.tweens_.length === 0) {
    var randomX = 300 * Math.random() - 150;
    var randomY = 300 * Math.random() - 150;
    this.tweenToPosition(randomX, randomY, 20000, tweens.easeInOutQuad);
  }
};

/**
 * When visible, runs every frame
 * @param {RunLoop.Clock} [clock]
 */
NetSimVizNode.prototype.render = function (clock) {
  NetSimVizNode.superPrototype.render.call(this, clock);

  // If currently animating, adjust text box sizes to match
  if (this.isForeground && this.tweens_.length > 0) {
    this.resizeNameBox_();
    this.resizeAddressBox_();
  }
};

/**
 * @param {boolean} isForeground
 */
NetSimVizNode.prototype.onDepthChange = function (isForeground) {
  NetSimVizNode.superPrototype.onDepthChange.call(this, isForeground);

  // Don't add tweens if this node has been killed
  if (this.isDying() || this.isDead()) {
    return;
  }

  this.tweens_.length = 0;
  if (isForeground) {
    this.tweenToScale(1, 600, tweens.easeOutElastic);
  } else if (this.useBackgroundAnimation_) {
    this.tweenToScale(0.5, 600, tweens.easeOutElastic);
  } else {
    this.snapToScale(0.5);
  }
};

/**
 * @param {string} address
 */
NetSimVizNode.prototype.setAddress = function (address) {
  this.address_ = address;
  this.updateAddressDisplay();
};

/**
 * @param {DNSMode} newDnsMode
 */
NetSimVizNode.prototype.setDnsMode = function (newDnsMode) {
  this.dnsMode_ = newDnsMode;
  this.updateAddressDisplay();
};

/**
 * @param {boolean} isDnsNode
 */
NetSimVizNode.prototype.setIsDnsNode = function (isDnsNode) {
  this.isDnsNode = isDnsNode;
  this.updateAddressDisplay();
};

NetSimVizNode.prototype.updateAddressDisplay = function () {
  var levelConfig = NetSimGlobals.getLevelConfig();

  // If we are never assigned an address, don't try to show one.
  // In broadcast mode we will be assigned addresses but never use them, so
  //   they should be hidden.
  // Routers never show their address.
  if (this.address_ === undefined || levelConfig.broadcastMode || this.isRouter) {
    this.addressGroup_.hide();
    return;
  }

  this.addressGroup_.show();
  if (this.dnsMode_ === DnsMode.NONE) {
    this.addressText_.text(this.address_ !== undefined ? this.address_ : '?');
  } else {
    this.addressText_.text(this.isLocalNode || this.isDnsNode ? this.address_ : '?');
  }
  this.resizeAddressBox_();
};
