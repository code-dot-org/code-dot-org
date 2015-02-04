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

var netsimStorage = require('./netsimStorage');
var NetSimLogger = require('./NetSimLogger');
var NetSimRouter = require('./NetSimRouter');
var NetSimWire = require('./NetSimWire');
var LogLevel = NetSimLogger.LogLevel;
var ObservableEvent = require('./ObservableEvent');
var periodicAction = require('./periodicAction');

/**
 * How often a keep-alive message should be sent to the instance lobby
 * @type {number}
 * @const
 */
var KEEP_ALIVE_INTERVAL_MS = 2000;

/**
 * How often the client should run its clean-up job, removing expired rows
 * from the instance tables
 * @type {number}
 * @const
 */
var CLEAN_UP_INTERVAL_MS = 10000;

/**
 * Milliseconds before a client is considered 'disconnected' and
 * can be cleaned up by another client.
 * Used for the cleanup job.
 * @type {number}
 * @const
 */
var CONNECTION_TIMEOUT_MS = 30000; // 30 seconds

/**
 * Milliseconds before a router is considered 'disconnected' and
 * can be cleaned up by a client.
 * Routers get their keepAlive messages from connected clients, so in this
 * case, any router that has no connected clients for 5 minutes can be
 * cleaned up.
 * Used for the cleanup job.
 * @type {number}
 * @const
 */
var CONNECTION_TIMEOUT_ROUTER_MS = 300000; // 5 minutes

/**
 * Milliseconds before a wire is considered 'disconnected' and
 * can be cleaned up by a client.
 * Wires get their keepAlive messages from connected clients, so in this
 * case, any wire that has no connected client for 5 minutes can be
 * cleaned up.
 * Used for the cleanup job.
 * @type {number}
 * @const
 */
var CONNECTION_TIMEOUT_WIRE_MS = 300000; // 5 minutes

/**
 * A connection to a NetSim instance
 * @param {string} displayName - Name for person on local end
 * @param {NetSimLogger} logger - A log control interface, default nullimpl
 * @constructor
 */
var NetSimConnection = function (displayName, logger /*=new NetSimLogger(NONE)*/) {
  /**
   * Display name for user on local end of connection, to be uploaded to others.
   * @type {string}
   * @private
   */
  this.displayName_ = displayName;

  /**
   * Instance of logging API, gives us choke-point control over log output
   * @type {NetSimLogger}
   * @private
   */
  this.logger_ = logger;
  if (undefined === this.logger_) {
    this.logger_ = new NetSimLogger(console, LogLevel.NONE);
  }

  /**
   * Selected instance ID.  Used to dynamically determine table names.
   * Tables are always scoped to the instance.
   * @type {string}
   * @private
   */
  this.instanceID_ = undefined;

  /**
   * This connection's unique Row ID within the lobby table.
   * Alternatively, think of this as a client node ID.
   * TODO (bbuchanan): Consider a rename for this?
   * If undefined, we aren't connected to an instance.
   * @type {number}
   * @private
   */
  this.myLobbyRowID_ = undefined;

  /**
   * Client's connection status, mostly used for upload to the lobby
   * so other clients can display it.
   * @type {NetSimConnection.ConnectionStatus}
   * @private
   */
  this.status_ = NetSimConnection.ConnectionStatus.OFFLINE;

  /**
   * Allows others to subscribe to connection status changes.
   * args: none
   * Notifies on:
   * - Connect to instance
   * - Disconnect from instance
   * - Connect to router
   * - Got address from router
   * - Disconnect from router
   * @type {ObservableEvent}
   */
  this.statusChanges = new ObservableEvent();

  /**
   * Helper for sending keepAlive updates on a regular interval
   * @type {periodicAction}
   * @private
   */
  this.periodicKeepAlive_ = periodicAction(function () {
    this.keepAlive();

    // TODO (bbuchanan): Call wire and router tick methods instead
    // of owning their updates.
    // simplify so we can just bind keepAlive to this action.

    // We also perform updates for our connected wires and routers
    if (this.wire_) {
      this.wire_.update();
    }

    if (this.router_) {
      this.router_.update();
    }
  }.bind(this), KEEP_ALIVE_INTERVAL_MS);

  /**
   * Helper for performing instance clean-up on a regular interval
   * @type {periodicAction}
   * @private
   */
  this.periodicCleanUp_ = periodicAction(this.cleanLobby_.bind(this),
      CLEAN_UP_INTERVAL_MS);

  /**
   * This client node's simulated connection to another node.
   * If you *are* connected to another node, you should have one of these.
   * If you *are not* connected to another node, this should be null.
   * We are always the local end of this wire, so we assert that
   *   this.wire_.localID === this.myLobbyRowID_
   * @type {NetSimWire}
   * @private
   */
  this.wire_ = null;

  /**
   * If this client node is connected to a router, this will be a NetSimRouter
   * instance for that connected router.  Communication that we want to model
   * still needs to happen over the wire - we use this object so that our
   * client can help simulate the router's behavior.
   * @type {NetSimRouter}
   * @private
   */
  this.router_ = null;

  // Bind to onBeforeUnload event to attempt graceful disconnect
  window.addEventListener('beforeunload', this.onBeforeUnload_.bind(this));
};
module.exports = NetSimConnection;

