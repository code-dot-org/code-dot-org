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

require('../utils');
var NetSimClientNode = require('./NetSimClientNode');
var NetSimEntity = require('./NetSimEntity');
var NetSimMessage = require('./NetSimMessage');
var NetSimHeartbeat = require('./NetSimHeartbeat');
var NetSimLogger = require('./NetSimLogger');
var ObservableEvent = require('../ObservableEvent');

var logger = NetSimLogger.getSingleton();

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
   * Client nodes can be connected to a router, which they will
   * help to simulate.
   * @type {NetSimRouterNode}
   */
  this.myRouter = null;

  /**
   * Widget where we will post sent messages.
   * @type {NetSimLogWidget}
   * @private
   */
  this.sentLog_ = null;

  /**
   * Widget where we will post received messages
   * @type {NetSimLogWidget}
   * @private
   */
  this.receivedLog_ = null;

  /**
   * Tells the network that we're alive
   * @type {NetSimHeartbeat}
   * @private
   */
  this.heartbeat_ = null;

  /**
   * Change event others can observe, which we will fire when we
   * connect to a router or disconnect from a router.
   * @type {ObservableEvent}
   */
  this.routerChange = new ObservableEvent();

  /**
   * Callback for when something indicates that this node has been
   * disconnected from the instance.
   * @type {function}
   * @private
   */
  this.onNodeLostConnection_ = undefined;
};
NetSimLocalClientNode.inherits(NetSimClientNode);

/**
 * Static async creation method. See NetSimEntity.create().
 * @param {!NetSimShard} shard
 * @param {!function} onComplete - Method that will be given the
 *        created entity, or null if entity creation failed.
 */
NetSimLocalClientNode.create = function (shard, onComplete) {
  NetSimEntity.create(NetSimLocalClientNode, shard, function (err, node) {
    if (err !== null) {
      onComplete(null);
      return;
    }

    // Give our newly-created local node a heartbeat
    NetSimHeartbeat.getOrCreate(shard, node.entityID, function (heartbeat) {
      if (heartbeat === null) {
        onComplete(null);
        return;
      }

      // Attach a heartbeat failure (heart attack?) callback to
      // detect and respond to a disconnect.
      node.heartbeat_ = heartbeat;
      node.heartbeat_.setFailureCallback(node.onFailedHeartbeat_.bind(node));

      onComplete(node);
    });
  });
};

/** @inheritdoc */
NetSimLocalClientNode.prototype.getStatus = function () {
  return this.status_ ? this.status_ : 'Online';
};

/** Set node's display name.  Does not trigger an update! */
NetSimLocalClientNode.prototype.setDisplayName = function (displayName) {
  this.displayName_ = displayName;
};

/**
 * Configure this node controller to actively simulate, and to post sent and
 * received messages to the given log widgets.
 * @param {!NetSimLogWidget} sentLog
 * @param {!NetSimLogWidget} receivedLog
 */
NetSimLocalClientNode.prototype.initializeSimulation = function (sentLog,
    receivedLog) {
  this.sentLog_ = sentLog;
  this.receivedLog_ = receivedLog;

  // Subscribe to message table changes
  var newMessageEvent = this.shard_.messageTable.tableChange;
  var newMessageHandler = this.onMessageTableChange_.bind(this);
  this.newMessageEventKey_ = newMessageEvent.register(newMessageHandler);
  logger.info("Local node registered for messageTable tableChange");
};

/**
 * Gives the simulating node a chance to unregister from anything it was
 * observing.
 */
NetSimLocalClientNode.prototype.stopSimulation = function () {
  if (this.newMessageEventKey_ !== undefined) {
    var newMessageEvent = this.shard_.messageTable.tableChange;
    newMessageEvent.unregister(this.newMessageEventKey_);
    this.newMessageEventKey_ = undefined;
    logger.info("Local node registered for messageTable tableChange");
  }
};

/**
 * Our own client must send a regular heartbeat to broadcast its presence on
 * the shard.
 * @param {!RunLoop.Clock} clock
 */
NetSimLocalClientNode.prototype.tick = function (clock) {
  this.heartbeat_.tick(clock);
  if (this.myRouter) {
    this.myRouter.tick(clock);
  }
};

