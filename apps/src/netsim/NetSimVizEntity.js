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

require('../utils'); // For Function.prototype.inherits
var NetSimVizElement = require('./NetSimVizElement');

/**
 * A VizEntity is a NetSimVizElement that maps to a NetSimEntity somewhere in
 * shared storage, and has a representation in the network visualization.
 * Its role is to maintain that visual representation and update it to reflect
 * the state of the stored entity it represents.
 *
 * In doing so, it has behaviors and a lifetime that don't directly represent
 * the stored entity because while quantities in our model snap to new values
 * or are created/destroyed in a single frame, we want their visual
 * representation to animate nicely.  Thus, a VizEntity has helpers for tweening
 * and may often be in progress toward the state of the entity it represents,
 * rather than an exact representation of that entity.  Likewise, a VizEntity
 * will outlive its actual entity, because it can have a 'death' animation.
 *
 * @constructor
 * @param {NetSimEntity} entity - the netsim Entity that this element represents
 */
var NetSimVizEntity = module.exports =  function (entity) {
  NetSimVizElement.call(this);

  /**
   * @type {number}
   */
  this.id = entity.entityID;
};
NetSimVizEntity.inherits(NetSimVizElement);

/**
 * Begins the process of destroying this VizEntity.  Once started, this
 * process cannot be stopped.  Immediately clears its ID to remove any
 * association with the stored entity, which probably doesn't exist anymore.
 * This method can be overridden to trigger an "on-death" animation.
 */
NetSimVizEntity.prototype.kill = function () {
  this.id = undefined;
  NetSimVizEntity.superPrototype.kill.call(this);
};
