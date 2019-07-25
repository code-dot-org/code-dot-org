/**
 * @overview Top-level controller for the network visualization.
 */

import $ from 'jquery';
var _ = require('lodash');
var visualizationMarkup = require('./NetSimVisualization.html.ejs');
var NetSimNodeFactory = require('./NetSimNodeFactory');
var NetSimWire = require('./NetSimWire');
var NetSimVizAutoDnsNode = require('./NetSimVizAutoDnsNode');
var NetSimVizNode = require('./NetSimVizNode');
var NetSimVizSimulationNode = require('./NetSimVizSimulationNode');
var NetSimVizSimulationWire = require('./NetSimVizSimulationWire');
var NetSimVizWire = require('./NetSimVizWire');
var NetSimGlobals = require('./NetSimGlobals');
var tweens = require('./tweens');
var NetSimConstants = require('./NetSimConstants');
var DnsMode = NetSimConstants.DnsMode;
var NodeType = NetSimConstants.NodeType;

/**
 * Whether the blurred visualization background should be shown.
 * @const {boolean}
 */
var SHOW_BACKGROUND = false;

/**
 * Top-level controller for the network visualization.
 *
 * For the most part, the visualization attaches to the raw network state
 * representation (the storage tables) and updates to reflect that state,
 * independent of the rest of the controls on the page.  This separation means
 * that the visualization always has one canonical state to observe.
 *
 * @param {jQuery} rootDiv - The <div> tag within which the visualization
 *        will be created.
 * @param {RunLoop} runLoop - Loop providing tick and render events that the
 *        visualization can hook up to and respond to.
 * @constructor
 */
var NetSimVisualization = (module.exports = function(rootDiv, runLoop) {
  /**
   * @private {jQuery}
   */
  this.rootDiv_ = rootDiv;

  // Immediately, drop our SVG canvas and basic groups into the DOM
  this.rootDiv_.html(
    visualizationMarkup({
      showBackground: SHOW_BACKGROUND
    })
  );

  /**
   * @private {jQuery}
   */
  this.svgRoot_ = this.rootDiv_.find('svg');

  /**
   * Background group never goes away, so search for it once and cache
   * it here.
   * @private {jQuery}
   */
  this.backgroundGroup_ = this.svgRoot_.find('#background-group');

  /**
   * Foreground group never goes away, so search for it once and cache
   * it here.
   * @private {jQuery}
   */
  this.foregroundGroup_ = this.svgRoot_.find('#foreground-group');

  /**
   * The shard currently being represented.
   * We don't have a shard now, but we register with the connection manager
   * to find out when we have one.
   * @private {NetSimShard}
   */
  this.shard_ = null;

  /**
   * List of VizEntities, which are all the elements that will actually show up
   * in our visualization.
   * @private {NetSimVizElement[]}
   */
  this.elements_ = [];

  /**
   * Reference to the local node viz element, the anchor for the visualization.
   * @type {NetSimVizSimulationNode}
   */
  this.localNode = null;

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
   * Last known DNS mode, so that new elements can be created with the
   * correct default
   * @type {DnsMode}
   */
  this.dnsMode_ = null;

  /**
   * Reference to visualized auto-DNS node, a fake node (not mapped to the
   * simulation in a normal way) that also lives in our elements_ collection.
   * @type {NetSimVizAutoDnsNode}
   * @private
   */
  this.autoDnsNode_ = null;

  /**
   * Reference to wire between the auto-DNS node and the foreground router.
   * Managed manually so we keep a handle on it, but also lives in the elements_
   * collection.
   * @type {NetSimVizWire}
   * @private
   */
  this.autoDnsWire_ = null;

  /**
   * Event registration information
   * @type {Object}
   */
  this.eventKeys = {};

  /**
   * Last known encodings set, so that new elements can be created with
   * the correct default
   * @type {EncodingType[]}
   */
  this.encodings_ = [];

  // Hook up tick and render methods
  runLoop.tick.register(this.tick.bind(this));
  runLoop.render.register(this.render.bind(this));
});