/**
 * Handler for a heartbeat update failure.  Propagates the failure up through
 * our own "lost connection" callback.
 * @private
 */
NetSimLocalClientNode.prototype.onFailedHeartbeat_ = function () {
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
    if (err !== null) {
      logger.error("Update failed.");
      if (self.onNodeLostConnection_ !== undefined) {
        self.onNodeLostConnection_();
      }
    }
    onComplete(err, result);
  });
};

/**
 * @param {!NetSimRouterNode} router
 * @param {function} onComplete (success)
 */
NetSimLocalClientNode.prototype.connectToRouter = function (router, onComplete) {
  onComplete = onComplete || function () {};

  var self = this;
  this.connectToNode(router, function (wire) {
    if (!wire) {
      onComplete(false);
      return;
    }

    self.myWire = wire;
    self.myRouter = router;
    self.myRouter.initializeSimulation(self.entityID);

    router.requestAddress(wire, self.getHostname(), function (success) {
      if (!success) {
        wire.destroy(function () {
          onComplete(false);
        });
        return;
      }

      self.myWire = wire;
      self.myRouter = router;
      self.routerChange.notifyObservers(self.myWire, self.myRouter);

      self.status_ = "Connected to " + router.getDisplayName() +
      " with address " + wire.localAddress;
      self.update(function (err, result) {
        onComplete(result);
      });
    });
  });
};

NetSimLocalClientNode.prototype.disconnectRemote = function (onComplete) {
  if (!onComplete) {
    onComplete = function () {};
  }

  var self = this;
  this.myWire.destroy(function (success) {
    if (!success) {
      onComplete(success);
      return;
    }

    self.myWire = null;
    // Trigger an immediate router update so its connection count is correct.
    self.myRouter.update(function (err, result) {
      onComplete(result);
    });
    self.myRouter.stopSimulation();
    self.myRouter = null;
    self.routerChange.notifyObservers(null, null);
  });
};

/**
 * Put a message on our outgoing wire, to whatever we are connected to
 * at the moment.
 * @param {string} payload
 * @param {function} onComplete
 */
NetSimLocalClientNode.prototype.sendMessage = function (payload, onComplete) {
  if (!this.myWire) {
    onComplete();
    return;
  }

  var localNodeID = this.myWire.localNodeID;
  var remoteNodeID = this.myWire.remoteNodeID;
  var self = this;
  NetSimMessage.send(this.shard_, localNodeID, remoteNodeID, payload,
      function (success) {
        if (success) {
          logger.info('Local node sent message: ' + JSON.stringify(payload));
          if (self.sentLog_) {
            self.sentLog_.log(payload);
          }
        } else {
          logger.error('Failed to send message: ' + JSON.stringify(payload));
        }
        onComplete();
      }
  );
};

/**
 * Listens for changes to the message table.  Detects and handles messages
 * sent to this node.
 * @param {Array} rows
 * @private
 */
NetSimLocalClientNode.prototype.onMessageTableChange_ = function (rows) {
  if (this.isProcessingMessages_) {
    // We're already in this method, getting called recursively because
    // we are making changes to the table.  Ignore this call.
    return;
  }

  var self = this;
  var messages = rows.map(function (row) {
    return new NetSimMessage(self.shard_, row);
  }).filter(function (message) {
    return message.toNodeID === self.entityID;
  });

  // If any messages are for us, get our routing table and process messages.
  if (messages.length > 0) {
    this.isProcessingMessages_ = true;
    messages.forEach(function (message) {

      // Pull the message off the wire, and hold it in-memory until we route it.
      // We'll create a new one with the same payload if we have to send it on.
      message.destroy(function (success) {
        if (success) {
          self.handleMessage_(message);
        } else {
          logger.error("Error pulling message off the wire.");
        }
      });

    });
    this.isProcessingMessages_ = false;
  }
};

/**
 * Post message to 'received' log.
 * @param {!NetSimMessage} message
 * @private
 */
NetSimLocalClientNode.prototype.handleMessage_ = function (message) {
  // TODO: How much validation should we do here?
  if (this.receivedLog_) {
    this.receivedLog_.log(message.payload);
  }
};