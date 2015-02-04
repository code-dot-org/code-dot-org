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
 * Helper because we have so many callback arguments in this class.
 * @param funcArg
 * @returns {*}
 */
var defaultToEmptyFunction = function (funcArg) {
  if (funcArg !== undefined) {
    return funcArg;
  }
  return function () {};
};

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

/**
 * Static creation method: Creates a new router node on the given instance,
 * calls the given callback with a local controller for the new router node
 * when creation is complete.
 * @param instanceID
 * @param onComplete
 */
NetSimRouter.create = function (instanceID, onComplete) {
  onComplete = defaultToEmptyFunction(onComplete);

  var router = new NetSimRouter(instanceID);
  router.getLobbyTable().insert(router.buildLobbyRow_(), function (data) {
    if (data) {
      router.routerID = data.id;
      router.status_ = RouterStatus.READY;
      router.update(function (success) {
        if (success) {
          onComplete(router);
        } else {
          router.destroy();
          onComplete(null);
        }
      });
    } else {
      onComplete(null);
    }
  });
};

/**
 * Updates router status and lastPing time in lobby table - both keepAlive
 * and making sure router's connection count is valid.
 * @param onComplete
 */
NetSimRouter.prototype.update = function (onComplete) {
  onComplete = defaultToEmptyFunction(onComplete);

  var self = this;
  this.countConnections(function (count) {
    self.status_ = count >= self.MAX_CLIENT_CONNECTIONS ?
        RouterStatus.FULL : RouterStatus.READY;
    self.statusDetail_ = '(' + count + '/' + self.MAX_CLIENT_CONNECTIONS + ')';

    self.getLobbyTable().update(self.routerID, self.buildLobbyRow_(),
        function (success) {
          onComplete(success);
        }
    );
  });
};

/**
 * Removes router node from the lobby table.
 * @param onComplete
 */
NetSimRouter.prototype.destroy = function (onComplete) {
  onComplete = defaultToEmptyFunction(onComplete);

  this.getLobbyTable().delete(this.routerID, function (success) {
    onComplete(success);
  });
};

/**
 * Helper for getting lobby table of configured instance.
 * @returns {exports.SharedStorageTable}
 */
NetSimRouter.prototype.getLobbyTable = function () {
  return new netsimStorage.SharedStorageTable(netsimStorage.APP_PUBLIC_KEY,
      this.instanceID_ + '_lobby');
};

/**
 * Helper for getting wires table of configured instance.
 * @returns {exports.SharedStorageTable}
 */
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

/**
 * Build display name that we put into lobby table for this router.
 * @returns {string}
 */
NetSimRouter.prototype.getDisplayName = function () {
  return "Router " + this.routerID;
};

/**
 * Build a router hostname that we can set on our wires.
 * @returns {string}
 */
NetSimRouter.prototype.getHostname = function () {
  return this.getDisplayName().replace(/[^\w\d]/g, '').toLowerCase();
};

/**
 * Query the wires table and pass the callback a list of wire table rows,
 * where all of the rows are wires attached to this router.
 * @param onComplete
 */
NetSimRouter.prototype.getConnections = function (onComplete) {
  onComplete = defaultToEmptyFunction(onComplete);

  var routerID = this.routerID;
  this.getWireTable().all(function (rows) {
    if (rows === null) {
      onComplete([]);
      return;
    }

    var myWires = rows.filter(function (row) {
      // TODO: Check for wire validity/timeout here?
      return row.remoteNodeID === routerID;
    });

    onComplete(myWires);
  });
};

/**
 * Query the wires table and pass the callback the total number of wires
 * connected to this router.
 * @param onComplete
 */
NetSimRouter.prototype.countConnections = function (onComplete) {
  onComplete = defaultToEmptyFunction(onComplete);

  this.getConnections(function (wires) {
    onComplete(wires.length);
  });
};

/**
 * @param [Array] haystack
 * @param {*} needle
 * @returns {boolean} TRUE if needle found in haystack
 */
var contains = function (haystack, needle) {
  return haystack.some(function (element) {
    return element === needle;
  });
};

/**
 * Cue router to check existing wires and find an open address for the
 * given one.
 * @param {!NetSimWire} wireNeedingAddress
 * @param {function} onComplete
 */
NetSimRouter.prototype.assignAddressesToWire = function (wireNeedingAddress,
    onComplete) {
  onComplete = defaultToEmptyFunction(onComplete);

  var self = this;
  this.getConnections(function (wires) {
    var addressList = wires.filter(function (wire) {
      return wire.localAddress !== undefined;
    }).map(function (wire) {
      return wire.localAddress;
    });

    // Find the lowest unused integer address starting at 2
    // Non-optimal, but should be okay since our address list should not exceed 10.
    var newAddress = 2;
    while (contains(addressList, newAddress)) {
      newAddress++;
    }

    wireNeedingAddress.localAddress = newAddress;
    wireNeedingAddress.remoteAddress = 1; // Always 1 for routers
    wireNeedingAddress.remoteHostname = self.getHostname();
    wireNeedingAddress.update(onComplete);
    // TODO (bbuchanan): There is a possible race condition here, where we would
    // TODO              get the same address assigned to two clients.
    // TODO              Recover?
  });
};

/**
 * Query the wires table and pass the callback a list of addresses and
 * hostnames, which includes this router node and all of the nodes that are
 * connected to this router by an active wire.
 * Returns list of objects in form { hostname:{string}, address:{number} }
 * @param onComplete
 */
NetSimRouter.prototype.getAddressTable = function (onComplete) {
  onComplete = defaultToEmptyFunction(onComplete);

  var self = this;
  this.getConnections(function (wires) {
    var addressTable = wires.map(function (wire) {
      return {
        hostname: wire.localHostname,
        address: wire.localAddress
      };
    }).concat({
      hostname: self.getHostname(),
      address: 1
    });
    onComplete(addressTable);
  });
};