/**
 * Tick: Update all vizentities, giving them an opportunity to recalculate
 *       their internal state, and remove any dead entities from the
 *       visualization.
 * @param {RunLoop.Clock} clock
 */
NetSimVisualization.prototype.tick = function(clock) {
  // Everyone gets an update
  this.elements_.forEach(function(element) {
    element.tick(clock);
  });

  // Tear out dead entities.
  this.elements_ = this.elements_.filter(function(element) {
    if (element.isDead()) {
      element.getRoot().remove();
      return false;
    }
    return true;
  });
};

/**
 * Render: Let all vizentities "redraw" (or in our case, touch the DOM)
 * @param {RunLoop.Clock} clock
 */
NetSimVisualization.prototype.render = function(clock) {
  this.elements_.forEach(function(element) {
    element.render(clock);
  });
};

/**
 * Change the shard this visualization will source its data from.
 * Re-attaches table change listeners for all the tables we need to monitor.
 * @param {?NetSimShard} newShard - null if disconnected
 */
NetSimVisualization.prototype.setShard = function(newShard) {
  this.shard_ = newShard;

  // If we were registered for shard events, unregister old handlers.
  if (this.eventKeys.registeredWithShard) {
    this.eventKeys.registeredWithShard.nodeTable.tableChange.unregister(
      this.eventKeys.nodeTable
    );
    this.eventKeys.registeredWithShard.wireTable.tableChange.unregister(
      this.eventKeys.wireTable
    );
    this.eventKeys.registeredWithShard = null;
  }

  // If we have a new shard, register new handlers.
  if (newShard) {
    this.eventKeys.nodeTable = newShard.nodeTable.tableChange.register(
      this.onNodeTableChange_.bind(this)
    );
    this.eventKeys.wireTable = newShard.wireTable.tableChange.register(
      this.onWireTableChange_.bind(this)
    );
    this.eventKeys.registeredWithShard = newShard;
  }
};

/**
 * Change which node we consider the 'local node' in the visualization.
 * We go through a special creation process for this node, so that it
 * looks and behaves differently.
 * @param {?NetSimLocalClientNode} newLocalNode - null if disconnected
 */
NetSimVisualization.prototype.setLocalNode = function(newLocalNode) {
  // Unregister old handlers
  if (this.eventKeys.registeredWithLocalNode) {
    this.eventKeys.registeredWithLocalNode.remoteChange.unregister(
      this.eventKeys.remoteChange
    );
    this.eventKeys.registeredWithLocalNode.wireStateChange.unregister(
      this.eventKeys.wireStateChange
    );
    this.eventKeys.registeredWithLocalNode = null;
  }

  // Register new handlers
  if (newLocalNode) {
    this.eventKeys.remoteChange = newLocalNode.remoteChange.register(
      this.onRemoteChange_.bind(this)
    );
    this.eventKeys.wireStateChange = newLocalNode.wireStateChange.register(
      this.onWireStateChange_.bind(this)
    );
    this.eventKeys.registeredWithLocalNode = newLocalNode;
  }

  // Create viznode for local node
  if (newLocalNode) {
    if (this.localNode) {
      this.localNode.configureFrom(newLocalNode);
    } else {
      this.localNode = new NetSimVizSimulationNode(
        newLocalNode,
        SHOW_BACKGROUND
      );
      this.elements_.push(this.localNode);
      this.backgroundGroup_.append(this.localNode.getRoot());
    }
    this.localNode.setIsLocalNode();
  } else {
    if (this.localNode) {
      this.localNode.kill();
      this.localNode = null;
    }
  }
  this.pullElementsToForeground();
};

/**
 * Called whenever the local node notifies that we've been connected to,
 * or disconnected from, a router.
 * @private
 */
NetSimVisualization.prototype.onRemoteChange_ = function() {
  this.pullElementsToForeground();
  this.distributeForegroundNodes();
};

