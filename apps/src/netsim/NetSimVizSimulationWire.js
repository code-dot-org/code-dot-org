/**
 * @overview Wires in the visualization that map to simulation entities.
 */
'use strict';

require('../utils');
var NetSimGlobals = require('./NetSimGlobals');
var NetSimVizNode = require('./NetSimVizNode');
var NetSimVizWire = require('./NetSimVizWire');

/**
 * @param {NetSimWire} sourceWire
 * @param {function} getElementByEntityID - Allows this wire to search
 *        for other entities in the simulation
 * @constructor
 * @augments NetSimVizWire
 */
var NetSimVizSimulationWire = module.exports = function (sourceWire,
    getElementByEntityId) {
  var localNode = getElementByEntityId(NetSimVizNode, sourceWire.localNodeID);
  var remoteNode = getElementByEntityId(NetSimVizNode, sourceWire.remoteNodeID);
  NetSimVizWire.call(this, localNode, remoteNode);

  /**
   * ID of the NetSimWire that this NetSimVizSimulationWire maps to.
   * @type {number}
   */
  this.correspondingWireId_ = sourceWire.entityID;

  /**
   * UUID of the NetSimWire that this NetSimVizSimulationWire maps to.
   * @type {number}
   */
  this.correspondingWireUuid_ = sourceWire.uuid;

  /**
   * Bound getElementByEntityId method from vizualization controller;
   * we hold on to this so that calls to configureFrom can find nodes later.
   * @type {Function}
   * @private
   */
  this.getElementByEntityId_ = getElementByEntityId;

  this.configureFrom(sourceWire);
  this.render();
};
NetSimVizSimulationWire.inherits(NetSimVizWire);

/**
 * Configuring a wire means looking up the viz nodes that will be its endpoints.
 * @param {NetSimWire} sourceWire
 */
NetSimVizSimulationWire.prototype.configureFrom = function (sourceWire) {
  this.correspondingWireId_ = sourceWire.entityID;
  this.correspondingWireUuid_ = sourceWire.uuid;

  this.localVizNode = this.getElementByEntityId_(NetSimVizNode, sourceWire.localNodeID);
  this.remoteVizNode = this.getElementByEntityId_(NetSimVizNode, sourceWire.remoteNodeID);

  if (this.localVizNode) {
    this.localVizNode.setAddress(sourceWire.localAddress);
  }

  if (this.remoteVizNode) {
    this.remoteVizNode.setAddress(sourceWire.remoteAddress);
  }

  if (NetSimGlobals.getLevelConfig().broadcastMode) {
    this.getRoot().css('display', 'none');
  }
};

/**
 * ID of the NetSimEntity that maps to this visualization element.
 * @returns {number}
 */
NetSimVizSimulationWire.prototype.getCorrespondingEntityId = function () {
  return this.correspondingWireId_;
};

/**
 * @param {NetSimEntity} entity
 * @returns {boolean} TRUE if this VizElement represents the given NetSimEntity.
 */
NetSimVizSimulationWire.prototype.representsEntity = function (entity) {
  return this.correspondingWireId_ === entity.entityID &&
      this.correspondingWireUuid_ === entity.uuid;
};

/**
 * Killing a visualization node removes its ID so that it won't conflict with
 * another viznode of matching ID being added, and begins its exit animation.
 * @override
 */
NetSimVizSimulationWire.prototype.kill = function () {
  NetSimVizSimulationWire.superPrototype.kill.call(this);
  this.correspondingWireId_ = undefined;
  this.correspondingWireUuid_ = undefined;
};