/**
 * Client node connection status enum
 * - OFFLINE means you have no instance connection (not in lobby)
 * - IN_LOBBY means you have an instance connection but no simulated connection
 * - CONNECTED means you have a simulated connection to another node
 * @readonly
 * @enum
 */
var ConnectionStatus = {
  OFFLINE: 'Offline',
  IN_LOBBY: 'In Lobby',
  CONNECTED: 'Connected'
};
NetSimConnection.ConnectionStatus = ConnectionStatus;

/**
 * All the types of nodes that can show up in the lobby
 * TODO (bbuchanan): Rename to NodeType?
 * @readonly
 * @enum {string}
 */
var LobbyRowType = {
  USER: 'user',
  ROUTER: 'router'
};
NetSimConnection.LobbyRowType = LobbyRowType;

/**
 * @returns {NetSimLogger}
 */
NetSimConnection.prototype.getLogger = function () {
  return this.logger_;
};

/**
 * Before-unload handler, used to try and disconnect gracefully when
 * navigating away instead of just letting our record time out.
 * @private
 */
NetSimConnection.prototype.onBeforeUnload_ = function () {
  if (this.isConnectedToInstance()) {
    this.disconnectFromInstance();
  }
};

/**
 * Helper that builds a lobby-table row in a consistent
 * format, based on the current connection state.
 * @private
 */
NetSimConnection.prototype.buildLobbyRow_ = function () {
  return {
    lastPing: Date.now(),
    name: this.displayName_,
    type: LobbyRowType.USER,
    status: this.status_,
    statusDetail: this.getStatusDetail()
  };
};

/**
 * Establishes a new connection to a netsim instance, closing the old one
 * if present.
 * @param {string} instanceID
 */
NetSimConnection.prototype.connectToInstance = function (instanceID) {
  if (this.isConnectedToInstance()) {
    this.logger_.log("Auto-closing previous connection...", LogLevel.WARN);
    this.disconnectFromInstance();
  }

  this.instanceID_ = instanceID;
  this.status_ = ConnectionStatus.IN_LOBBY;
  this.connect_();
};

/**
 * Get the current lobby table object, for manipulating the lobby.
 * @returns {SharedStorageTable}
 */
NetSimConnection.prototype.getLobbyTable = function () {
  return new netsimStorage.SharedStorageTable(netsimStorage.APP_PUBLIC_KEY,
      this.instanceID_ + '_lobby');
};

/**
 * Ends the connection to the netsim instance.
 */
NetSimConnection.prototype.disconnectFromInstance = function () {
  if (!this.isConnectedToInstance()) {
    this.logger_.log("Redundant disconnect call.", LogLevel.WARN);
    return;
  }

  if (this.isConnectedToRouter()) {
    this.disconnectFromRouter();
  }

  // TODO (bbuchanan) : Check for other resources we need to clean up.

  this.disconnectByRowID_(this.myLobbyRowID_);
  this.setConnectionStatus_(ConnectionStatus.OFFLINE);
};

/**
 * Given a lobby table has already been configured, connects to that table
 * by inserting a row for ourselves into that table and saving the row ID.
 * @private
 */