/**
 * Called whenever the simplex wire changes state
 * @private
 */
NetSimVisualization.prototype.onWireStateChange_ = function(newState) {
  var vizWire = this.getVizWireToRemote();
  var incomingWire = this.getVizWireFromRemote();
  if (!(vizWire && incomingWire)) {
    return;
  }

  // Hide the incoming wire because we are in simplex mode.
  incomingWire.hide();
  // Change the wire state on the outgoing wire
  vizWire.setWireState(newState);
};

/**
 * Find a particular VizElement in the visualization, by type and ID.
 * @param {function} elementType - constructor of element we're looking for
 * @param {number} entityID - ID, with corresponds to NetSimEntity.entityID
 * @returns {NetSimVizElement} or undefined if not found
 */
NetSimVisualization.prototype.getElementByEntityID = function(
  elementType,
  entityID
) {
  return _.find(this.elements_, function(element) {
    return (
      element instanceof elementType &&
      element.getCorrespondingEntityId &&
      element.getCorrespondingEntityId() === entityID
    );
  });
};

/**
 * Gets the set of VizWires directly attached to the given VizNode on
 * the local end for which there are also corresponding VizWires coming
 * from the opposite end. Note that if the VizNode is a router, we
 * consider all attached wires to be reciprocated.
 * @param {NetSimVizSimulationNode} vizNode
 * @returns {Array.<NetSimVizSimulationWire>} the attached wires
 */
NetSimVisualization.prototype.getReciprocatedWiresAttachedToNode = function(
  vizNode
) {
  if (vizNode.isRouter) {
    return this.getWiresAttachedToNode(vizNode);
  }

  var localWires = this.getLocalWiresAttachedToNode(vizNode);

  return localWires.filter(function(localWire) {
    if (localWire.remoteVizNode.isRouter) {
      return true;
    }

    return this.getWiresAttachedToNode(localWire.remoteVizNode).some(function(
      wire
    ) {
      return wire.remoteVizNode === vizNode;
    });
  }, this);
};

/**
 * Gets the set of VizWires directly attached to the given VizNode on the local end
 * @param {NetSimVizSimulationNode} vizNode
 * @returns {Array.<NetSimVizSimulationWire>} the attached wires
 */
NetSimVisualization.prototype.getLocalWiresAttachedToNode = function(vizNode) {
  return this.elements_.filter(function(element) {
    return element instanceof NetSimVizWire && element.localVizNode === vizNode;
  });
};

/**
 * Gets the set of VizWires directly attached to the given VizNode, (either
 * on the local end or remote end)
 * @param {NetSimVizSimulationNode} vizNode
 * @returns {Array.<NetSimVizSimulationWire>} the attached wires
 */
NetSimVisualization.prototype.getWiresAttachedToNode = function(vizNode) {
  return this.elements_.filter(function(element) {
    return (
      element instanceof NetSimVizWire &&
      (element.localVizNode === vizNode || element.remoteVizNode === vizNode)
    );
  });
};

/**
 * Handle notification that node table contents have changed.
 * @private
 */
NetSimVisualization.prototype.onNodeTableChange_ = function() {
  // Convert rows to correctly-typed objects
  var tableNodes = NetSimNodeFactory.nodesFromRows(
    this.shard_,
    this.shard_.nodeTable.readAll()
  );

  // Update collection of VizNodes from source data
  this.updateVizEntitiesOfType_(
    NetSimVizSimulationNode,
    tableNodes,
    function(node) {
      var newVizNode = new NetSimVizSimulationNode(node, SHOW_BACKGROUND);
      newVizNode.setDnsMode(this.dnsMode_);
      newVizNode.snapToPosition(
        Math.random() * this.visualizationWidth - this.visualizationWidth / 2,
        Math.random() * this.visualizationHeight - this.visualizationHeight / 2
      );
      return newVizNode;
    }.bind(this)
  );
};

