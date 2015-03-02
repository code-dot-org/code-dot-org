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

var NetSimLogger = require('./NetSimLogger');
var NetSimClientNode = require('./NetSimClientNode');
var NetSimRouterNode = require('./NetSimRouterNode');
var NetSimLocalClientNode = require('./NetSimLocalClientNode');
var ObservableEvent = require('../ObservableEvent');
var NetSimShard = require('./NetSimShard');
var NetSimShardCleaner = require('./NetSimShardCleaner');

var logger = NetSimLogger.getSingleton();

/**
 * A connection to a NetSim shard
 * @param {Window} thisWindow
 * @param {!NetSimLogWidget} sentLog - Widget to post sent messages to
 * @param {!NetSimLogWidget} receivedLog - Widget to post received messages to
 * @constructor
 */
var NetSimConnection = module.exports = function (thisWindow, sentLog, receivedLog) {
  /**
   * Display name for user on local end of connection, to be uploaded to others.
   * @type {string}
   * @private
   */
  this.displayName_ = '';

  /**
   * @type {NetSimLogWidget}
   * @private
   */
  this.sentLog_ = sentLog;

  /**
   * @type {NetSimLogWidget}
   * @private
   */
  this.receivedLog_ = receivedLog;

  /**
   * Accessor object for select simulation shard's tables, where an shard
   * is a group of tables shared by a group of users, allowing them to observe
   * a common network state.
   *
   * See en.wikipedia.org/wiki/Instance_dungeon for a popular example of this
   * concept.
   *
   * @type {NetSimShard}
   * @private
   */
  this.shard_ = null;

  /**
   *
   * @type {NetSimShardCleaner}
   * @private
   */
  this.shardCleaner_ = null;

  /**
   * The local client's node representation within the shard.
   * @type {NetSimClientNode}
   */
  this.myNode = null;

  /**
   * Event: Connected to, or disconnected from, a shard.
   * Specifically, added or removed our client node from the shard's node table.
   * @type {ObservableEvent}
   */
  this.shardChange = new ObservableEvent();

  /**
   * Allows others to subscribe to connection status changes.
   * args: none
   * Notifies on:
   * - Connect to shard
   * - Disconnect from shard
   * - Connect to router
   * - Got address from router
   * - Disconnect from router
   * @type {ObservableEvent}
   */
  this.statusChanges = new ObservableEvent();

  // Bind to onBeforeUnload event to attempt graceful disconnect
  thisWindow.addEventListener('beforeunload', this.onBeforeUnload_.bind(this));
};

/**
 * Attach own handlers to run loop events.
 * @param {RunLoop} runLoop
 */
NetSimConnection.prototype.attachToRunLoop = function (runLoop) {
  runLoop.tick.register(this.tick.bind(this));
};

/** @param {!RunLoop.Clock} clock */
NetSimConnection.prototype.tick = function (clock) {
  if (this.myNode) {
    this.myNode.tick(clock);
    this.shard_.tick(clock);
    this.shardCleaner_.tick(clock);
  }
};

/** @returns {NetSimLogger} */
NetSimConnection.prototype.getLogger = function () {
  return logger;
};

/**
 * Before-unload handler, used to try and disconnect gracefully when
 * navigating away instead of just letting our record time out.
 * @private
 */
NetSimConnection.prototype.onBeforeUnload_ = function () {
  if (this.isConnectedToShard()) {
    this.disconnectFromShard();
  }
};

/**
 * Establishes a new connection to a netsim shard, closing the old one
 * if present.
 * @param {!string} shardID
 * @param {!string} displayName
 */
NetSimConnection.prototype.connectToShard = function (shardID, displayName) {
  if (this.isConnectedToShard()) {
    logger.warn("Auto-closing previous connection...");
    this.disconnectFromShard();
  }

  this.shard_ = new NetSimShard(shardID);
  this.shardCleaner_ = new NetSimShardCleaner(this.shard_);
  this.createMyClientNode_(displayName);
};

