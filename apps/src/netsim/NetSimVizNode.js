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
var NetSimRouterNode = require('./NetSimRouterNode');
var tweens = require('./tweens');

/**
 * @param {NetSimNode} sourceNode
 * @constructor
 * @augments NetSimVizEntity
 */
var NetSimVizNode = module.exports = function (sourceNode) {
  NetSimVizEntity.call(this, sourceNode);

  // Give our root node a useful class
  this.getRoot().addClass('viz-node');

  /**
   * @type {boolean}
   */
  this.isRouter = false;

  /**
   *
   * @type {jQuery}
   * @private
   */
  this.circle_ = jQuerySvgElement('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 37) /* Half of 75 */
      .appendTo(this.getRoot());

  this.displayName_ = jQuerySvgElement('text')
      .attr('x', 0)
      .attr('y', 2)
      .css('text-anchor', 'middle')
      .appendTo(this.getRoot());

  this.posX_ = 0;
  this.posY_ = 0;
  this.scale_ = 0;

// Set an initial default tween for zooming in from nothing.
  this.scaleTo(0.5, 800);

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

  if (sourceNode.getNodeType() === NetSimRouterNode.getNodeType()) {
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
  this.tweens_ = [];
  this.scaleTo(0, 200, tweens.easeInQuad);
};

/**
 * @override
 * @returns {boolean}
 */
NetSimVizNode.prototype.isDead = function () {
  return this.isDead_ && this.tweens_.length === 0;
};

NetSimVizNode.prototype.moveTo = function (x, y, duration, tweenFunction) {
  duration = duration !== undefined ?
      duration : 600;
  tweenFunction = tweenFunction !== undefined ?
      tweenFunction : tweens.easeOutElastic;
  this.tweens_.push(new tweens.TweenValueTo(this, 'posX_', x, duration,
      tweenFunction));
  this.tweens_.push(new tweens.TweenValueTo(this, 'posY_', y, duration,
      tweenFunction));
};

NetSimVizNode.prototype.scaleTo = function (newScale, duration, tweenFunction) {
  duration = duration !== undefined ?
      duration : 600;
  tweenFunction = tweenFunction !== undefined ?
      tweenFunction : tweens.easeOutElastic;
  this.tweens_.push(new tweens.TweenValueTo(this, 'scale_', newScale, duration,
      tweenFunction));
};

NetSimVizNode.prototype.tick = function (clock) {
  NetSimVizNode.superPrototype.tick.call(this, clock);
  if (this.tweens_.length === 0) {
    if (!this.isForeground) {
      var randomX = 200 * Math.random() - 100;
      var randomY = 200 * Math.random() - 100;
      this.moveTo(randomX, randomY, 10000, tweens.easeInOutQuad);
    }
  }
};

NetSimVizNode.prototype.render = function () {
  var transform = 'translate(' + this.posX_ + ', ' + this.posY_ + '),' +
      'scale(' + this.scale_ + ')';
  this.rootGroup_.attr('transform', transform);
};

/**
 * @param {boolean} isForeground
 */
NetSimVizNode.prototype.onDepthChange = function (isForeground) {
  NetSimVizNode.superPrototype.onDepthChange.call(this, isForeground);
  this.tweens_ = [];
  if (isForeground) {
    this.scaleTo(1);
    if (this.isRouter) {
      this.moveTo(0, 0);
    }
  } else {
    this.scaleTo(0.5);
  }
};
