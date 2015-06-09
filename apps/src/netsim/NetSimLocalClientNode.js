/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxparams: 3,
 maxstatements: 200
 */
'use strict';

var utils = require('../utils');
var _ = utils.getLodash();
var NetSimClientNode = require('./NetSimClientNode');
var NetSimEntity = require('./NetSimEntity');
var NetSimMessage = require('./NetSimMessage');
var NetSimHeartbeat = require('./NetSimHeartbeat');
var NetSimLogger = require('./NetSimLogger');
var NetSimRouterNode = require('./NetSimRouterNode');
var ObservableEvent = require('../ObservableEvent');

var logger = NetSimLogger.getSingleton();
var netsimConstants = require('./netsimConstants');
var netsimGlobals = require('./netsimGlobals');

var MessageGranularity = netsimConstants.MessageGranularity;

/**
 * Client model of node being simulated on the local client.
 *
 * Provides special access for manipulating the locally-owned client node in
 * ways that you aren't allowed to manipulate other client nodes.
 *
 * @param {!NetSimShard} shard
 * @param {Object} [clientRow] - Lobby row for this router.
 * @constructor
 * @augments NetSimClientNode
 */
var NetSimLocalClientNode = module.exports = function (shard, clientRow) {
  NetSimClientNode.call(this, shard, clientRow);

  // TODO (bbuchanan): Consider:
  //      Do we benefit from inheritance here?  Would it be cleaner to make this
  //      not-an-entity that manipulates a stock NetSimClientNode?  Will another
  //      developer find it easy to understand how this class works?

  /**
   * Client nodes can only have one wire at a time.
   * @type {NetSimWire}
   */
  this.myWire = null;

  /**
   * Client nodes can be connected to other clients.
   * @type {NetSimClientNode}
   */
  this.myRemoteClient = null;

  /**
   * ID of the router this client node is connected to.  Undefined if
   * not connected to a router.
   * @type {number|undefined}
   * @private
   */
  this.myRouterID_ = undefined;

  /**
   * Set of router controllers enabled for simulation by this node.
   * @type {NetSimRouterNode[]}
   * @private
   */
  this.routers_ = [];

  /**
   * Widget where we will post sent messages.
   * @type {NetSimLogPanel}
   * @private
   */
  this.sentLog_ = null;

  /**
   * Widget where we will post received messages
   * @type {NetSimLogPanel}
   * @private
   */
  this.receivedLog_ = null;

  /**
   * Tells the network that we're alive
   * @type {NetSimHeartbeat}
   * @private
   */
  this.heartbeat = null;

  /**
   * Change event others can observe, which we will fire when we
   * connect or disconnect from a router or remote client
   * @type {ObservableEvent}
   */
  this.remoteChange = new ObservableEvent();

  /**
   * Callback for when something indicates that this node has been
   * disconnected from the instance.
   * @type {function}
   * @private
   */
  this.onNodeLostConnection_ = undefined;

  /**
   * Event registration information
   * @type {Object}
   */
  this.eventKeys = {};
};
NetSimLocalClientNode.inherits(NetSimClientNode);

/**
 * Static async creation method. See NetSimEntity.create().
 * @param {!NetSimShard} shard
 * @param {string} displayName
 * @param {!NodeStyleCallback} onComplete - Method that will be given the
 *        created entity, or null if entity creation failed.
 */
NetSimLocalClientNode.create = function (shard, displayName, onComplete) {
  var templateNode = new NetSimLocalClientNode(shard);
  templateNode.displayName_ = displayName;
  templateNode.getTable().create(templateNode.buildRow(), function (err, row) {
    if (err) {
      onComplete(err, null);
      return;
    }

    NetSimHeartbeat.getOrCreate(shard, row.id, function (err, heartbeat) {
      if (err) {
        onComplete(err, null);
        return;
      }

      // Attach a heartbeat failure (heart attack?) callback to
      // detect and respond to a disconnect.
      var newNode = new NetSimLocalClientNode(shard, row);
      newNode.heartbeat = heartbeat;
      newNode.heartbeat.setFailureCallback(newNode.onFailedHeartbeat.bind(newNode));
      onComplete(null, newNode);
    });
  });
};

