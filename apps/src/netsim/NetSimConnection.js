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

var _ = require('../utils').getLodash();
var netsimStorage = require('./netsimStorage');
var NetSimLogger = require('./NetSimLogger');
var LogLevel = NetSimLogger.LogLevel;

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
    this.logger_ = new NetSimLogger(LogLevel.NONE);
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
   * Methods registered to be notified when instance connection
   * status changes.
   * @type {Array[Function]}
   */
  this.onChangeCallbacks_ = [];

  // Bind to onBeforeUnload event to attempt graceful disconnect
  window.addEventListener('beforeunload', _.bind(this.onBeforeUnload_, this));
};
module.exports = NetSimConnection;

NetSimConnection.prototype.registerChangeCallback = function (callback) {
  this.onChangeCallbacks_.push(callback);
};

NetSimConnection.prototype.callChangeCallbacks = function () {
  this.onChangeCallbacks_.forEach(function (callback) {
    callback();
  });
};

/**
 * Before-unload handler, used to try and disconnect gracefully when
 * navigating away instead of just letting our record time out.
 * @private
 */
NetSimConnection.prototype.onBeforeUnload_ = function () {
  this.onChangeCallbacks_ = [];
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
    type: 'user',
    status: 'not_connected'
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

  // Being connected to an instance means having an entry in that instance's
  // lobby table.
  var tableName = instanceID + '_lobby';
  this.lobbyTable_ = new netsimStorage.SharedStorageTable(
     netsimStorage.APP_PUBLIC_KEY,
     tableName);

  // Insert a row for self into instance lobby table
  // TODO (bbuchanan) : Use enums for these values?
  var self = this;
  this.lobbyTable_.insert(this.buildLobbyRow_(), function (returnedData) {
    if (returnedData) {
      self.myLobbyRowID_ = returnedData.id;
      self.logger_.log("Connected to instance, assigned ID " + self.myLobbyRowID_,
          LogLevel.INFO);
    } else {
      // TODO (bbuchanan) : Connection retry?
      self.lobbyTable_ = null;
      self.logger_.log("Failed to connect to instance", LogLevel.ERROR);
    }
    self.callChangeCallbacks();
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
 * Ends the connection to the netsim instance.
 */
NetSimConnection.prototype.disconnectFromInstance = function () {
  if (!this.isConnectedToInstance()) {
    this.logger_.log("Redundant disconnect call.", LogLevel.WARN);
    return;
  }

  // TODO (bbuchanan) : Check for other resources we need to clean up
  // before we disconnect from the instance.

  var self = this;
  this.lobbyTable_.delete(this.myLobbyRowID_, function (succeeded) {
    if (succeeded) {
      self.logger_.log("Disconnected from instance.", LogLevel.INFO);
    } else {
      // TODO (bbuchanan) : Disconnect retry?
      self.logger_.log("Failed to notify instance of disconnect.", LogLevel.WARN);
    }
  });

  this.myLobbyRowID_ = undefined;
  this.lobbyTable_ = null;
  this.callChangeCallbacks();
};

NetSimConnection.prototype.keepAlive = function () {
  if (!this.isConnectedToInstance()) {
    this.logger.log("Can't send keepAlive, not connected to instance.", LogLevel.WARN);
    return;
  }

  var self = this;
  this.lobbyTable_.update(this.myLobbyRowID_, this.buildLobbyRow_(),
      function (succeeded) {
        if (succeeded) {
          self.logger_.log("keepAlive succeeded.", LogLevel.INFO);
        } else {
          self.logger_.log("keepAlive failed.", LogLevel.WARN);
        }
  });
};

NetSimConnection.prototype.getLobbyListing = function (callback) {
  if (!this.isConnectedToInstance()) {
    this.logger.log("Can't get lobby rows, not connected to instance.", LogLevel.WARN);
    callback([]);
    return;
  }

  var logger = this.logger_;
  this.lobbyTable_.all(function (data) {
    if (null === data) {
      logger.log("Lobby data request failed, using empty list.", LogLevel.WARN);
      callback([]);
    } else {
      callback(data);
    }
  });
};
