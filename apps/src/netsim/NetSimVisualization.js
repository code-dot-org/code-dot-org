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

var utils = require('../utils');
var _ = utils.getLodash();
var netsimNodeFactory = require('./netsimNodeFactory');
var NetSimWire = require('./NetSimWire');
var NetSimVizNode = require('./NetSimVizNode');
var NetSimVizWire = require('./NetSimVizWire');
var tweens = require('./tweens');

/**
 * Top-level controller for the network visualization.
 *
 * For the most part, the visualization attaches to the raw network state
 * representation (the storage tables) and updates to reflect that state,
 * independent of the rest of the controls on the page.  This separation means
 * that the visualization always has one canonical state to observe.
 *
 * @param {jQuery} svgRoot - The <svg> tag within which the visualization
 *        will be created.
 * @param {RunLoop} runLoop - Loop providing tick and render events that the
 *        visualization can hook up to and respond to.
 * @param {NetSim} netsim - core app controller, provides access to change
 *        events and connection information.
 * @constructor
 */
var NetSimVisualization = module.exports = function (svgRoot, runLoop, netsim) {
  /**
   * @type {jQuery}
   * @private
   */
  this.svgRoot_ = svgRoot;

  /**
   * @type {NetSim}
   * @private
   */
  this.netsim_ = netsim;

  /**
   * The shard currently being represented.
   * We don't have a shard now, but we register with the connection manager
   * to find out when we have one.
   * @type {NetSimShard}
   * @private
   */
  this.shard_ = null;
  netsim.shardChange.register(this.onShardChange_.bind(this));

  /**
   * List of VizEntities, which are all the elements that will actually show up
   * in our visualization.
   * @type {Array.<NetSimVizEntity>}
   * @private
   */
  this.entities_ = [];

  /**
   * Width (in svg-units) of visualization
   * @type {number}
   */
  this.visualizationWidth = 300;

  /**
   * Height (in svg-units) of visualization
   * @type {number}
   */
  this.visualizationHeight = 300;

  /**
   * Event registration information
   * @type {Object}
   */
  this.eventKeys = {};

  // Hook up tick and render methods
  runLoop.tick.register(this.tick.bind(this));
  runLoop.render.register(this.render.bind(this));
};

/**
 * Tick: Update all vizentities, giving them an opportunity to recalculate
 *       their internal state, and remove any dead entities from the
 *       visualization.
 * @param {RunLoop.Clock} clock
 */
NetSimVisualization.prototype.tick = function (clock) {
  // Everyone gets an update
  this.entities_.forEach(function (entity) {
    entity.tick(clock);
  });

  // Tear out dead entities.
  this.entities_ = this.entities_.filter(function (entity) {
    if (entity.isDead()) {
      entity.getRoot().remove();
      return false;
    }
    return true;
  });
};

/**
 * Render: Let all vizentities "redraw" (or in our case, touch the DOM)
 */
NetSimVisualization.prototype.render = function () {
  this.entities_.forEach(function (entity) {
    entity.render();
  });
};

/**
 * Called whenever the connection notifies us that we've connected to,
 * or disconnected from, a shard.
 * @param {?NetSimShard} newShard - null if disconnected.
 * @param {?NetSimLocalClientNode} localNode - null if disconnected
 * @private
 */
NetSimVisualization.prototype.onShardChange_= function (newShard, localNode) {
  this.setShard(newShard);
  this.setLocalNode(localNode);
};

/**
 * Change the shard this visualization will source its data from.
 * Re-attaches table change listeners for all the tables we need to monitor.
 * @param {?NetSimShard} newShard - null if disconnected
 */
NetSimVisualization.prototype.setShard = function (newShard) {
  this.shard_ = newShard;

  // If we were registered for shard events, unregister old handlers.
  if (this.eventKeys.registeredWithShard) {
    this.eventKeys.registeredWithShard.nodeTable.tableChange.unregister(
        this.eventKeys.nodeTable);
    this.eventKeys.registeredWithShard.wireTable.tableChange.unregister(
        this.eventKeys.wireTable);
    this.eventKeys.registeredWithShard = null;
  }

  // If we have a new shard, register new handlers.
  if (newShard) {
    this.eventKeys.nodeTable = newShard.nodeTable.tableChange.register(
        this.onNodeTableChange_.bind(this));
    this.eventKeys.wireTable = newShard.wireTable.tableChange.register(
        this.onWireTableChange_.bind(this));
    this.eventKeys.registeredWithShard = newShard;
  }
};