/** Set node's display name.  Does not trigger an update! */
NetSimLocalClientNode.prototype.setDisplayName = function (displayName) {
  this.displayName_ = displayName;
};

/**
 * Configure this node controller to actively simulate, and to post sent and
 * received messages to the given log widgets.
 * @param {!NetSimLogPanel} sentLog
 * @param {!NetSimLogPanel} receivedLog
 */
NetSimLocalClientNode.prototype.initializeSimulation = function (sentLog,
    receivedLog) {
  this.sentLog_ = sentLog;
  this.receivedLog_ = receivedLog;

  // Subscribe to table changes
  this.eventKeys.nodeTable = this.shard_.nodeTable.tableChange.register(
      this.onNodeTableChange_.bind(this));
  this.eventKeys.wireTable = this.shard_.wireTable.tableChange.register(
      this.onWireTableChange_.bind(this));
  this.eventKeys.messageTable = this.shard_.messageTable.tableChange.register(
      this.onMessageTableChange_.bind(this));
  this.eventKeys.registeredOnShard = this.shard_;

  // Set up initial state from cached rows
  this.onNodeTableChange_(this.shard_.nodeTable.readAllCached());
};

/**
 * Gives the simulating node a chance to unregister from anything it was
 * observing.
 */
NetSimLocalClientNode.prototype.stopSimulation = function () {
  if (this.eventKeys.registeredOnShard) {
    this.eventKeys.registeredOnShard.nodeTable.tableChange.unregister(
        this.eventKeys.nodeTable);
    this.eventKeys.registeredOnShard.wireTable.tableChange.unregister(
        this.eventKeys.wireTable);
    this.eventKeys.registeredOnShard.messageTable.tableChange.unregister(
        this.eventKeys.messageTable);
    this.eventKeys.registeredOnShard = null;
  }
};

/**
 * Our own client must send a regular heartbeat to broadcast its presence on
 * the shard.
 * @param {!RunLoop.Clock} clock
 */
NetSimLocalClientNode.prototype.tick = function (clock) {
  this.heartbeat.tick(clock);
  this.routers_.forEach(function (router) {
    router.tick(clock);
  });
};

/**
 * Handler for a heartbeat update failure.  Propagates the failure up through
 * our own "lost connection" callback.
 * @private
 */
NetSimLocalClientNode.prototype.onFailedHeartbeat = function () {
  logger.error("Heartbeat failed.");
  if (this.onNodeLostConnection_ !== undefined) {
    this.onNodeLostConnection_();
  }
};

/**
 * Give this node an action to take if it detects that it is no longer part
 * of the shard.
 * @param {function} onNodeLostConnection
 * @throws if set would clobber a previously-set callback.
 */
NetSimLocalClientNode.prototype.setLostConnectionCallback = function (
    onNodeLostConnection) {
  if (this.onNodeLostConnection_ !== undefined &&
      onNodeLostConnection !== undefined) {
    throw new Error('Node already has a lost connection callback.');
  }
  this.onNodeLostConnection_ = onNodeLostConnection;
};

/**
 * If a client update fails, should attempt an automatic reconnect.
 * @param {NodeStyleCallback} [onComplete]
 */
NetSimLocalClientNode.prototype.update = function (onComplete) {
  onComplete = onComplete || function () {};

  var self = this;
  NetSimLocalClientNode.superPrototype.update.call(this, function (err, result) {
    if (err) {
      logger.error("Local node update failed: " + err.message);
      if (self.onNodeLostConnection_ !== undefined) {
        self.onNodeLostConnection_();
      }
    }
    onComplete(err, result);
  });
};

/**
 * Connect to a remote node.
 * @param {NetSimNode} otherNode
 * @param {!NodeStyleCallback} onComplete
 * @override
 */
NetSimLocalClientNode.prototype.connectToNode = function (otherNode, onComplete) {
  NetSimLocalClientNode.superPrototype.connectToNode.call(this, otherNode,
      function (err, wire) {
        if (err) {
          onComplete(err, null);
        } else {
          this.myWire = wire;
          onComplete(err, wire);
        }
      }.bind(this));
};

