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

/**
 * How often a keep-alive message should be sent to the instance lobby
 * @type {number}
 * @const
 */
var KEEP_ALIVE_INTERVAL_MS = 2000;
var CLEAN_UP_INTERVAL_MS = 10000;

/**
 * Milliseconds before a client is considered 'disconnected' and
 * can be cleaned up by another client.
 * @type {number}
 * @const
 */
var CONNECTION_TIMEOUT_MS = 30000; // 30 seconds
var CONNECTION_TIMEOUT_ROUTER_MS = 300000; // 5 minutes
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
   * Connected instance.  Determines table names.
   * @type {string}
   * @private
   */
  this.instanceID_ = undefined;

  /**
   * This connection's unique Row ID within the lobby table.
   * If undefined, we aren't connected to an instance.
   * @type {number}
   */
  this.myLobbyRowID_ = undefined;

  /**
   * @type {NetSimConnection.ConnectionStatus}
   * @private
   */
  this.status_ = NetSimConnection.ConnectionStatus.OFFLINE;

  /**
   * @type {string}
   * @private
   */
  this.statusDetail_ = '';

  /**
   * Allows others to subscribe to connection status changes.
   * args: none
   * Notifies on:
   * - Connect to instance
   * - Disconnect from instance
   * @type {ObservableEvent}
   */
  this.statusChanges = new ObservableEvent();

  /**
   * When the next keepAlive update should be sent to the lobby
   * @type {Number}
   * @private
   */
  this.nextKeepAliveTime_ = Infinity;
  this.nextCleanUpTime_ = Infinity;

  this.wire_ = null;
  this.router_ = null;

  // Bind to onBeforeUnload event to attempt graceful disconnect
  window.addEventListener('beforeunload', this.onBeforeUnload_.bind(this));
};
module.exports = NetSimConnection;

/**
 * Client Connection Status enum
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
 * Lobby row-type enum
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
    statusDetail: this.statusDetail_
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

  // Create and cache a lobby table connection
  this.instanceID_ = instanceID;

  // Connect to the lobby table we just set
  this.status_ = ConnectionStatus.IN_LOBBY;
  this.connect_();
};

/**
 * Get the current lobby table object, for manipulating the lobby.
 * @returns {netsimStorage.SharedStorageTable}
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

  // TODO (bbuchanan) : Check for other resources we need to clean up
  //                    before we disconnect from the instance.

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
      this.nextKeepAliveTime_ = 0;
      this.nextCleanUpTime_ = 0;
      this.logger_.info("Connected to node.");
      this.statusDetail_ = " to router " + this.router_.routerID +
          " on wire " + this.wire_.wireID;
      break;

    case ConnectionStatus.IN_LOBBY:
      this.nextKeepAliveTime_ = 0;
      this.nextCleanUpTime_ = 0;
      this.logger_.info("Connected to instance, assigned ID " +
          this.myLobbyRowID_, LogLevel.INFO);
      this.statusDetail_ = "";
      break;

    case ConnectionStatus.OFFLINE:
      this.myLobbyRowID_ = undefined;
      this.nextKeepAliveTime_ = Infinity;
      this.nextCleanUpTime_ = Infinity;
      this.logger_.info("Disconnected from instance", LogLevel.INFO);
      this.statusDetail_ = "";
      break;
  }
  this.statusChanges.notifyObservers();
};

NetSimConnection.prototype.getReadableStatus = function () {
  return this.status_ + ' to router ' + this.router_.routerID +
      ' on wire ' + this.wire_.wireID;
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
  if (clock.time >= this.nextKeepAliveTime_) {
    this.keepAlive();

    // We also perform updates for our connected wires and routers
    if (this.wire_) {
      this.wire_.update();
    }

    if (this.router_) {
      this.router_.update();
    }

    if (this.nextKeepAliveTime_ === 0) {
      this.nextKeepAliveTime_ = clock.time + KEEP_ALIVE_INTERVAL_MS;
    } else {
      // Stable increment
      while (this.nextKeepAliveTime_ < clock.time) {
        this.nextKeepAliveTime_ += KEEP_ALIVE_INTERVAL_MS;
      }
    }
  }

  // Client-driven cleanup of instance tables
  // TODO (bbuchanan): Would be nice if this could go away entirely.
  //                   Investigate auto-expiring rows.
  if (clock.time >= this.nextCleanUpTime_) {
    this.cleanLobby_();

    if (this.nextCleanUpTime_ === 0) {
      this.nextCleanUpTime_ = clock.time + CLEAN_UP_INTERVAL_MS;
    } else {
      // Stable increment
      while (this.nextCleanUpTime_ < clock.time) {
        this.nextCleanUpTime_ += CLEAN_UP_INTERVAL_MS;
      }
    }
  }
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
            wireTable.delete(row.id, function (success) {
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
      self.router_.countConnections(function (count) {
        if (count <= self.router_.MAX_CLIENT_CONNECTIONS) {
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