/**
 * Handle notification that wire table contents have changed.
 * @private
 */
NetSimVisualization.prototype.onWireTableChange_ = function() {
  // Convert rows to correctly-typed objects
  var tableWires = this.shard_.wireTable.readAll().map(function(row) {
    return new NetSimWire(this.shard_, row);
  }, this);

  // Update collection of VizWires from source data
  this.updateVizEntitiesOfType_(
    NetSimVizSimulationWire,
    tableWires,
    function(wire) {
      var newVizWire = new NetSimVizSimulationWire(
        wire,
        this.getElementByEntityID.bind(this)
      );
      newVizWire.setEncodings(this.encodings_);
      return newVizWire;
    }.bind(this)
  );

  // In broadcast mode we hide the real wires and router, and overlay a set
  // of fake wires showing everybody connected to everybody else.
  if (NetSimGlobals.getLevelConfig().broadcastMode) {
    this.updateBroadcastModeWires_();
  }

  // Since the wires table determines simulated connectivity, we trigger a
  // recalculation of which nodes are in the local network (should be in the
  // foreground) and then re-layout the foreground nodes.
  this.pullElementsToForeground();
  this.distributeForegroundNodes();
};

/**
 * Based on new connectivity information, recalculate which 'fake' connections
 * we need to display to show all nodes in a 'room' having direct wires to
 * one another.
 * @private
 */
NetSimVisualization.prototype.updateBroadcastModeWires_ = function() {
  // Kill all fake wires
  this.elements_.forEach(function(vizElement) {
    if (
      vizElement instanceof NetSimVizWire &&
      !(vizElement instanceof NetSimVizSimulationWire)
    ) {
      vizElement.kill();
    }
  }, this);

  // Generate new wires
  var connections = this.generateBroadcastModeConnections_();
  connections.forEach(function(connectedPair) {
    var newFakeWire = new NetSimVizWire(
      connectedPair.nodeA,
      connectedPair.nodeB
    );
    this.addVizElement_(newFakeWire);
  }, this);
};

/**
 * Using the cached node and wire data, generates the set of all node pairs (A,B)
 * on the shard such that both A and B are client nodes, and A is reachable
 * from B.
 * @returns {Array.<{nodeA:{number}, nodeB:{number}}>}
 * @private
 */
NetSimVisualization.prototype.generateBroadcastModeConnections_ = function() {
  var nodeRows = this.shard_.nodeTable.readAll();
  var wireRows = this.shard_.wireTable.readAll();
  var nodeCount = nodeRows.length;

  // Generate a reverse mapping for lookups
  var nodeIDToIndex = {};
  for (var matrixIndex = 0; matrixIndex < nodeCount; matrixIndex++) {
    nodeIDToIndex[nodeRows[matrixIndex].id] = matrixIndex;
  }

  // Generate empty graph matrix initialized with no connections.
  var graph = new Array(nodeCount);
  for (var x = 0; x < nodeCount; x++) {
    graph[x] = new Array(nodeCount);
    for (var y = 0; y < nodeCount; y++) {
      graph[x][y] = false;
    }
  }

  // Apply real connections (wires) to the graph matrix
  wireRows.forEach(function(wireRow) {
    var localNodeIndex = nodeIDToIndex[wireRow.localNodeID];
    var remoteNodeIndex = nodeIDToIndex[wireRow.remoteNodeID];
    if (localNodeIndex !== undefined && remoteNodeIndex !== undefined) {
      graph[localNodeIndex][remoteNodeIndex] = true;
      graph[remoteNodeIndex][localNodeIndex] = true;
    }
  });

  // Use simple Floyd-Warshall to complete the transitive closure graph
  for (var k = 0; k < nodeCount; k++) {
    for (var i = 0; i < nodeCount; i++) {
      for (var j = 0; j < nodeCount; j++) {
        if (graph[i][k] && graph[k][j]) {
          graph[i][j] = true;
        }
      }
    }
  }

  // Now, generate unique pairs doing lookup on our transitive closure graph
  var connections = [];
  for (var from = 0; from < nodeCount - 1; from++) {
    for (var to = from + 1; to < nodeCount; to++) {
      // leave router connections out of this list
      var clientToClient =
        nodeRows[from].type === NodeType.CLIENT &&
        nodeRows[to].type === NodeType.CLIENT;
      // Must be reachable
      var reachable = graph[from][to];
      if (clientToClient && reachable) {
        connections.push({
          nodeA: this.getElementByEntityID(
            NetSimVizSimulationNode,
            nodeRows[from].id
          ),
          nodeB: this.getElementByEntityID(
            NetSimVizSimulationNode,
            nodeRows[to].id
          )
        });
      }
    }
  }
  return connections;
};