NetSimConnection.prototype.connect_ = function () {
  var self = this;
  this.getLobbyTable().insert(this.buildLobbyRow_(), function (returnedData) {
    if (returnedData) {
      self.myLobbyRowID_ = returnedData.id;
      self.setConnectionStatus_(ConnectionStatus.IN_LOBBY);

      // See if we have an active wire, and try to continue reconnecting
      // if possible.
      if (self.wire_) {
        self.wire_.localID = self.myLobbyRowID_;
        self.wire_.update(function () {
          self.setConnectionStatus_(ConnectionStatus.CONNECTED);
        });
      }

    } else {
      // TODO (bbuchanan) : Connect retry?
      self.logger_.log("Failed to connect to instance", LogLevel.ERROR);
    }
  });
};

/**
 * Helper method that can remove/disconnect any row from the lobby.
 * @param lobbyRowID
 * @private
 */
NetSimConnection.prototype.disconnectByRowID_ = function (lobbyRowID) {
  if (!this.isConnectedToInstance()) {
    this.logger_.log("Can't disconnect when not connected to an instance.",
        LogLevel.ERROR);
    return;
  }

  var self = this;
  this.getLobbyTable().delete(lobbyRowID, function (succeeded) {
    if (succeeded) {
      self.logger_.log("Disconnected client " + lobbyRowID + " from instance.",
          LogLevel.INFO);
    } else {
      // TODO (bbuchanan) : Disconnect retry?
      self.logger_.log("Failed to disconnect client " + lobbyRowID + ".",
          LogLevel.WARN);
    }
  });
};

/**
 * Whether we are currently connected to a netsim instance
 * @returns {boolean}
 */
NetSimConnection.prototype.isConnectedToInstance = function () {
  return (undefined !== this.myLobbyRowID_);
};

/**
 *
 * @param {NetSimConnection.ConnectionStatus} newStatus
 * @private
 */
NetSimConnection.prototype.setConnectionStatus_ = function (newStatus) {
  this.status_ = newStatus;
  switch (newStatus) {
    case ConnectionStatus.CONNECTED:
      this.periodicKeepAlive_.enable();
      this.periodicCleanUp_.enable();
      this.logger_.info("Connected to node.");
      break;

    case ConnectionStatus.IN_LOBBY:
      this.periodicKeepAlive_.enable();
      this.periodicCleanUp_.enable();
      this.logger_.info("Connected to instance, assigned ID " +
          this.myLobbyRowID_, LogLevel.INFO);
      break;

    case ConnectionStatus.OFFLINE:
      this.myLobbyRowID_ = undefined;
      this.periodicKeepAlive_.disable();
      this.periodicCleanUp_.disable();
      this.logger_.info("Disconnected from instance", LogLevel.INFO);
      break;
  }
  this.statusChanges.notifyObservers();
};

NetSimConnection.prototype.getStatusDetail = function () {
  if (this.status_ === ConnectionStatus.CONNECTED) {
    return ' (Address ' + this.wire_.localAddress + ') ' +
        ' to router ' + this.router_.routerID +
        ' (Address ' + this.wire_.remoteAddress + ')' +
        ' on wire ' + this.wire_.wireID;
  }
  return '';
};

/**
 * @param {function} [callback]
 */
NetSimConnection.prototype.keepAlive = function (callback) {
  if (callback === undefined) {
    callback = function () {};
  }

  if (!this.isConnectedToInstance()) {
    this.logger_.warn("Can't send keepAlive, not connected to instance.");
    return;
  }

  var self = this;
  this.getLobbyTable().update(this.myLobbyRowID_, this.buildLobbyRow_(),
      function (succeeded) {
        callback(succeeded);
        if (!succeeded) {
          self.setConnectionStatus_(ConnectionStatus.OFFLINE);
          self.logger_.log("Reconnecting...", LogLevel.INFO);
          self.connect_();
        }
  });
};

NetSimConnection.prototype.fetchLobbyListing = function (callback) {
  if (!this.isConnectedToInstance()) {
    this.logger_.log("Can't get lobby rows, not connected to instance.", LogLevel.WARN);
    callback([]);
    return;
  }

  var logger = this.logger_;
  this.getLobbyTable().all(function (data) {
    if (null !== data) {
      callback(data);
    } else {
      logger.log("Lobby data request failed, using empty list.", LogLevel.WARN);
      callback([]);
    }
  });
};

/**
 *
 * @param {RunLoop.Clock} clock
 */
NetSimConnection.prototype.tick = function (clock) {
  this.periodicKeepAlive_.tick(clock);
  this.periodicCleanUp_.tick(clock);
};

/**
 * Triggers a sweep of the lobby table that removes timed-out client rows.
 * @private
 */