/**
 * Change which node we consider the 'local node' in the visualization.
 * We go through a special creation process for this node, so that it
 * looks and behaves differently.
 * @param {?NetSimLocalClientNode} newLocalNode - null if disconnected
 */
NetSimVisualization.prototype.setLocalNode = function (newLocalNode) {
  // Unregister old handlers
  if (this.eventKeys.registeredWithLocalNode) {
    this.eventKeys.registeredWithLocalNode.remoteChange.unregister(
        this.eventKeys.remoteChange);
    this.eventKeys.registeredWithLocalNode = null;
  }

  // Register new handlers
  if (newLocalNode) {
    this.eventKeys.remoteChange = newLocalNode.remoteChange.register(
        this.onRemoteChange_.bind(this));
    this.eventKeys.registeredWithLocalNode = newLocalNode;
  }

  // Create viznode for local node
  if (newLocalNode) {
    if (this.localNode) {
      this.localNode.configureFrom(newLocalNode);
    } else {
      this.localNode = new NetSimVizNode(newLocalNode);
      this.entities_.push(this.localNode);
      this.svgRoot_.find('#background-group').append(this.localNode.getRoot());
    }
    this.localNode.isLocalNode = true;
  } else {
    this.localNode.kill();
  }
  this.pullElementsToForeground();
};

/**
 * Called whenever the local node notifies that we've been connected to,
 * or disconnected from, a router.
 * @private
 */
NetSimVisualization.prototype.onRemoteChange_ = function () {
  this.pullElementsToForeground();
  this.distributeForegroundNodes();
};

/**
 * Find a particular VizEntity in the visualization, by type and ID.
 * @param {function} entityType - constructor of entity we're looking for
 * @param {number} entityID - ID, with corresponds to NetSimEntity.entityID
 * @returns {NetSimVizEntity} or undefined if not found
 */
NetSimVisualization.prototype.getEntityByID = function (entityType, entityID) {
  return _.find(this.entities_, function (entity) {
    return entity instanceof entityType && entity.id === entityID;
  });
};

/**
 * Gets the set of VizWires directly attached to the given VizNode, (either
 * on the local end or remote end)
 * @param {NetSimVizNode} vizNode
 * @returns {Array.<NetSimVizWire>} the attached wires
 */
NetSimVisualization.prototype.getWiresAttachedToNode = function (vizNode) {
  return this.entities_.filter(function (entity) {
    return entity instanceof NetSimVizWire &&
        (
        (entity.localVizNode === vizNode) ||
        (vizNode.isRouter && entity.remoteVizNode === vizNode)
        );
  });
};

/**
 * Handle notification that node table contents have changed.
 * @param {Array.<Object>} rows - node table rows
 * @private
 */
NetSimVisualization.prototype.onNodeTableChange_ = function (rows) {
  // Convert rows to correctly-typed objects
  var tableNodes = netsimNodeFactory.nodesFromRows(this.shard_, rows);

  // Update collection of VizNodes from source data
  this.updateVizEntitiesOfType_(NetSimVizNode, tableNodes, function (node) {
    var newVizNode = new NetSimVizNode(node);
    newVizNode.snapToPosition(
        Math.random() * this.visualizationWidth - (this.visualizationWidth / 2),
        Math.random() * this.visualizationHeight - (this.visualizationHeight / 2));
    return newVizNode;
  }.bind(this));
};

/**
 * Handle notification that wire table contents have changed.
 * @param {Array.<Object>} rows - wire table rows
 * @private
 */
NetSimVisualization.prototype.onWireTableChange_ = function (rows) {
  // Convert rows to correctly-typed objects
  var tableWires = rows.map(function (row) {
    return new NetSimWire(this.shard_, row);
  }.bind(this));

  // Update collection of VizWires from source data
  this.updateVizEntitiesOfType_(NetSimVizWire, tableWires, function (wire) {
    return new NetSimVizWire(wire, this.getEntityByID.bind(this));
  }.bind(this));

  // Since the wires table determines simulated connectivity, we trigger a
  // recalculation of which nodes are in the local network (should be in the
  // foreground) and then re-layout the foreground nodes.
  this.pullElementsToForeground();
  this.distributeForegroundNodes();
};

/**
 * Compares VizEntities of the given type that are currently in the
 * visualization to the source data given, and creates/updates/removes
 * VizEntities so that the visualization reflects the new source data.
 *
 * @param {function} vizEntityType
 * @param {Array.<NetSimEntity>} entityCollection
 * @param {function} creationMethod
 * @private
 */