/**
 * Compares VizEntities of the given type that are currently in the
 * visualization to the source data given, and creates/updates/removes
 * VizEntities so that the visualization reflects the new source data.
 *
 * @param {function} vizElementType
 * @param {Array.<NetSimEntity>} entityCollection
 * @param {function} creationMethod
 * @private
 */
NetSimVisualization.prototype.updateVizEntitiesOfType_ = function(
  vizElementType,
  entityCollection,
  creationMethod
) {
  // 1. Kill VizEntities that are no longer in the source data
  this.killVizEntitiesOfTypeMissingMatch_(vizElementType, entityCollection);

  entityCollection.forEach(function(entity) {
    var vizElement = this.getElementByEntityID(vizElementType, entity.entityID);
    if (vizElement) {
      // 2. Update existing VizEntities from their source data
      vizElement.configureFrom(entity);
    } else {
      // 3. Create new VizEntities for new source data
      this.addVizElement_(creationMethod(entity));
    }
  }, this);
};

/**
 * Call kill() on any vizentities that match the given type and don't map to
 * a NetSimEntity in the provided collection.
 * @param {function} vizElementType
 * @param {Array.<NetSimEntity>} entityCollection
 * @private
 */
NetSimVisualization.prototype.killVizEntitiesOfTypeMissingMatch_ = function(
  vizElementType,
  entityCollection
) {
  this.elements_.forEach(function(vizElement) {
    var isCorrectType = vizElement instanceof vizElementType;
    var foundMatch = entityCollection.some(function(entity) {
      return vizElement.representsEntity && vizElement.representsEntity(entity);
    });

    if (isCorrectType && !foundMatch) {
      vizElement.kill();
    }
  });
};

/**
 * Adds a VizElement to the visualization.
 * @param {NetSimVizElement} vizElement
 * @private
 */
NetSimVisualization.prototype.addVizElement_ = function(vizElement) {
  this.elements_.push(vizElement);
  this.backgroundGroup_.prepend(vizElement.getRoot());
};

/**
 * If we do need a DOM change, detach the element and reattach it to the new
 * layer. Special rule (for now): Prepend wires so that they show up behind
 * nodes.  Will need a better solution for this if/when the viz gets more
 * complex.
 * @param {NetSimVizElement} vizElement
 * @param {jQuery} newParent
 */
var moveVizElementToGroup = function(vizElement, newParent) {
  vizElement.getRoot().detach();
  if (vizElement instanceof NetSimVizWire) {
    vizElement.getRoot().prependTo(newParent);
  } else {
    vizElement.getRoot().appendTo(newParent);
  }
};

/**
 * Recalculate which nodes should be in the foreground layer by doing a full
 * traversal starting with the local node.  In short, everything reachable
 * from the local node belongs in the foreground.
 */