/**
 * Connect to a remote client node.
 * @param {NetSimClientNode} client
 * @param {!NodeStyleCallback} onComplete
 */
NetSimLocalClientNode.prototype.connectToClient = function (client, onComplete) {
  this.connectToNode(client, function (err, wire) {
    // Check whether WE just established a mutual connection with a remote client.
    this.shard_.wireTable.readAll(function (err, wireRows) {
      if (err) {
        onComplete(err, wire);
        return;
      }
      this.onWireTableChange_(wireRows);
      onComplete(err, wire);
    }.bind(this));
  }.bind(this));
};

/**
 * @param {!NetSimRouterNode} router
 * @param {NodeStyleCallback} onComplete
 */
NetSimLocalClientNode.prototype.connectToRouter = function (router, onComplete) {
  onComplete = onComplete || function () {};


  logger.info(this.getDisplayName() + ": Connecting to " + router.getDisplayName());

  this.connectToNode(router, function (err, wire) {
    if (err) {
      onComplete(err);
      return;
    }

    this.myRouterID_ = router.entityID;
    var myRouter = this.getMyRouter();
    // Copy the heartbeat reference over to the router instance
    // in our simulating routers collection.
    myRouter.heartbeat = router.heartbeat;

    myRouter.requestAddress(wire, this.getHostname(), function (err) {
      if (err) {
        this.disconnectRemote(onComplete);
        return;
      }

      this.remoteChange.notifyObservers(this.myWire, myRouter);
      onComplete(null);
    }.bind(this));
  }.bind(this));
};

/**
 * Helper/accessor for router controller instance for the router that this
 * client is directly connected to.
 * @returns {NetSimRouterNode|null} Router we are connected to or null if not
 *          connected to a router at all.
 */
NetSimLocalClientNode.prototype.getMyRouter = function () {
  if (this.myRouterID_ === undefined) {
    return null;
  }

  return _.find(this.routers_, function (router) {
    return router.entityID === this.myRouterID_;
  }.bind(this));
};

/**
 * Synchronously destroy the local node.  Use on page unload, normally prefer
 * async steps.
 */
NetSimLocalClientNode.prototype.synchronousDestroy = function () {
  // If connected to remote, synchronously disconnect
  if (this.myRemoteClient || this.myRouterID_ !== undefined) {
    this.synchronousDisconnectRemote();
  }

  // Remove messages being simulated by me
  this.shard_.messageTable.readAllCached().forEach(function (row) {
    if (row.simulatedBy === this.entityID) {
      var message = new NetSimMessage(this.shard_, row);
      message.synchronousDestroy();
    }
  }, this);

  // Remove my heartbeat row(s)
  this.heartbeat.synchronousDestroy();
  this.heartbeat = null;

  // Finally, call super-method
  NetSimLocalClientNode.superPrototype.synchronousDestroy.call(this);
};

/**
 * Destroy the local node; performs appropriate clean-up leading up to
 * node destruction.
 * @param {!NodeStyleCallback} onComplete
 */
NetSimLocalClientNode.prototype.destroy = function (onComplete) {
  // If connected to remote, asynchronously disconnect then try destroy again.
  if (this.myRemoteClient || this.myRouterID_ !== undefined) {
    this.disconnectRemote(function (err) {
      if (err) {
        onComplete(err);
        return;
      }
      this.destroy(onComplete);
    }.bind(this));
    return;
  }

  // Remove messages being simulated by this node
  var myMessages = this.shard_.messageTable.readAllCached().filter(function (row) {
    return row.simulatedBy === this.entityID;
  }, this).map(function (row) {
    return new NetSimMessage(this.shard_, row);
  }, this);
  if (myMessages.length > 0) {
    NetSimEntity.destroyEntities(myMessages, function (err) {
      if (err) {
        onComplete(err);
        return;
      }
      this.destroy(onComplete);
    }.bind(this));
    return;
  }

  // Remove heartbeat row, then self
  this.heartbeat.destroy(function (err) {
    if (err) {
      onComplete(err);
      return;
    }

    NetSimLocalClientNode.superPrototype.destroy.call(this, onComplete);
  });
};

