/**
 * @overview Wires in the visualization that map to simulation entities.
 */
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
    getElementByEntityID) {
  var localNode = getElementByEntityID(NetSimVizNode, sourceWire.localNodeID);
  var remoteNode = getElementByEntityID(NetSimVizNode, sourceWire.remoteNodeID);
  NetSimVizWire.call(this, localNode, remoteNode);

  /**
   * ID of the simulation wire that this viz element maps to.
   * @type {number}
   */
  this.correspondingWireID_ = sourceWire.entityID;

  /**
   * UUID of the simulation wire that this viz element maps to.
   * @type {number}
   */
  this.correspondingWireUuid_ = sourceWire.uuid;

  /**
   * Bound getElementByEntityID method from vizualization controller;
   * we hold on to this so that calls to configureFrom can find nodes later.
   * @type {Function}
   * @private
   */
  this.getElementByEntityID_ = getElementByEntityID;

  this.configureFrom(sourceWire);
  this.render();
};
NetSimVizSimulationWire.inherits(NetSimVizWire);

/**
 * Configuring a wire means looking up the viz nodes that will be its endpoints.
 * @param {NetSimWire} sourceWire
 */
NetSimVizSimulationWire.prototype.configureFrom = function (sourceWire) {
  this.correspondingWireID_ = sourceWire.entityID;
  this.correspondingWireUuid_ = sourceWire.uuid;

  this.localVizNode = this.getElementByEntityID_(NetSimVizNode, sourceWire.localNodeID);
  this.remoteVizNode = this.getElementByEntityID_(NetSimVizNode, sourceWire.remoteNodeID);

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
 * ID of the simulation entity that maps to this one.
 * @returns {number}
 */
NetSimVizSimulationWire.prototype.getCorrespondingEntityID = function () {
  return this.correspondingWireID_;
};

/**
 * @param {NetSimEntity} entity
 * @returns {boolean} TRUE of this VizElement represents the given Entity.
 */
NetSimVizSimulationWire.prototype.representsEntity = function (entity) {
  return this.correspondingWireID_ === entity.entityID &&
      this.correspondingWireUuid_ === entity.uuid;
};

/**
 * Killing a visualization node removes its ID so that it won't conflict with
 * another node of matching ID being added, and begins its exit animation.
 * @override
 */
NetSimVizSimulationWire.prototype.kill = function () {
  NetSimVizSimulationWire.superPrototype.kill.call(this);
  this.correspondingWireID_ = undefined;
  this.correspondingWireUuid_ = undefined;
};
