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
 * @fileoverview Client model of simulated router
 *
 * Represents the client's view of a given router, provides methods for
 *   letting the client interact with the router, and wraps the client's
 *   work doing part of the router simulation.
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
 *
 * @param {!NetSimConnection} connection
 * @param {?number} routerID - Lobby row ID for this router.  If null, use
 *        connectToLobby() to add this router to the lobby and get an ID.
 * @constructor
 */
var NetSimRouter = function (connection, routerID) {
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
  this.logger_ = connection.getLogger();

  /**
   * This router's row ID (and unique ID) within the lobby table of the instance.
   * @type {?number}
   */
  this.routerID = routerID;

  /**
   * @type {RouterStatus}
   * @private
   */
  this.status_ = NetSimRouter.RouterStatus.OFFLINE;

  /**
   * @type {string}
   * @private
   */
  this.displayName_ = "Router";

  /**
   * Cached list of connected client rows.  Gets updated anytime
   * fetchConnectedClients is called.  Should not be depended on unless you
   * know you've *just* updated it.
   * @type {Array}
   * @private
   */
  this.connectedClientCache_ = [];

  if (this.routerID !== undefined) {
    this.pullStatusFromRemote();
  }
};
module.exports = NetSimRouter;

/**
 * @const
 * @type {number}
 */
NetSimRouter.MAX_CLIENT_CONNECTIONS = 6;

/**
 * @readonly
 * @enum {string}
 */
NetSimRouter.RouterStatus = {
  OFFLINE: 'Offline',
  INITIALIZING: 'Initializing',
  READY: 'Ready',
  FULL: 'Full'
};
var RouterStatus = NetSimRouter.RouterStatus;

/**
 *
 * @returns {string}
 * @private
 */
NetSimRouter.prototype.buildLobbyStatus_ = function () {
  if (this.status_ === RouterStatus.READY) {
    var connectionCount = this.connectedClientCache_.length;
    if (connectionCount >= NetSimRouter.MAX_CLIENT_CONNECTIONS) {
      return RouterStatus.FULL;
    }
    return RouterStatus.READY + ' (' + connectionCount + '/' +
        NetSimRouter.MAX_CLIENT_CONNECTIONS + ')';
  }
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
      self.routerID = data.id;
      self.displayName_ = 'Router ' + self.routerID;
      self.logger_.info(self.displayName_ + ' created.');
      self.pushStatusToRemote();
    } else {
      self.logger_.error("Failed to create router");
    }
  });
};

/**
 * A keepalive for routers, which puts their current state
 * into the remote table.
 */
NetSimRouter.prototype.pushStatusToRemote = function () {
  var self = this;
  var lobbyTable = this.connection_.getLobbyTable();
  lobbyTable.update(self.routerID, self.buildLobbyRow_(), function (success) {
    if (success) {
      self.logger_.info(self.displayName_ + ' status updated.');
    } else {
      self.logger_.warn(self.displayName_ + ' status update failed.');
    }
  });
};

NetSimRouter.prototype.pullStatusFromRemote = function (onComplete) {
  if (onComplete === undefined) {
    onComplete = function () {};
  }

  if (this.routerID === undefined) {
    this.logger_.error("Can't pull status from remote: Router doesn't " +
    "exist on remote yet.");
    return;
  }

  var self = this;
  this.connection_.fetchLobbyListing(function (lobbyRows) {
    var connectedClients = [];
    var foundSelf = false;
    lobbyRows.forEach(function (row) {
      if (row.id === self.routerID) {
        foundSelf = true;
      }

      if (self.isClientConnectedToMe_(row.status)) {
        connectedClients.push(row);
      }
    });

    self.connectedClientCache_ = connectedClients;
    if (foundSelf) {
      if (self.connectedClientCache_.length >= NetSimRouter.MAX_CLIENT_CONNECTIONS) {
        self.status_ = RouterStatus.FULL;
      } else {
        self.status_ = RouterStatus.READY;
      }
    } else {
      self.status_ = RouterStatus.OFFLINE;
    }

    onComplete();
  });
};

NetSimRouter.prototype.fetchConnectedClients = function (onComplete) {
  var self = this;
  this.pullStatusFromRemote(function () {
    onComplete(self.connectedClientCache_);
  });
};

NetSimRouter.prototype.isClientConnectedToMe_ = function (clientStatus) {
  // TODO (bbuchanan) : Remove this duplication of status format...
  var re = new RegExp(NetSimConnection.ClientStatus.CONNECTED + ':' + this.routerID);
  return re.test(clientStatus);
};

/**
 *
 * @param {function} thenCallback
 * @param {function} [elseCallback]
 */
NetSimRouter.prototype.ifBelowCapacity = function (thenCallback, elseCallback) {
  this.fetchConnectedClients(function (connectedClients) {
    if (connectedClients.length < NetSimRouter.MAX_CLIENT_CONNECTIONS) {
      thenCallback();
    } else {
      elseCallback();
    }
  });
};

/**
 *
 * @param {function} thenCallback
 * @param {function} [elseCallback]
 */
NetSimRouter.prototype.ifBeyondCapacity = function (thenCallback, elseCallback) {
  this.fetchConnectedClients(function (connectedClients) {
    if (connectedClients.length > NetSimRouter.MAX_CLIENT_CONNECTIONS) {
      thenCallback();
    } else {
      elseCallback();
    }
  });
};