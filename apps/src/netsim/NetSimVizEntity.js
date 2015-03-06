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

var jQuerySvgElement = require('./netsimUtils').jQuerySvgElement;

/**
 * @constructor
 * @param {NetSimEntity} entity - the netsim Entity that this element represents
 */
var NetSimVizEntity = module.exports =  function (entity) {
  /**
   * @type {number}
   */
  this.id = entity.entityID;

  /**
   * Root SVG <g> (group) element for this object.
   * @type {jQuery}
   * @private
   */
  this.rootGroup_ = jQuerySvgElement('g');

  /**
   * Set of tweens we should currently be running on this node.
   * Processed by tick()
   * @type {Array.<exports.TweenValueTo>}
   * @private
   */
  this.tweens_ = [];

  /**
   * @type {boolean}
   * @private
   */
  this.isDead_ = false;
};

NetSimVizEntity.prototype.getRoot = function () {
  return this.rootGroup_;
};

NetSimVizEntity.prototype.kill = function () {
  this.isDead_ = true;
};

NetSimVizEntity.prototype.isDead = function () {
  return this.isDead_;
};

NetSimVizEntity.prototype.tick = function (clock) {
  this.tweens_.forEach(function (tween) {
    tween.tick(clock);
  });
  this.tweens_ = this.tweens_.filter(function (tween) {
    return !tween.isFinished;
  });
};