/**
 * Synchronously destroy my outgoing wire.  Used when navigating away from
 * the page - in normal circumstances use async version.
 */
NetSimLocalClientNode.prototype.synchronousDisconnectRemote = function () {
  if (this.myWire) {
    this.myWire.synchronousDestroy();
  }
  this.cleanUpAfterDestroyingWire_();
};

/**
 * @param {NodeStyleCallback} [onComplete]
 */
NetSimLocalClientNode.prototype.disconnectRemote = function (onComplete) {
  onComplete = onComplete || function () {};

  this.myWire.destroy(function (err) {
    // We're not going to stop if an error occurred here; the error might
    // just be that the wire was already cleaned up by another node.
    // As long as we make a good-faith disconnect effort, the cleanup system
    // will correct any mistakes and we won't lock up our client trying to
    // re-disconnect.
    if (err) {
      logger.info("Error while disconnecting: " + err.message);
    }

    this.cleanUpAfterDestroyingWire_();
    onComplete(null);
  }.bind(this));
};

/**
 * Common cleanup behavior shared between the synchronous and asynchronous
 * disconnect paths.
 * @private
 */
NetSimLocalClientNode.prototype.cleanUpAfterDestroyingWire_ = function () {
  var myRouter = this.getMyRouter();
  if (myRouter) {
    // We did manual heartbeat setup, we also need to do manual heartbeat
    // cleanup when we disconnect from the router.
    myRouter.heartbeat = null;
  }

  this.myWire = null;
  this.myRemoteClient = null;
  this.myRouterID_ = undefined;
  this.remoteChange.notifyObservers(null, null);
};

/**
 * Put a message on our outgoing wire, to whatever we are connected to
 * at the moment.
 * @param {string} payload
 * @param {!NodeStyleCallback} onComplete
 */
NetSimLocalClientNode.prototype.sendMessage = function (payload, onComplete) {
  if (!this.myWire) {
    onComplete(new Error('Cannot send message; not connected.'));
    return;
  }

  var localNodeID = this.myWire.localNodeID;
  var remoteNodeID = this.myWire.remoteNodeID;

  // Who will be responsible for picking up/cleaning up this message?
  var simulatingNodeID = this.selectSimulatingNode_(localNodeID, remoteNodeID);
  var levelConfig = netsimGlobals.getLevelConfig();
  var extraHops = levelConfig.minimumExtraHops;
  if (levelConfig.minimumExtraHops !== levelConfig.maximumExtraHops) {
    extraHops = netsimGlobals.randomIntInRange(
        levelConfig.minimumExtraHops,
        levelConfig.maximumExtraHops + 1);
  }

  var self = this;
  NetSimMessage.send(
      this.shard_,
      {
        fromNodeID: localNodeID,
        toNodeID: remoteNodeID,
        simulatedBy: simulatingNodeID,
        payload: payload,
        extraHopsRemaining: extraHops
      },
      function (err) {
        if (err) {
          logger.error('Failed to send message: ' + err.message + "\n" +
              JSON.stringify(payload));
          onComplete(err);
          return;
        }

        logger.info(this.getDisplayName() + ': Sent message:' +
            '\nfrom: ' + localNodeID +
            '\nto  : ' + remoteNodeID +
            '\nsim : ' + simulatingNodeID +
            '\nhops: ' + extraHops);

        if (self.sentLog_) {
          self.sentLog_.log(payload);
        }
        onComplete(null);
      }.bind(this)
  );
};

/**
 * Decide whether the local node or the remote node will be responsible
 * for picking up and cleaning up this message from remote storage.
 * @param {number} localNodeID
 * @param {number} remoteNodeID
 * @returns {number} one of the two IDs provided
 */
NetSimLocalClientNode.prototype.selectSimulatingNode_ = function (localNodeID,
    remoteNodeID) {
  if (netsimGlobals.getLevelConfig().messageGranularity === MessageGranularity.BITS) {
    // In simplex wire mode, the local node cleans up its own messages
    // when it knows they are no longer current.
    return localNodeID;
  } else if (this.myRouterID_ !== undefined && this.myRouterID_ === remoteNodeID) {
    // If sending to a router, we will do our own simulation on the router's
    // behalf
    return localNodeID;
  }
  // Default case: The designated recipient must pick up the message.
  return remoteNodeID;
};

