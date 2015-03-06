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
  this.tweens_.push(new tweens.TweenValueTo(this, 'scale_', 1, 800,
      tweens.easeOutElastic));

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
    this.getRoot().addClass('router-node');
  }
};

/**
 * Killing a visualization node removes its ID so that it won't conflict with
 * another node of matching ID being added, and begins its exit animation.
 */
NetSimVizNode.prototype.kill = function () {
  this.id = undefined;
  this.tweens_ = [];
  this.tweens_.push(new tweens.TweenValueTo(this, 'scale_', 0, 200, tweens.easeInQuad));
};

/**
 * @override
 * @returns {boolean}
 */
NetSimVizNode.prototype.isDead = function () {
  return this.id === undefined && this.tweens_.length === 0;
};

NetSimVizNode.prototype.moveTo = function (x, y) {
  this.tweens_.push(new tweens.TweenValueTo(this, 'posX_', x, 700,
      tweens.easeOutElastic));
  this.tweens_.push(new tweens.TweenValueTo(this, 'posY_', y, 700,
      tweens.easeOutElastic));
};

NetSimVizNode.prototype.render = function () {
  var transform = 'translate(' + this.posX_ + ', ' + this.posY_ + '),' +
      'scale(' + this.scale_ + ')';
  this.rootGroup_.attr('transform', transform);
};
