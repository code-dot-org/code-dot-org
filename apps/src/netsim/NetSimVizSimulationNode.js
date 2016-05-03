/**
 * @overview Nodes in the visualization that map to simulation entities.
 */
'use strict';

require('../utils'); // Provides Function.prototype.inherits
var NetSimConstants = require('./NetSimConstants');
var NetSimVizNode = require('./NetSimVizNode');

var NodeType = NetSimConstants.NodeType;

var NetSimGlobals = require('./NetSimGlobals');

/**
 * @param {NetSimNode} sourceNode
 * @param {boolean} useBackgroundAnimation - changes the behavior of this node
 *        when it's in the background layer
 * @constructor
 * @augments NetSimVizNode
 */
var NetSimVizSimulationNode = module.exports = function (sourceNode,
    useBackgroundAnimation) {
  NetSimVizNode.call(this, useBackgroundAnimation);

  /**
   * ID of the NetSimNode that this NetSimVizSimulationNode represents.
   * @type {number}
   */
  this.correspondingNodeID_ = sourceNode.entityID;

  /**
   * UUID of the NetSimNode that this NetSimVizSimulationNode represents.
   * @type {string}
   */
  this.correspondingNodeUuid_ = sourceNode.uuid;

  /**
   * If we end up representing a router, we may need to hold the auto-dns address
   * to pass to a fake auto-dns node.
   * @type {string}
   */
  this.autoDnsAddress = undefined;

  this.configureFrom(sourceNode);
  this.render();
};
NetSimVizSimulationNode.inherits(NetSimVizNode);

/**
 *
 * @param {NetSimNode} sourceNode
 */
NetSimVizSimulationNode.prototype.configureFrom = function (sourceNode) {
  this.correspondingNodeId_ = sourceNode.entityID;
  this.correspondingNodeUuid_ = sourceNode.uuid;

  var levelConfig = NetSimGlobals.getLevelConfig();
  if (levelConfig.showHostnameInGraph) {
    this.setName(sourceNode.getHostname());
  } else {
    this.setName(sourceNode.getShortDisplayName());
  }

  if (sourceNode.getNodeType() === NodeType.ROUTER) {
    this.isRouter = true;
    this.getRoot().addClass('router-node');
    this.autoDnsAddress = sourceNode.getAutoDnsAddress();
    if (levelConfig.broadcastMode) {
      this.getRoot().css('display', 'none');
    }
  }
};

/**
 * ID of the simulation entity that maps to this one.
 * @returns {number}
 */
NetSimVizSimulationNode.prototype.getCorrespondingEntityId = function () {
  return this.correspondingNodeId_;
};

/**
 * @param {NetSimEntity} entity
 * @returns {boolean} TRUE of this VizElement represents the given Entity.
 */
NetSimVizSimulationNode.prototype.representsEntity = function (entity) {
  return this.correspondingNodeId_ === entity.entityID &&
      this.correspondingNodeUuid_ === entity.uuid;
};

/**
 * Killing a visualization node removes its ID so that it won't conflict with
 * another node of matching ID being added, and begins its exit animation.
 * @override
 */
NetSimVizSimulationNode.prototype.kill = function () {
  NetSimVizSimulationNode.superPrototype.kill.call(this);
  this.correspondingNodeId_ = undefined;
  this.correspondingNodeUuid_ = undefined;
};