/**
 * Sequentially puts a list of messages onto the outgoing wire, to whatever
 * we are connected to at the moment.
 * @param {string[]} payloads
 * @param {!NodeStyleCallback} onComplete
 */
NetSimLocalClientNode.prototype.sendMessages = function (payloads, onComplete) {
  if (payloads.length === 0) {
    onComplete(null);
    return;
  }

  this.sendMessage(payloads[0], function (err, result) {
    if (err) {
      onComplete(err, result);
      return;
    }

    this.sendMessages(payloads.slice(1), onComplete);
  }.bind(this));
};

/**
 * Whenever the node table changes, make needed changes to our collection of
 * routers configured to simulate for the local node.
 * @param {Array} nodeRows
 * @private
 */
NetSimLocalClientNode.prototype.onNodeTableChange_ = function (nodeRows) {
  // 1. Remove simulating routers that have vanished from remote storage.
  this.routers_ = this.routers_.filter(function (simulatingRouter) {
    var stillExists = nodeRows.some(function (row) {
      return row.id === simulatingRouter.entityID;
    });
    if (!stillExists) {
      simulatingRouter.stopSimulation();
      return false;
    }
    return true;
  });

  // 2. Create and simulate new routers
  nodeRows.filter(function (row) {
    return row.type === netsimConstants.NodeType.ROUTER;
  }).forEach(function (row) {
    var alreadySimulating = this.routers_.some(function (simulatingRouter) {
      return row.id === simulatingRouter.entityID;
    });

    if (!alreadySimulating) {
      var newRouter = new NetSimRouterNode(this.shard_, row);
      newRouter.initializeSimulation(this.entityID);
      this.routers_.push(newRouter);
    }
  }, this);
};

/**
 * Handler for any wire table change.  Used here to detect mutual connections
 * between client nodes that indicate we can move to a "connected" state.
 * @param {Array} wireRows
 * @private
 */
NetSimLocalClientNode.prototype.onWireTableChange_ = function (wireRows) {
  if (!this.myWire) {
    return;
  }

  // Look for mutual connection
  var mutualConnectionRow = _.find(wireRows, function (row) {
    return row.remoteNodeID === this.myWire.localNodeID &&
        row.localNodeID === this.myWire.remoteNodeID;
  }.bind(this));

  if (mutualConnectionRow && !this.myRemoteClient) {
    // New mutual connection! Get the node for our own use.
    NetSimClientNode.get(mutualConnectionRow.localNodeID, this.shard_,
        function (err, remoteClient) {
          this.myRemoteClient = remoteClient;
          this.remoteChange.notifyObservers(this.myWire, this.myRemoteClient);
        }.bind(this));
  } else if (!mutualConnectionRow && this.myRemoteClient) {
    // Remote client disconnected or we disconnected; either way we are
    // no longer connected.
    this.myRemoteClient = null;
    this.remoteChange.notifyObservers(this.myWire, this.myRemoteClient);
  }
};

/**
 * Listens for changes to the message table.  Detects and handles messages
 * sent to this node.
 * @param {Array} rows
 * @private
 */
NetSimLocalClientNode.prototype.onMessageTableChange_ = function (rows) {
  if (!netsimGlobals.getLevelConfig().automaticReceive) {
    // In this level, we will not automatically pick up messages directed
    // at us.  We must manually call a receive method instead.
    return;
  }

  if (this.isProcessingMessages_) {
    // We're already in this method, getting called recursively because
    // we are making changes to the table.  Ignore this call.
    return;
  }

  var messages = rows
      .map(function (row) {
        return new NetSimMessage(this.shard_, row);
      }.bind(this))
      .filter(function (message) {
        return message.toNodeID === this.entityID &&
            message.simulatedBy === this.entityID;
      }.bind(this));

  if (messages.length === 0) {
    // No messages for us, no work to do
    return;
  }

  // Setup (sync): Set processing flag
  logger.info("Local node received " + messages.length + " messages");
  this.isProcessingMessages_ = true;

  // Step 1 (async): Pull all our messages out of storage
  NetSimEntity.destroyEntities(messages, function (err) {
    if (err) {
      logger.error('Error pulling message off the wire: ' + err.message);
      this.isProcessingMessages_ = false;
      return;
    }

    // Step 2 (sync): Handle all messages
    messages.forEach(function (message) {
      this.handleMessage_(message);
    }, this);

    // Cleanup (sync): Clear processing flag
    logger.info("Local node finished processing " + messages.length + " messages");
    this.isProcessingMessages_ = false;
  }.bind(this));
};