NetSimConnection.prototype.cleanLobby_ = function () {
  var self = this;
  var now = Date.now();

  // Cleaning the lobby of old users and routers
  // For now, just clean on timeout
  // Could eventually do some validation too.
  this.fetchLobbyListing(function (lobbyData) {
    lobbyData.forEach(function (lobbyRow) {
      if (lobbyRow.type === LobbyRowType.USER &&
          now - lobbyRow.lastPing >= CONNECTION_TIMEOUT_MS) {
        self.disconnectByRowID_(lobbyRow.id);
      } else if (lobbyRow.type === LobbyRowType.ROUTER &&
          now - lobbyRow.lastPing >= CONNECTION_TIMEOUT_ROUTER_MS) {
        self.disconnectByRowID_(lobbyRow.id);
      }
    });
  });

  // Cleaning wires
  // For now, just clean on timeout.
  // Eventually, would be better to validate whether wire endpoints exist
  // Although, that will conflict with the mutual-connect stuff later.
  if (this.wire_) {
    var wireTable = this.wire_.getTable();
    wireTable.all(function (rows) {
      if (rows !== null) {
        rows.forEach(function (row) {
          if ((row.lastPing === undefined) ||
              (now - row.lastPing >= CONNECTION_TIMEOUT_WIRE_MS)) {
            wireTable.delete(row.id, function () {
              self.logger_.info("Cleaned up wire " + row.id);
            });
          }
        });
      }
    });
  }
};

NetSimConnection.prototype.addRouterToLobby = function () {
  if (!this.isConnectedToInstance()) {
    this.logger_.error("Can't create a router without a connection");
    return;
  }

  var self = this;
  NetSimRouter.create(this.instanceID_, function () {
    self.statusChanges.notifyObservers();
  });
};

NetSimConnection.prototype.isConnectedToRouter = function () {
  return this.wire_ !== null && this.router_ !== null;
};

/**
 * Establish a connection between the local client and the given
 * simulated router.
 * @param {number} routerID
 */
NetSimConnection.prototype.connectToRouter = function (routerID) {
  if (this.isConnectedToRouter()) {
    this.logger_.warn("Auto-disconnecting from previous router.");
    this.disconnectFromRouter();
  }

  // Create a local NetSimRouter for the remote router we want to connect with,
  //   which runs the local router simulation.
  this.router_ = new NetSimRouter(this.instanceID_, routerID);

  // Optimistically create a wire and point it at the router
  var self = this;
  self.createWire(routerID, function (wire) {
    if (wire !== null) {
      self.wire_ = wire;
      self.wire_.localHostname = self.displayName_.replace(/[^\w\d]/, '').
          toLowerCase();
      self.router_.countConnections(function (count) {
        if (count <= self.router_.MAX_CLIENT_CONNECTIONS) {
          self.router_.assignAddressesToWire(self.wire_,
              self.statusChanges.notifyObservers.bind(self.statusChanges));
          self.setConnectionStatus_(ConnectionStatus.CONNECTED);
        } else {
          // Oops!  We put the router over capacity, we should disconnect.
          self.disconnectFromRouter();
        }
      });
    }
  });
};

NetSimConnection.prototype.disconnectFromRouter = function () {
  if (!this.isConnectedToRouter()) {
    this.logger_.warn("Cannot disconnect: Not connected.");
    return;
  }

  var self = this;
  this.wire_.destroy(function (success) {
    if (success) {
      // Simulate final router update as we disconnect, so if we are the
      // last client to go, the router updates its connection status to
      // 0/6 clients connected.
      self.router_.update(function () {
        self.wire_ = null;
        self.router_ = null;
        self.setConnectionStatus_(ConnectionStatus.IN_LOBBY);
      });
      self.wire_ = null;
      self.router_ = null;
      self.setConnectionStatus_(ConnectionStatus.IN_LOBBY);
    }
  });
};

NetSimConnection.prototype.createWire = function (remoteID, onComplete) {
  if (!onComplete) {
    onComplete = function () {};
  }

  var self = this;
  NetSimWire.create(this.instanceID_, function (wire) {
    if (wire !== null) {
      wire.localID = self.myLobbyRowID_;
      wire.remoteID = remoteID;
      wire.update(function (success) {
        if (success) {
          onComplete(wire);
        } else {
          wire.destroy();
          onComplete(null);
        }
      });
    } else {
      onComplete(null);
    }
  });
};