NetSimVisualization.prototype.updateVizEntitiesOfType_ = function (
    vizEntityType, entityCollection, creationMethod) {

  // 1. Kill VizEntities that are no longer in the source data
  this.killVizEntitiesOfTypeMissingMatch_(vizEntityType, entityCollection);

  entityCollection.forEach(function (entity) {
    var vizEntity = this.getEntityByID(vizEntityType, entity.entityID);
    if (vizEntity) {
      // 2. Update existing VizEntities from their source data
      vizEntity.configureFrom(entity);
    } else {
      // 3. Create new VizEntities for new source data
      this.addVizEntity_(creationMethod(entity));
    }
  }, this);
};

/**
 * Call kill() on any vizentities that match the given type and don't map to
 * a NetSimEntity in the provided collection.
 * @param {function} vizEntityType
 * @param {Array.<NetSimEntity>} entityCollection
 * @private
 */
NetSimVisualization.prototype.killVizEntitiesOfTypeMissingMatch_ = function (
    vizEntityType, entityCollection) {
  this.entities_.forEach(function (vizEntity) {
    var isCorrectType = (vizEntity instanceof vizEntityType);
    var foundMatch = entityCollection.some(function (entity) {
      return entity.entityID === vizEntity.id;
    });

    if (isCorrectType && !foundMatch) {
      vizEntity.kill();
    }
  });
};

/**
 * Adds a VizEntity to the visualization.
 * @param {NetSimVizEntity} vizEntity
 * @private
 */
NetSimVisualization.prototype.addVizEntity_ = function (vizEntity) {
  this.entities_.push(vizEntity);
  this.svgRoot_.find('#background-group').prepend(vizEntity.getRoot());
};

/**
 * If we do need a DOM change, detach the entity and reattach it to the new
 * layer. Special rule (for now): Prepend wires so that they show up behind
 * nodes.  Will need a better solution for this if/when the viz gets more
 * complex.
 * @param {NetSimVizEntity} vizEntity
 * @param {jQuery} newParent
 */
var moveVizEntityToGroup = function (vizEntity, newParent) {
  vizEntity.getRoot().detach();
  if (vizEntity instanceof NetSimVizWire) {
    vizEntity.getRoot().prependTo(newParent);
  } else {
    vizEntity.getRoot().appendTo(newParent);
  }
};

/**
 * Recalculate which nodes should be in the foreground layer by doing a full
 * traversal starting with the local node.  In short, everything reachable
 * from the local node belongs in the foreground.
 */
NetSimVisualization.prototype.pullElementsToForeground = function () {
  // Begin by marking all entities background (unvisited)
  this.entities_.forEach(function (vizEntity) {
    vizEntity.visited = false;
  });

  if (this.netsim_.isConnectedToRemote()) {
    // Use a simple stack for our list of nodes that need visiting.
    // If we have a local node, push it onto the stack as our starting point.
    // (If we don't have a local node, the next step is REALLY EASY)
    var toExplore = [];
    if (this.localNode) {
      toExplore.push(this.localNode);
    }

    // While there are still nodes that need visiting,
    // visit the next node, marking it as "foreground/visited" and
    // pushing all of its unvisited connections onto the stack.
    var currentVizEntity;
    while (toExplore.length > 0) {
      currentVizEntity = toExplore.pop();
      currentVizEntity.visited = true;
      toExplore = toExplore.concat(this.getUnvisitedNeighborsOf_(currentVizEntity));
    }
  } else if (this.localNode) {
    // ONLY pull the local node to the foreground if we don't have a connection
    // yet.
    this.localNode.visited = true;
  }

  // Now, visited nodes belong in the foreground.
  // Move all nodes to their new, correct layers
  // Possible optimization: Can we do this with just one operation on the live DOM?
  var foreground = this.svgRoot_.find('#foreground-group');
  var background = this.svgRoot_.find('#background-group');
  this.entities_.forEach(function (vizEntity) {
    var isForeground = $.contains(foreground[0], vizEntity.getRoot()[0]);

    // Check whether a change should occur.  If not, we leave
    // newParent undefined so that we don't make unneeded DOM changes.
    if (vizEntity.visited && !isForeground) {
      moveVizEntityToGroup(vizEntity, foreground);
      vizEntity.onDepthChange(true);
    } else if (!vizEntity.visited && isForeground) {
      moveVizEntityToGroup(vizEntity, background);
      vizEntity.onDepthChange(false);
    }
  }, this);
};