NetSimVisualization.prototype.pullElementsToForeground = function() {
  // Begin by marking all entities background (unvisited)
  this.elements_.forEach(function(vizElement) {
    vizElement.visited = false;
  });

  var toExplore = [];
  if (this.localNode) {
    toExplore.push(this.localNode);
  }

  // While there are still nodes that need visiting,
  // visit the next node, marking it as "foreground/visited" and
  // pushing all of its unvisited connections onto the stack.
  var currentVizElement;
  while (toExplore.length > 0) {
    currentVizElement = toExplore.pop();
    currentVizElement.visited = true;
    toExplore = toExplore.concat(
      this.getUnvisitedNeighborsOf_(currentVizElement)
    );
  }

  // Now, visited nodes belong in the foreground.
  // Move all nodes to their new, correct layers
  // Possible optimization: Can we do this with just one operation on the live DOM?
  var foreground = this.foregroundGroup_;
  var background = this.backgroundGroup_;
  this.elements_.forEach(function(vizElement) {
    var isForeground = $.contains(foreground[0], vizElement.getRoot()[0]);

    // Check whether a change should occur.  If not, we leave
    // newParent undefined so that we don't make unneeded DOM changes.
    if (vizElement.visited && !isForeground) {
      moveVizElementToGroup(vizElement, foreground);
      vizElement.onDepthChange(true);
    } else if (!vizElement.visited && isForeground) {
      moveVizElementToGroup(vizElement, background);
      vizElement.onDepthChange(false);
    }
  }, this);

  this.updateAutoDnsNode();
};

/**
 * Visit method for pullElementsToForeground, not used anywhere else.
 * Notes that the current element is should be foreground when we're all done,
 * finds the current element's unvisited connections,
 * pushes those connections onto the stack.
 * @param {NetSimVizSimulationNode|NetSimVizSimulationWire} vizElement
 * @returns {Array.<NetSimVizElement>}
 * @private
 */
