/**
 * Copyright 2015 Code.org
 * http://code.org/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Handles client connection status with netsim data services
 */

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
var NetSimNodeClient = require('./NetSimNodeClient');
var NetSimNodeRouter = require('./NetSimNodeRouter');
var NetSimWire = require('./NetSimWire');
var ObservableEvent = require('./ObservableEvent');
var periodicAction = require('./periodicAction');
var NetSimShard = require('./NetSimShard');

var logger = new NetSimLogger(NetSimLogger.LogLevel.VERBOSE);

/**
 * How often the client should run its clean-up job, removing expired rows
 * from the shard tables
 * @type {number}
 * @const
 */
var CLEAN_UP_INTERVAL_MS = 10000;

/**
 * A connection to a NetSim shard
 * @param {!NetSimLogWidget} sentLog - Widget to post sent messages to
 * @param {!NetSimLogWidget} receivedLog - Widget to post received messages to
 * @constructor
 */
var NetSimConnection = function (sentLog, receivedLog) {
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
   * The local client's node representation within the shard.
   * @type {NetSimNodeClient}
   */
  this.myNode = null;

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

  /**
   * Helper for performing shard clean-up on a regular interval
   * @type {periodicAction}
   * @private
   */
  this.periodicCleanUp_ = periodicAction(this.cleanLobby_.bind(this),
      CLEAN_UP_INTERVAL_MS);

  // Bind to onBeforeUnload event to attempt graceful disconnect
  window.addEventListener('beforeunload', this.onBeforeUnload_.bind(this));
};
module.exports = NetSimConnection;

/**
 * Attach own handlers to run loop events.
 * @param {RunLoop} runLoop
 */
NetSimConnection.prototype.attachToRunLoop = function (runLoop) {
  this.periodicCleanUp_.attachToRunLoop(runLoop);
  this.periodicCleanUp_.enable();

  runLoop.tick.register(this, this.tick);
};

/** @param {!RunLoop.Clock} clock */
NetSimConnection.prototype.tick = function (clock) {
  if (this.shard_) {
    this.shard_.tick(clock);
  }

  if (this.myNode) {
    this.myNode.tick(clock);
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

  var self = this;
  this.myNode.destroy(function () {
    self.myNode = null;
    self.statusChanges.notifyObservers();
  });
};

/**
 * Given a lobby table has already been configured, connects to that table
 * by inserting a row for ourselves into that table and saving the row ID.
 * @param {!string} displayName
 * @private
 */
NetSimConnection.prototype.createMyClientNode_ = function (displayName) {
  var self = this;
  NetSimNodeClient.create(this.shard_, function (node) {
    if (node) {
      self.myNode = node;
      self.myNode.onChange.register(self, self.onMyNodeChange_);
      self.myNode.setDisplayName(displayName);
      self.myNode.setLogs(self.sentLog_, self.receivedLog_);
      self.myNode.update(function () {
        self.statusChanges.notifyObservers();
      });
    } else {
      logger.error("Failed to create client node.");
    }
  });
};

/**
 * Detects when local client node is unable to reconnect, and kicks user
 * out of the shard.
 * @private
 */
NetSimConnection.prototype.onMyNodeChange_= function () {
  if (this.myNode.getStatus() === 'Offline') {
    this.disconnectFromShard();
  }
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
 * @param callback
 */
NetSimConnection.prototype.getAllNodes = function (callback) {
  if (!this.isConnectedToShard()) {
    logger.warn("Can't get lobby rows, not connected to shard.");
    callback([]);
    return;
  }

  var self = this;
  this.shard_.nodeTable.readAll(function (rows) {
    if (!rows) {
      logger.warn("Lobby data request failed, using empty list.");
      callback([]);
      return;
    }

    var nodes = rows.map(function (row) {
      if (row.type === NetSimNodeClient.getNodeType()) {
        return new NetSimNodeClient(self.shard_, row);
      } else if (row.type === NetSimNodeRouter.getNodeType()) {
        return new NetSimNodeRouter(self.shard_, row);
      }
    }).filter(function (node) {
      return node !== undefined;
    });

    callback(nodes);
  });
};

/**
 * Triggers a sweep of the lobby table that removes timed-out client rows.
 * @private
 */
NetSimConnection.prototype.cleanLobby_ = function () {
  if (!this.shard_) {
    return;
  }

  var self = this;

  // Cleaning the lobby of old users and routers
  this.getAllNodes(function (nodes) {
    nodes.forEach(function (node) {
     if (node.isExpired()) {
       node.destroy();
     }
    });
  });

  // Cleaning wires
  // TODO (bbuchanan): Extract method to get all wires.
  this.shard_.wireTable.readAll(function (rows) {
    if (rows) {
      rows.map(function (row) {
        return new NetSimWire(self.shard_, row);
      }).forEach(function (wire) {
        if (wire.isExpired()) {
          wire.destroy();
        }
      });
    }
  });
};

/** Adds a row to the lobby for a new router node. */
NetSimConnection.prototype.addRouterToLobby = function () {
  var self = this;
  NetSimNodeRouter.create(this.shard_, function () {
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
  NetSimNodeRouter.get(routerID, this.shard_, function (router) {
    if (!router) {
      logger.warn('Failed to find router with ID ' + routerID);
      return;
    }

    self.myNode.connectToRouter(router, function (success) {
      if (!success) {
        logger.warn('Failed to connect to ' + router.getDisplayName());
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