/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxstatements: 200
 */
/* global $ */
'use strict';

require('../utils');
var NetSimWire = require('./NetSimWire');
var NetSimVizNode = require('./NetSimVizNode');
var NetSimVizWire = require('./NetSimVizWire');
var netsimUtils = require('./netsimUtils');

/**
 * Generator and controller for visualization
 * @param {jQuery} svgRoot
 * @param {RunLoop} runLoop
 * @param {NetSimConnection} connection
 * @constructor
 */
var NetSimVisualization = module.exports = function (svgRoot, runLoop, connection) {
  /**
   * @type {jQuery}
   * @private
   */
  this.svgRoot_ = svgRoot;

  runLoop.tick.register(this.tick.bind(this));
  runLoop.render.register(this.render.bind(this));

  /**
   * The shard currently being represented.
   * @type {NetSimShard}
   * @private
   */
  this.shard_ = null;
  connection.shardChange.register(this.onShardChange_.bind(this));

  /**
   * @type {Array.<NetSimVizEntity>}
   * @private
   */
  this.entities_ = [];
};

NetSimVisualization.prototype.tick = function (clock) {
  this.entities_.forEach(function (entity) {
    entity.tick(clock);
  });
  this.entities_ = this.entities_.filter(function (entity) {
    if (entity.isDead()) {
      entity.getRoot().remove();
      return false;
    }
    return true;
  });
};

NetSimVisualization.prototype.render = function () {
  this.entities_.forEach(function (entity) {
    entity.render();
  });
};

/**
 * Called whenever the connection notifies us that we've connected to,
 * or disconnected from, a shard.
 * @param {NetSimShard} newShard - null if disconnected.
 * @param {NetSimLocalClientNode} localNode - null if disconnected
 * @private
 */
NetSimVisualization.prototype.onShardChange_= function (newShard, localNode) {
  this.setShard(newShard);
  this.setLocalNode(localNode);
};

/**
 * Change the shard this visualization will source its data from.
 * Re-attaches table change listeners for all the tables we need to monitor.
 * @param newShard
 */
NetSimVisualization.prototype.setShard = function (newShard) {
  if (this.nodeTableChangeKey !== undefined) {
    this.shard_.nodeTable.tableChange.unregister(this.nodeTableChangeKey);
    this.nodeTableChangeKey = undefined;
  }

  if (this.wireTableChangeKey !== undefined) {
    this.shard_.wireTable.tableChange.unregister(this.wireTableChangeKey);
    this.wireTableChangeKey = undefined;
  }

  this.shard_ = newShard;
  if (!this.shard_) {
    return;
  }

  this.nodeTableChangeKey = this.shard_.nodeTable.tableChange.register(
      this.onNodeTableChange_.bind(this));

  this.wireTableChangeKey = this.shard_.wireTable.tableChange.register(
      this.onWireTableChange_.bind(this));
};

NetSimVisualization.prototype.setLocalNode = function (newLocalNode) {
  if (newLocalNode) {
    if (this.localNode) {
      this.localNode.configureFrom(newLocalNode);
    } else {
      this.localNode = new NetSimVizNode(newLocalNode);
      this.entities_.push(this.localNode);
      this.svgRoot_.find('#background_group').append(this.localNode.getRoot());
    }
  } else {
    this.localNode.kill();
  }
  this.pullElementsToForeground();
};

NetSimVisualization.prototype.getEntityByID = function (entityType, entityID) {
  return this.entities_.reduce(function (prev, cur) {
    if (prev) {
      return prev;
    } else if (cur instanceof entityType && cur.id === entityID) {
      return cur;
    }
    return null;
  }, null);
};

/**
 *
 * @param {NetSimVizNode} vizNode
 */
NetSimVisualization.prototype.getWiresAttachedToNode = function (vizNode) {
  return this.entities_.filter(function (entity) {
    return entity instanceof NetSimVizWire &&
        (entity.localVizNode === vizNode || entity.remoteVizNode === vizNode);
  });
};