/** Ends the connection to the netsim shard. */
NetSimConnection.prototype.disconnectFromShard = function () {
  if (!this.isConnectedToShard()) {
    logger.warn("Redundant disconnect call.");
    return;
  }

  if (this.isConnectedToRouter()) {
    this.disconnectFromRouter();
  }

  this.myNode.destroy(function () {
    this.myNode.stopSimulation();
    this.myNode = null;
    this.shardChange.notifyObservers(null, null);
    this.statusChanges.notifyObservers();
  }.bind(this));
};

/**
 * Given a lobby table has already been configured, connects to that table
 * by inserting a row for ourselves into that table and saving the row ID.
 * @param {!string} displayName
 * @private
 */
NetSimConnection.prototype.createMyClientNode_ = function (displayName) {
  NetSimLocalClientNode.create(this.shard_, function (err, node) {
    if (err !== null) {
      logger.error("Failed to create client node; " + err.message);
      return;
    }

    this.myNode = node;
    this.myNode.setDisplayName(displayName);
    this.myNode.setLostConnectionCallback(this.disconnectFromShard.bind(this));
    this.myNode.initializeSimulation(this.sentLog_, this.receivedLog_);
    this.myNode.update(function (/*err, result*/) {
      this.shardChange.notifyObservers(this.shard_, this.myNode);
      this.statusChanges.notifyObservers();
    }.bind(this));
  }.bind(this));
};

/**
 * Whether we are currently connected to a netsim shard
 * @returns {boolean}
 */
NetSimConnection.prototype.isConnectedToShard = function () {
  return (null !== this.myNode);
};

/**
 * Gets all rows in the lobby and passes them to callback.  Callback will
 * get an empty array if we were unable to get lobby data.
 * TODO: Remove this, get rows from the table and use the netsimUtils methods
 * instead.
 * @param callback
 */
NetSimConnection.prototype.getAllNodes = function (callback) {
  if (!this.isConnectedToShard()) {
    logger.warn("Can't get lobby rows, not connected to shard.");
    callback([]);
    return;
  }

  var self = this;
  this.shard_.nodeTable.readAll(function (err, rows) {
    if (err !== null) {
      logger.warn("Lobby data request failed, using empty list.");
      callback([]);
      return;
    }

    var nodes = rows.map(function (row) {
      if (row.type === NetSimClientNode.getNodeType()) {
        return new NetSimClientNode(self.shard_, row);
      } else if (row.type === NetSimRouterNode.getNodeType()) {
        return new NetSimRouterNode(self.shard_, row);
      }
    }).filter(function (node) {
      return node !== undefined;
    });

    callback(nodes);
  });
};

/** Adds a row to the lobby for a new router node. */
NetSimConnection.prototype.addRouterToLobby = function () {
  var self = this;
  NetSimRouterNode.create(this.shard_, function () {
    self.statusChanges.notifyObservers();
  });
};

/**
 * Whether our client node is connected to a router node.
 * @returns {boolean}
 */
NetSimConnection.prototype.isConnectedToRouter = function () {
  return this.myNode && this.myNode.myRouter;
};

/**
 * Establish a connection between the local client and the given
 * simulated router.
 * @param {number} routerID
 */
NetSimConnection.prototype.connectToRouter = function (routerID) {
  if (this.isConnectedToRouter()) {
    logger.warn("Auto-disconnecting from previous router.");
    this.disconnectFromRouter();
  }

  var self = this;
  NetSimRouterNode.get(routerID, this.shard_, function (err, router) {
    if (err !== null) {
      logger.warn('Failed to find router with ID ' + routerID + '; ' + err.message);
      return;
    }

    self.myNode.connectToRouter(router, function (err) {
      if (err) {
        logger.warn('Failed to connect to ' + router.getDisplayName() + '; ' +
            err.message);
      }
      self.statusChanges.notifyObservers();
    });
  });
};

/**
 * Disconnects our client node from the currently connected router node.
 * Destroys the shared wire.
 */
NetSimConnection.prototype.disconnectFromRouter = function () {
  if (!this.isConnectedToRouter()) {
    logger.warn("Cannot disconnect: Not connected.");
    return;
  }

  var self = this;
  this.myNode.disconnectRemote(function () {
    self.statusChanges.notifyObservers();
  });
};