/**
 * Post message to 'received' log.
 * @param {!NetSimMessage} message
 * @private
 */
NetSimLocalClientNode.prototype.handleMessage_ = function (message) {
  logger.info(this.getDisplayName() + ': Handling incoming message');
  // TODO: How much validation should we do here?
  if (this.receivedLog_) {
    this.receivedLog_.log(message.payload);
  }
};

/**
 * Asynchronously receive the latest message shared between this node
 * and its connected remote node.
 * @param {!NodeStyleCallback} onComplete - given the message as a result, or
 *        NULL if no messages exist.
 */
NetSimLocalClientNode.prototype.getLatestMessageOnSimplexWire = function (onComplete) {
  if (!this.myWire) {
    onComplete(new Error("Unable to retrieve message; not connected."));
    return;
  }

  // Does an asynchronous request to the message table to ensure we have
  // the latest contents
  this.shard_.messageTable.readAll(function (err, messageRows) {
    if (err) {
      onComplete(err);
      return;
    }

    // We only care about rows on our (simplex) wire
    var rowsOnWire = messageRows.filter(function (row) {
      return this.myWire.isMessageRowOnSimplexWire(row);
    }.bind(this));

    // If there are no rows, complete successfully but pass null result.
    if (rowsOnWire.length === 0) {
      onComplete(null, null);
      return;
    }

    var lastRow = rowsOnWire[rowsOnWire.length - 1];
    onComplete(null, new NetSimMessage(this.shard_, lastRow));
  }.bind(this));
};

/**
 * Asynchronously set the state of the shared wire.
 * @param {string} newState - probably ought to be "0" or "1"
 * @param {!NodeStyleCallback} onComplete
 */
NetSimLocalClientNode.prototype.setSimplexWireState = function (newState, onComplete) {
  this.sendMessage(newState, function (err) {
    if (err) {
      logger.warn(err.message);
      onComplete(new Error("Failed to set wire state."));
      return;
    }

    // We're not done!  Also do our part to keep the message table clean.
    this.removeMyOldMessagesFromWire_(onComplete);
  }.bind(this));

};

/**
 * Removes all messages on the current wire that are simulated by the local
 * node and are not the latest message on the wire.
 * Used by simplex configurations where we only care about the wire's current
 * (latest) state.
 * @param {!NodeStyleCallback} onComplete
 */
NetSimLocalClientNode.prototype.removeMyOldMessagesFromWire_ = function (onComplete) {
  if (!this.myWire) {
    onComplete(new Error("Unable to retrieve message; not connected."));
    return;
  }

  // Does an asynchronous request to the message table to ensure we have
  // the latest contents
  this.shard_.messageTable.readAll(function (err, messageRows) {
    if (err) {
      onComplete(err);
      return;
    }

    // We only care about rows on our (simplex) wire
    var rowsOnWire = messageRows.filter(function (row) {
      return this.myWire.isMessageRowOnSimplexWire(row);
    }, this);

    // "Old" rows are all but the last element (the latest one)
    var oldRowsOnWire = rowsOnWire.slice(0, -1);

    // We are only in charge of deleting messages that we are simulating
    var myOldRowsOnWire = oldRowsOnWire.filter(function (row) {
      return row.simulatedBy === this.entityID;
    }, this);

    // Convert to message entities so we can destroy them
    var myOldMessagesOnWire = myOldRowsOnWire.map(function (row) {
      return new NetSimMessage(this.shard_, row);
    }, this);

    NetSimEntity.destroyEntities(myOldMessagesOnWire, onComplete);
  }.bind(this));
};
