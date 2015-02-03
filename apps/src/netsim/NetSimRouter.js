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

var netsimStorage = require('./netsimStorage');
var NetSimLogger = require('./NetSimLogger');
var LogLevel = NetSimLogger.LogLevel;

/**
 * @param {string} instanceID
 * @param {?number} routerID - Lobby row ID for this router.  If null, use
 *        connectToLobby() to add this router to the lobby and get an ID.
 * @constructor
 */
var NetSimRouter = function (instanceID, routerID) {
  /**
   * @type {string}
   * @private
   */
  this.instanceID_ = instanceID;

  /**
   * This router's row ID (and unique ID) within the lobby table of the instance.
   * @type {?number}
   */
  this.routerID = routerID;

  /**
   * Instance of logging API, gives us choke-point control over log output
   * @type {NetSimLogger}
   * @private
   */
  this.logger_ = new NetSimLogger(console, LogLevel.VERBOSE);

  /**
   * @type {RouterStatus}
   * @private
   */
  this.status_ = NetSimRouter.RouterStatus.INITIALIZING;

  /**
   * @type {string}
   * @private
   */
  this.statusDetail_ = '';

  /**
   * @const
   * @type {number}
   */
  this.MAX_CLIENT_CONNECTIONS = 6;
};
module.exports = NetSimRouter;

/**
 * @readonly
 * @enum {string}
 */
NetSimRouter.RouterStatus = {
  INITIALIZING: 'Initializing',
  READY: 'Ready',
  FULL: 'Full'
};
var RouterStatus = NetSimRouter.RouterStatus;

NetSimRouter.create = function (instanceID, completionCallback) {
  if (!completionCallback) {
    completionCallback = function () {};
  }

  var router = new NetSimRouter(instanceID);
  router.getLobbyTable().insert(router.buildLobbyRow_(), function (data) {
    if (data) {
      router.routerID = data.id;
      router.status_ = RouterStatus.READY;
      router.update(function (success) {
        if (success) {
          completionCallback(router);
        } else {
          router.destroy();
          completionCallback(null);
        }
      });
    } else {
      completionCallback(null);
    }
  });
};

NetSimRouter.prototype.update = function (completionCallback) {
  if (!completionCallback) {
    completionCallback = function () {};
  }

  var self = this;
  this.countConnections(function (count) {
    self.status_ = count >= self.MAX_CLIENT_CONNECTIONS ?
        RouterStatus.FULL : RouterStatus.READY;
    self.statusDetail_ = '(' + count + '/' + self.MAX_CLIENT_CONNECTIONS + ')';

    self.getLobbyTable().update(self.routerID, self.buildLobbyRow_(),
        function (success) {
          completionCallback(success);
        }
    );
  });
};

NetSimRouter.prototype.destroy = function (completionCallback) {
  if (!completionCallback) {
    completionCallback = function () {};
  }

  // TODO: Any other cleanup here?

  this.getLobbyTable().delete(this.routerID, function (success) {
    completionCallback(success);
  });
};

NetSimRouter.prototype.getLobbyTable = function () {
  return new netsimStorage.SharedStorageTable(netsimStorage.APP_PUBLIC_KEY,
      this.instanceID_ + '_lobby');
};

NetSimRouter.prototype.getWireTable = function () {
  return new netsimStorage.SharedStorageTable(netsimStorage.APP_PUBLIC_KEY,
      this.instanceID_ + '_wire');
};

/**
 * Helper that builds a lobby-table row in a consistent
 * format, based on the current connection state.
 * @private
 */
NetSimRouter.prototype.buildLobbyRow_ = function () {
  return {
    lastPing: Date.now(),
    name: this.getDisplayName(),
    type: 'router',
    status: this.status_,
    statusDetail: this.statusDetail_
  };
};

NetSimRouter.prototype.getDisplayName = function () {
  return "Router " + this.routerID;
};

NetSimRouter.prototype.countConnections = function (completeCallback) {
  var routerID = this.routerID;
  this.getWireTable().all(function (rows) {
    if (rows === null) {
      completeCallback(0);
      return;
    }

    // Router is always the remote end of a wire
    var myWires = rows.filter(function (row) {
      // TODO: Check for wire validity/timeout here?
      return row.remoteID === routerID;
    });

    completeCallback(myWires.length);
  });
};