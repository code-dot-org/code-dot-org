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
var netsimConstants = require('./netsimConstants');
var jQuerySvgElement = require('./netsimUtils').jQuerySvgElement;
var NetSimVizEntity = require('./NetSimVizEntity');
var tweens = require('./tweens');

var DnsMode = netsimConstants.DnsMode;
var NodeType = netsimConstants.NodeType;

/**
 * @param {NetSimNode} sourceNode
 * @constructor
 * @augments NetSimVizEntity
 */
var NetSimVizNode = module.exports = function (sourceNode) {
  NetSimVizEntity.call(this, sourceNode);

  /**
   * @type {number}
   * @private
   */
  this.address_ = undefined;

  /**
   * @type {DnsMode}
   * @private
   */
  this.dnsMode_ = undefined;

  /**
   * @type {number}
   */
  this.nodeID = undefined;

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

  this.displayName_ = jQuerySvgElement('text')
      .attr('x', 0)
      .attr('y', textVerticalOffset)
      .appendTo(root);

  this.addressGroup_ = jQuerySvgElement('g')
      .attr('transform', 'translate(0,30)')
      .hide()
      .appendTo(root);

  var addressBoxHalfWidth = 15;
  var addressBoxHalfHeight = 12;

  jQuerySvgElement('rect')
      .addClass('address-box')
      .attr('x', -addressBoxHalfWidth)
      .attr('y', -addressBoxHalfHeight)
      .attr('rx', 5)
      .attr('ry', 10)
      .attr('width', addressBoxHalfWidth * 2)
      .attr('height', addressBoxHalfHeight * 2)
      .appendTo(this.addressGroup_);

  this.addressText_ = jQuerySvgElement('text')
      .addClass('address-box')
      .attr('x', 0)
      .attr('y', textVerticalOffset)
      .text('?')
      .appendTo(this.addressGroup_);

  // Set an initial default tween for zooming in from nothing.
  this.snapToScale(0);
  this.tweenToScale(0.5, 800, tweens.easeOutElastic);

  this.configureFrom(sourceNode);
  this.render();
};
NetSimVizNode.inherits(NetSimVizEntity);

/**
 *
 * @param {NetSimNode} sourceNode
 */
NetSimVizNode.prototype.configureFrom = function (sourceNode) {
  this.displayName_.text(sourceNode.getDisplayName());
  this.nodeID = sourceNode.entityID;

  if (sourceNode.getNodeType() === NodeType.ROUTER) {
    this.isRouter = true;
    this.getRoot().addClass('router-node');
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
  if (!this.isForeground && this.tweens_.length === 0) {
    var randomX = 300 * Math.random() - 150;
    var randomY = 300 * Math.random() - 150;
    this.tweenToPosition(randomX, randomY, 20000, tweens.easeInOutQuad);
  }
};

/**
 * @param {boolean} isForeground
 */
NetSimVizNode.prototype.onDepthChange = function (isForeground) {
  NetSimVizNode.superPrototype.onDepthChange.call(this, isForeground);
  this.tweens_.length = 0;
  if (isForeground) {
    this.tweenToScale(1, 600, tweens.easeOutElastic);
  } else {
    this.tweenToScale(0.5, 600, tweens.easeOutElastic);
  }
};

NetSimVizNode.prototype.setAddress = function (address) {
  this.address_ = address;
  this.updateAddressDisplay();
};

/**
 * @param {string} newDnsMode
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
  // Routers never show their address
  // If a DNS mode has not been set we never show an address
  if (this.isRouter || this.dnsMode_ === undefined) {
    this.addressGroup_.hide();
    return;
  }

  this.addressGroup_.show();
  if (this.dnsMode_ === DnsMode.NONE) {
    this.addressText_.text(this.address_ !== undefined ? this.address_ : '?');
  } else {
    this.addressText_.text(this.isLocalNode || this.isDnsNode ? this.address_ : '?');
  }
};