NetSimVisualization.prototype.getUnvisitedNeighborsOf_ = function(vizElement) {
  // Find new entities to explore based on node type and connections
  var neighbors = [];

  if (vizElement instanceof NetSimVizSimulationNode) {
    // In broadcast mode we display "fake," unidirectional wires. In
    // regular mode, we only want to display wires connecting us to
    // nodes that are also connected back.
    if (NetSimGlobals.getLevelConfig().broadcastMode) {
      neighbors = this.getWiresAttachedToNode(vizElement);
    } else {
      neighbors = this.getReciprocatedWiresAttachedToNode(vizElement);
    }

    // Special case: The DNS node fake is a neighbor of a visited router
    if (vizElement.isRouter && this.autoDnsNode_) {
      neighbors.push(this.autoDnsNode_);
      neighbors.push(this.autoDnsWire_);
    }
  } else if (vizElement instanceof NetSimVizWire) {
    if (vizElement.localVizNode) {
      neighbors.push(vizElement.localVizNode);
    }

    if (vizElement.remoteVizNode) {
      neighbors.push(vizElement.remoteVizNode);
    }
  }

  return neighbors.filter(function(vizElement) {
    return !vizElement.visited;
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
NetSimVisualization.prototype.distributeForegroundNodes = function() {
  if (NetSimGlobals.getLevelConfig().broadcastMode) {
    this.distributeForegroundNodesForBroadcast_();
    return;
  }

  /** @type {Array.<NetSimVizSimulationNode>} */
  var foregroundNodes = this.elements_.filter(function(element) {
    return element instanceof NetSimVizNode && element.isForeground;
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
    var otherNode = _.find(foregroundNodes, function(node) {
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
  var routerNode = _.find(foregroundNodes, function(node) {
    return node.isRouter;
  });
  var otherNodes = foregroundNodes.filter(function(node) {
    return node !== myNode && node !== routerNode;
  });

  myNode.tweenToPosition(-100, 0, 400, tweens.easeOutQuad);
  routerNode.tweenToPosition(0, 0, 500, tweens.easeOutQuad);
  var radiansBetweenNodes = (2 * Math.PI) / (otherNodes.length + 1); // Include myNode!
  for (var i = 0; i < otherNodes.length; i++) {
    // sin(rad) = o/h
    var h = 100;
    // Extra Math.PI here puts 0deg on the left.
    var rad = Math.PI + (i + 1) * radiansBetweenNodes;
    var x = Math.cos(rad) * h;
    var y = Math.sin(rad) * h;
    otherNodes[i].tweenToPosition(x, y, 600, tweens.easeOutQuad);
  }
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
 * Three or more nodes: Distributed around center of frame
 * 3:    O    4:  O      5: O  O    6: O O
 *   L          L   O      L          L   O
 *       O        O         O  O       O O
 */
NetSimVisualization.prototype.distributeForegroundNodesForBroadcast_ = function() {
  /** @type {Array.<NetSimVizSimulationNode>} */
  var foregroundNodes = this.elements_.filter(function(element) {
    return (
      element instanceof NetSimVizSimulationNode &&
      element.isForeground &&
      !element.isRouter
    );
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
    var otherNode = _.find(foregroundNodes, function(node) {
      return node !== myNode;
    });
    myNode.tweenToPosition(-75, 0, 400, tweens.easeOutQuad);
    otherNode.tweenToPosition(75, 0, 600, tweens.easeOutQuad);
    return;
  }

  // Three or more nodes:
  // * Local node on left
  // * Other nodes evenly distributed in a circle
  myNode = this.localNode;
  var otherNodes = foregroundNodes.filter(function(node) {
    return node !== myNode;
  });

  myNode.tweenToPosition(-100, 0, 400, tweens.easeOutQuad);
  var radiansBetweenNodes = (2 * Math.PI) / (otherNodes.length + 1); // Include myNode!
  for (var i = 0; i < otherNodes.length; i++) {
    // sin(rad) = o/h
    var h = 100;
    // Extra Math.PI here puts 0deg on the left.
    var rad = Math.PI + (i + 1) * radiansBetweenNodes;
    var x = Math.cos(rad) * h;
    var y = Math.sin(rad) * h;
    otherNodes[i].tweenToPosition(x, y, 600, tweens.easeOutQuad);
  }
};

/**
 * @param {DnsMode} newDnsMode
 */
NetSimVisualization.prototype.setDnsMode = function(newDnsMode) {
  this.dnsMode_ = newDnsMode;

  // Show/hide the auto-DNS node according to the new state
  if (newDnsMode === DnsMode.AUTOMATIC) {
    this.makeAutoDnsNode();
  } else {
    this.destroyAutoDnsNode();
  }

  // Tell all nodes about the new DNS mode, so they can decide whether to
  // show or hide their address.
  this.elements_.forEach(function(vizElement) {
    if (vizElement instanceof NetSimVizSimulationNode) {
      vizElement.setDnsMode(newDnsMode);
    }
  });

  // Update layering and layout since we just added/removed a node.
  this.pullElementsToForeground();
  this.distributeForegroundNodes();
};

/**
 * If it doesn't already exist, create an auto-DNS node and corresponding
 * wire.
 */
NetSimVisualization.prototype.makeAutoDnsNode = function() {
  if (!this.autoDnsNode_) {
    this.autoDnsNode_ = new NetSimVizAutoDnsNode(SHOW_BACKGROUND);
    this.addVizElement_(this.autoDnsNode_);

    this.autoDnsWire_ = new NetSimVizWire(this.autoDnsNode_, null);
    this.addVizElement_(this.autoDnsWire_);
  }
};

/**
 * Manually update the auto-DNS node and wire to match the foreground router.
 */
NetSimVisualization.prototype.updateAutoDnsNode = function() {
  if (!this.autoDnsNode_) {
    return;
  }

  var foregroundRouterNode = _.find(this.elements_, function(element) {
    return (
      element instanceof NetSimVizSimulationNode &&
      element.isRouter &&
      element.isForeground
    );
  });

  // Update address to match foreground router
  if (foregroundRouterNode) {
    this.autoDnsNode_.setAddress(foregroundRouterNode.autoDnsAddress);
  }

  // Update wire endpoints
  this.autoDnsWire_.localVizNode = this.autoDnsNode_;
  this.autoDnsWire_.remoteVizNode = foregroundRouterNode;
};

/**
 * Remove the auto-DNS node and wire.
 */
NetSimVisualization.prototype.destroyAutoDnsNode = function() {
  if (this.autoDnsNode_) {
    this.autoDnsNode_.kill();
    this.autoDnsNode_ = null;
  }

  if (this.autoDnsWire_) {
    this.autoDnsWire_.kill();
    this.autoDnsWire_ = null;
  }
};

/**
 * @param {number} dnsNodeID
 */
NetSimVisualization.prototype.setDnsNodeID = function(dnsNodeID) {
  this.elements_.forEach(function(vizElement) {
    if (vizElement instanceof NetSimVizSimulationNode) {
      vizElement.setIsDnsNode(
        vizElement.getCorrespondingEntityId() === dnsNodeID
      );
    }
  });
};

/**
 * Update encoding-view setting across the visualization.
 *
 * @param {EncodingType[]} newEncodings
 */
NetSimVisualization.prototype.setEncodings = function(newEncodings) {
  this.encodings_ = newEncodings;
  this.elements_.forEach(function(vizElement) {
    if (vizElement instanceof NetSimVizSimulationWire) {
      vizElement.setEncodings(newEncodings);
    }
  });
};

/**
 * Kick off an animation that will show the state of the simplex wire being
 * set by the local node.
 * @param {"0"|"1"} newState
 */
NetSimVisualization.prototype.animateSetWireState = function(newState) {
  // Assumptions - we are talking about the wire between the local node
  // and its remote partner.
  // This only gets used in peer-to-peer mode, so there should be an incoming
  // wire too, which we should hide.
  // This is a no-op if no such wire exists.
  // We can stop any previous animation on the wire if this is called

  var vizWire = this.getVizWireToRemote();
  var incomingWire = this.getVizWireFromRemote();
  if (!(vizWire && incomingWire)) {
    return;
  }

  // Hide the incoming wire because we are in simplex mode.
  incomingWire.hide();
  // Animate the outgoing wire
  vizWire.animateSetState(newState);
};

/**
 * Kick off an animation that will show the state of the simplex wire being
 * read by the local node.
 * @param {"0"|"1"} newState
 */
NetSimVisualization.prototype.animateReadWireState = function(newState) {
  // Assumes we are in simplex P2P mode and talking about the wire between
  // the local node and its remote partner.  This is a no-op if no such wire
  // exists.  We can stop any previous animation on the wire if this is called.

  var vizWire = this.getVizWireToRemote();
  var incomingWire = this.getVizWireFromRemote();
  if (!(vizWire && incomingWire)) {
    return;
  }

  // Hide the incoming wire because we are in simplex mode.
  incomingWire.hide();
  // Animate the outgoing wire
  vizWire.animateReadState(newState);
};

/**
 * Find the outgoing wire from the local node to a remote node.
 * @returns {NetSimVizSimulationWire|null} null if no outgoing connection is established.
 */
NetSimVisualization.prototype.getVizWireToRemote = function() {
  if (!this.localNode) {
    return null;
  }

  var outgoingWires = this.elements_.filter(function(element) {
    return (
      element instanceof NetSimVizSimulationWire &&
      element.localVizNode === this.localNode
    );
  }, this);

  if (outgoingWires.length === 0) {
    return null;
  }

  return outgoingWires[0];
};

/**
 * Find the incoming wire from a remote node to the local node.
 * @returns {NetSimVizSimulationWire|null} null if no incoming connection is established.
 */
NetSimVisualization.prototype.getVizWireFromRemote = function() {
  if (!this.localNode) {
    return null;
  }

  var incomingWires = this.elements_.filter(function(element) {
    return (
      element instanceof NetSimVizSimulationWire &&
      element.remoteVizNode === this.localNode
    );
  }, this);

  if (incomingWires.length === 0) {
    return null;
  }

  return incomingWires[0];
};
