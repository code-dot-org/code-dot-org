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
var LogLevel = NetSimLogger.LogLevel;
var ObservableEvent = require('./ObservableEvent');

/**
 * How often a keep-alive message should be sent to the instance lobby
 * @type {number}
 * @const
 */
var KEEP_ALIVE_INTERVAL_MS = 2000;

/**
 * Milliseconds before a client is considered 'disconnected' and
 * can be cleaned up by another client.
 * @type {number}
 * @const
 */
var CONNECTION_TIMEOUT_MS = 30000; // 30 seconds
var CONNECTION_TIMEOUT_ROUTER_MS = 300000; // 5 minutes

/**
 * @type {string}
 */
var LOBBY_TYPE_USER = 'user';

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
   * Access object for instance lobby
   * @type {netsimStorage.SharedStorageTable}
   * @private
   */
  this.lobbyTable_ = null;

  /**
   * This connection's unique Row ID within the lobby table.
   * If undefined, we aren't connected to an instance.
   * @type {number}
   */
  this.myLobbyRowID_ = undefined;

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

  // Bind to onBeforeUnload event to attempt graceful disconnect
  window.addEventListener('beforeunload', this.onBeforeUnload_.bind(this));
};
module.exports = NetSimConnection;

/**
 * Instance Connection Status enum
 * @readonly
 * @enum {number}
 */
var ConnectionStatus = {
  DISCONNECTED: 0,
  CONNECTED: 1
};
NetSimConnection.ConnectionStatus = ConnectionStatus;

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
    type: LOBBY_TYPE_USER,
    status: 'In Lobby'
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
  var tableName = instanceID + '_lobby';
  this.lobbyTable_ = new netsimStorage.SharedStorageTable(
     netsimStorage.APP_PUBLIC_KEY, tableName);

  // Connect to the lobby table we just set
  this.connect_();
};

/**
 * Get the current lobby table object, for manipulating the lobby.
 * @returns {netsimStorage.SharedStorageTable}
 */
NetSimConnection.prototype.getLobbyTable = function () {
  return this.lobbyTable_;
};

/**
 * Ends the connection to the netsim instance.
 */
NetSimConnection.prototype.disconnectFromInstance = function () {
  if (!this.isConnectedToInstance()) {
    this.logger_.log("Redundant disconnect call.", LogLevel.WARN);
    return;
  }

  // TODO (bbuchanan) : Check for other resources we need to clean up
  //                    before we disconnect from the instance.

  this.disconnectByRowID_(this.myLobbyRowID_);
  this.setConnectionStatus_(ConnectionStatus.DISCONNECTED);
};

/**
 * Given a lobby table has already been configured, connects to that table
 * by inserting a row for ourselves into that table and saving the row ID.
 * @private
 */
NetSimConnection.prototype.connect_ = function () {
  var self = this;
  this.lobbyTable_.insert(this.buildLobbyRow_(), function (returnedData) {
    if (returnedData) {
      self.setConnectionStatus_(ConnectionStatus.CONNECTED, returnedData.id);
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
  this.lobbyTable_.delete(lobbyRowID, function (succeeded) {
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
 * @param {ConnectionStatus} newStatus
 * @param {number} lobbyRowID - Can be omitted for status DISCONNECTED
 * @private
 */
NetSimConnection.prototype.setConnectionStatus_ = function (newStatus, lobbyRowID) {
  switch (newStatus) {
    case ConnectionStatus.CONNECTED:
        this.myLobbyRowID_ = lobbyRowID;
        this.nextKeepAliveTime_ = 0;
        this.logger_.log("Connected to instance, assigned ID " +
            this.myLobbyRowID_, LogLevel.INFO);
        break;

    case ConnectionStatus.DISCONNECTED:
        this.myLobbyRowID_ = undefined;
        this.nextKeepAliveTime_ = Infinity;
        this.logger_.log("Disconnected from instance", LogLevel.INFO);
      break;
  }
  this.statusChanges.notifyObservers();
};

NetSimConnection.prototype.keepAlive = function () {
  if (!this.isConnectedToInstance()) {
    this.logger_.log("Can't send keepAlive, not connected to instance.", LogLevel.WARN);
    return;
  }

  var self = this;
  this.lobbyTable_.update(this.myLobbyRowID_, this.buildLobbyRow_(),
      function (succeeded) {
        if (!succeeded) {
          self.setConnectionStatus_(ConnectionStatus.DISCONNECTED);
          self.logger_.log("Reconnecting...", LogLevel.INFO);
          self.connect_();
        }
  });
};

NetSimConnection.prototype.getLobbyListing = function (callback) {
  if (!this.isConnectedToInstance()) {
    this.logger_.log("Can't get lobby rows, not connected to instance.", LogLevel.WARN);
    callback([]);
    return;
  }

  var logger = this.logger_;
  this.lobbyTable_.all(function (data) {
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

    // TODO (bbuchanan): Need a better policy for when to do this.  Or, we
    //                   might not need to once we have auto-expiring rows.
    this.cleanLobby_();

    if (this.nextKeepAliveTime_ === 0) {
      this.nextKeepAliveTime_ = clock.time + KEEP_ALIVE_INTERVAL_MS;
    } else {
      // Stable increment
      while (this.nextKeepAliveTime_ < clock.time) {
        this.nextKeepAliveTime_ += KEEP_ALIVE_INTERVAL_MS;
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
  this.getLobbyListing(function (lobbyData) {
    lobbyData.forEach(function (lobbyRow) {
      if (lobbyRow.type === LOBBY_TYPE_USER && now - lobbyRow.lastPing >= CONNECTION_TIMEOUT_MS) {
        self.disconnectByRowID_(lobbyRow.id);
      } else if (lobbyRow.type === 'router' && now - lobbyRow.lastPing >= CONNECTION_TIMEOUT_ROUTER_MS) {
        self.disconnectByRowID_(lobbyRow.id);
      }
    });
  });
};