NetSimVisualization.prototype.onNodeTableChange_ = function (rows) {
  var tableNodes = netsimUtils.nodesFromRows(this.shard_, rows);

  // 1. Kill nodes from the visualization that are no longer in the table.
  this.entities_.filter(function (entity) {
    return entity instanceof NetSimVizNode;
  }).filter(function (vizNode) {
    return !tableNodes.some(function (node) {
      return node.entityID === vizNode.id;
    });
  }).forEach(function (vizNode) {
    vizNode.kill();
  });

  // 2. Add new nodes from the table into the visualization
  var vizNode;
  tableNodes.forEach(function (node) {
    vizNode = this.getEntityByID(NetSimVizNode, node.entityID);
    if (vizNode) {
      vizNode.configureFrom(node);
    } else {
      vizNode = new NetSimVizNode(node);
      vizNode.moveTo(Math.random() * 200 - 100, Math.random() * 200 - 100);
      this.entities_.push(vizNode);
      this.svgRoot_.find('#background_group').prepend(vizNode.getRoot());
    }
  }, this);
};

NetSimVisualization.prototype.onWireTableChange_ = function (rows) {
  var tableWires = rows.map(function (row) {
    return new NetSimWire(this.shard_, row);
  }.bind(this));

  // 1. Kill wires that are no longer in the table
  this.entities_.filter(function (entity) {
    return entity instanceof NetSimVizWire;
  }).filter(function (vizWire) {
    return !tableWires.some(function (wire) {
      return wire.entityID === vizWire.id;
    });
  }).forEach(function (vizWire) {
    vizWire.kill();
  });

  // 2. Add new wires into the visualization
  var vizWire;
  tableWires.forEach(function (wire) {
    vizWire = this.getEntityByID(NetSimVizWire, wire.entityID);
    if (vizWire) {
      vizWire.configureFrom(wire);
    } else {
      vizWire = new NetSimVizWire(wire, this.getEntityByID.bind(this));
      this.entities_.push(vizWire);
      this.svgRoot_.find('#background_group').prepend(vizWire.getRoot());
    }
  }, this);

  this.pullElementsToForeground();
};

var visitEntity = function (entity, stack) {
  entity.speculativeIsForeground = true;

  // Push new entities to explore based on node type and connections
  if (entity instanceof NetSimVizNode) {
    // Nodes look for connected wires
    this.getWiresAttachedToNode(entity).forEach(function (wire) {
      // Don't explore twice!
      if (!wire.speculativeIsForeground) {
        stack.push(wire);
      }
    });
  } else if (entity instanceof NetSimVizWire) {
    // Wires know their connected nodes
    if (!entity.localVizNode.speculativeIsForeground) {
      stack.push(entity.localVizNode);
    }
    if (!entity.remoteVizNode.speculativeIsForeground) {
      stack.push(entity.remoteVizNode);
    }
  }
};

NetSimVisualization.prototype.pullElementsToForeground = function () {
  // Assume all entities should be background.
  this.entities_.forEach(function (entity) {
    entity.speculativeIsForeground = false;
  });

  var exploreStack = [];
  if (this.localNode) {
    exploreStack.push(this.localNode);
  }

  var currentEntity;
  while (exploreStack.length > 0) {
    // Pop end of exploreStack, make it foreground.
    currentEntity = exploreStack.pop();
    visitEntity(currentEntity, exploreStack);
  }

  // Move all nodes to their new, correct layers
  var foreground = this.svgRoot_.find('#foreground_group');
  var background = this.svgRoot_.find('#background_group');
  var newParent, isForeground;
  this.entities_.forEach(function (entity) {
    newParent = undefined;
    isForeground = $.contains(foreground[0], entity.getRoot()[0]);

    if (entity.speculativeIsForeground && !isForeground) {
      newParent = foreground;
    } else if (!entity.speculativeIsForeground && isForeground) {
      newParent = background;
    }

    if (newParent) {
      entity.getRoot().detach();
      if (entity instanceof NetSimVizWire) {
        entity.getRoot().prependTo(newParent);
      } else {
        entity.getRoot().appendTo(newParent);
      }
      entity.onDepthChange(newParent === foreground);
    }
  }, this);
};
