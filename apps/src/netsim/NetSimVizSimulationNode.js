/**
 * @overview Nodes in the visualization that map to simulation entities.
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
var netsimConstants = require('./netsimConstants');
var NetSimVizNode = require('./NetSimVizNode');

var NodeType = netsimConstants.NodeType;

var NetSimGlobals = require('./NetSimGlobals');

/**
 * @param {NetSimNode} sourceNode
 * @constructor
 * @augments NetSimVizNode
 */
var NetSimVizSimulationNode = module.exports = function (sourceNode) {
  NetSimVizNode.call(this);

  /**
   * ID of the simulation node that this viz element represents.
   * @type {number}
   */
  this.correspondingNodeID_ = sourceNode.entityID;

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
  this.correspondingNodeID_ = sourceNode.entityID;

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
NetSimVizSimulationNode.prototype.getCorrespondingEntityID = function () {
  return this.correspondingNodeID_;
};

/**
 * Killing a visualization node removes its ID so that it won't conflict with
 * another node of matching ID being added, and begins its exit animation.
 * @override
 */
NetSimVizSimulationNode.prototype.kill = function () {
  NetSimVizSimulationNode.superPrototype.kill.call(this);
  this.correspondingNodeID_ = undefined;
};
