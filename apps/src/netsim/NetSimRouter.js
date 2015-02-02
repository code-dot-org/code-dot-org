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
 * @fileoverview Client representation of simulated router
 *
 * A router -exists- when it has a row in the lobby table of type 'router'
 * A router is connected to a user when a 'user' row exists in the lobby
 *   table that has a status 'Connected to {router ID} by wires {X, Y}'.
 * A router will also share a wire (simplex) or wires (duplex) with each user,
 *   which appear in the wire table.
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

var NetSimConnection = require('./NetSimConnection');
var NetSimLogger = require('./NetSimLogger');
var LogLevel = NetSimLogger.LogLevel;

/**
 * @readonly
 * @enum {string}
 */
var RouterStatus = {
  OFFLINE: 'Offline',
  INITIALIZING: 'Initializing',
  READY: 'Ready',
  FULL: 'Full'
};

/**
 *
 * @param {!NetSimConnection} connection
 * @param {NetSimLogger} logger - A log control interface, default nullimpl
 * @constructor
 */
var NetSimRouter = function (connection, logger /*=new NetSimLogger(NONE)*/) {
  /**
   * Instance connection that this lobby control will manipulate.
   * @type {NetSimConnection}
   * @private
   */
  this.connection_ = connection;

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
   * @type {RouterStatus}
   * @private
   */
  this.status_ = RouterStatus.OFFLINE;

  /**
   * @type {string}
   * @private
   */
  this.displayName_ = "Router";
};
module.exports = NetSimRouter;

/**
 *
 * @returns {string}
 * @private
 */
NetSimRouter.prototype.buildLobbyStatus_ = function () {
  return this.status_;
};

/**
 * Helper that builds a lobby-table row in a consistent
 * format, based on the current connection state.
 * @private
 */
NetSimRouter.prototype.buildLobbyRow_ = function () {
  return {
    lastPing: Date.now(),
    name: this.displayName_,
    type: NetSimConnection.LobbyRowType.ROUTER,
    status: this.buildLobbyStatus_()
  };
};

/**
 *
 */
NetSimRouter.prototype.connectToLobby = function () {
  if (!this.connection_.isConnectedToInstance()) {
    this.logger_.error("Can't create a router without a connection");
    return;
  }

  this.status_ = RouterStatus.INITIALIZING;

  var self = this;
  var lobbyTable = this.connection_.getLobbyTable();
  lobbyTable.insert(this.buildLobbyRow_(), function (data) {
    if (data) {
      // First pass - just use the Row ID as the router ID
      self.status_ = RouterStatus.READY;
      self.lobbyID_ = data.id;
      self.displayName_ = 'Router ' + self.lobbyID_;
      self.logger_.info(self.displayName_ + ' created.');
      self.updateRemoteStatus();
    } else {
      self.logger_.error("Failed to create router");
    }
  });
};

/**
 * A keepalive for routers, which puts their current state
 * into the remote table.
 */
NetSimRouter.prototype.updateRemoteStatus = function () {
  var self = this;
  var lobbyTable = this.connection_.getLobbyTable();
  lobbyTable.update(self.lobbyID_, self.buildLobbyRow_(), function (success) {
    if (success) {
      self.logger_.info(self.displayName_ + ' status updated.');
    } else {
      self.logger_.warn(self.displayName_ + ' status update failed.');
    }
  });
};