/**
 * Visit method for pullElementsToForeground, not used anywhere else.
 * Notes that the current entity is should be foreground when we're all done,
 * finds the current entity's unvisited connections,
 * pushes those connections onto the stack.
 * @param {NetSimVizNode|NetSimVizWire} vizEntity
 * @returns {Array.<NetSimVizEntity>}
 * @private
 */
NetSimVisualization.prototype.getUnvisitedNeighborsOf_ = function (vizEntity) {
  // Find new entities to explore based on node type and connections
  var neighbors = [];

  if (vizEntity instanceof NetSimVizNode) {
    neighbors = this.getWiresAttachedToNode(vizEntity);
  } else if (vizEntity instanceof NetSimVizWire) {
    if (vizEntity.localVizNode) {
      neighbors.push(vizEntity.localVizNode);
    }

    if (vizEntity.remoteVizNode) {
      neighbors.push(vizEntity.remoteVizNode);
    }
  }

  return neighbors.filter(function (vizEntity) {
    return !vizEntity.visited;
  });
};

/**
 * Explicitly control VizNodes in the foreground, moving them into a desired
 * configuration based on their number and types.  Nodes are given animation
 * commands (via tweenToPosition) so that they interpolate nicely to their target
 * positions.
 *
 * Configurations:
 * One node (local node): Centered on the screen.
 *   |  L  |
 *
 * Two nodes: Local node on left, remote node on right, nothing in the middle.
 *   | L-R |
 *
 * Three or more nodes: Local node on left, router in the middle, other
 * nodes distributed evenly around the router in a circle
 * 3:         4:    O    5:  O      6:O   O    7:O   O
 *                 /         |         \ /        \ /
 *   L-R-0      L-R        L-R-O      L-R        L-R-O
 *                 \         |         / \        / \
 *                  O        O        O   O      O   O
 */
NetSimVisualization.prototype.distributeForegroundNodes = function () {
  /** @type {Array.<NetSimVizNode>} */
  var foregroundNodes = this.entities_.filter(function (entity) {
    return entity instanceof NetSimVizNode && entity.isForeground;
  });

  // Sometimes, there's no work to do.
  if (foregroundNodes.length === 0) {
    return;
  }

  // One node: Centered on screen
  if (foregroundNodes.length === 1) {
    foregroundNodes[0].tweenToPosition(0, 0, 600, tweens.easeOutQuad);
    return;
  }

  var myNode;

  // Two nodes: Placed across from each other, local node on left
  if (foregroundNodes.length === 2) {
    myNode = this.localNode;
    var otherNode = _.find(foregroundNodes, function (node) {
      return node !== myNode;
    });
    myNode.tweenToPosition(-75, 0, 400, tweens.easeOutQuad);
    otherNode.tweenToPosition(75, 0, 600, tweens.easeOutQuad);
    return;
  }

  // Three or more nodes:
  // * Local node on left
  // * Router in the middle
  // * Other nodes evenly distributed in a circle
  myNode = this.localNode;
  var routerNode = _.find(foregroundNodes, function (node) {
    return node.isRouter;
  });
  var otherNodes = foregroundNodes.filter(function (node) {
    return node !== myNode && node !== routerNode;
  });

  myNode.tweenToPosition(-100, 0, 400, tweens.easeOutQuad);
  routerNode.tweenToPosition(0, 0, 500, tweens.easeOutQuad);
  var radiansBetweenNodes = 2*Math.PI / (otherNodes.length + 1); // Include myNode!
  for (var i = 0; i < otherNodes.length; i++) {
    // sin(rad) = o/h
    var h = 100;
    // Extra Math.PI here puts 0deg on the left.
    var rad = Math.PI + (i+1) * radiansBetweenNodes;
    var x = Math.cos(rad) * h;
    var y = Math.sin(rad) * h;
    otherNodes[i].tweenToPosition(x, y, 600, tweens.easeOutQuad);
  }
};

/**
 * @param {string} newDnsMode
 */
NetSimVisualization.prototype.setDnsMode = function (newDnsMode) {
  // Tell all nodes about the new DNS mode, so they can decide whether to
  // show or hide their address.
  this.entities_.forEach(function (vizEntity) {
    if (vizEntity instanceof NetSimVizNode) {
      vizEntity.setDnsMode(newDnsMode);
    }
  });
};

/**
 * @param {number} dnsNodeID
 */
NetSimVisualization.prototype.setDnsNodeID = function (dnsNodeID) {
  this.entities_.forEach(function (vizEntity) {
    if (vizEntity instanceof NetSimVizNode) {
      vizEntity.setIsDnsNode(vizEntity.id === dnsNodeID);
    }
  });
};
