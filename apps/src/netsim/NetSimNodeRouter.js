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

var superClass = require('./NetSimNode');
var NetSimEntity = require('./NetSimEntity');
var NetSimWire = require('./NetSimWire');

/**
 * @param {!netsimInstance} instance
 * @param {Object} [routerRow] - Lobby row for this router.
 * @constructor
 * @augments NetSimNode
 */
var NetSimNodeRouter = function (instance, routerRow) {
  superClass.call(this, instance, routerRow);

  /**
   * @const
   * @type {number}
   */
  this.MAX_CLIENT_CONNECTIONS = 6;
};
NetSimNodeRouter.prototype = Object.create(superClass.prototype);
NetSimNodeRouter.prototype.constructor = NetSimNodeRouter;
module.exports = NetSimNodeRouter;

/**
 * Static async creation method. See NetSimEntity.create().
 * @param {!netsimInstance} instance
 * @param {function} [onComplete] - Method that will be given the
 *        created entity, or null if entity creation failed.
 */
NetSimNodeRouter.create = function (instance, onComplete) {
  NetSimEntity.create(NetSimNodeRouter, instance, function (router) {
    // Always try and update router immediately, to set its DisplayName
    // correctly.
    if (router) {
      router.update(function () {
        onComplete(router);
      });
    } else {
      onComplete(router);
    }
  });
};

/**
 * Static async retrieval method.  See NetSimEntity.get().
 * @param {!number} entityID - The row ID for the entity you'd like to find.
 * @param {!netsimInstance} instance
 * @param {function} [onComplete] - Method that will be given the
 *        found entity, or null if entity search failed.
 */
NetSimNodeRouter.get = function (routerID, instance, onComplete) {
  NetSimEntity.get(NetSimNodeRouter, routerID, instance, onComplete);
};

/**
 * @readonly
 * @enum {string}
 */
NetSimNodeRouter.RouterStatus = {
  INITIALIZING: 'Initializing',
  READY: 'Ready',
  FULL: 'Full'
};
var RouterStatus = NetSimNodeRouter.RouterStatus;

/**
 * Updates router status and lastPing time in lobby table - both keepAlive
 * and making sure router's connection count is valid.
 * @param onComplete
 */
NetSimNodeRouter.prototype.update = function (onComplete) {
  onComplete = onComplete || function () {};

  var self = this;
  this.countConnections(function (count) {
    self.status_ = count >= self.MAX_CLIENT_CONNECTIONS ?
        RouterStatus.FULL : RouterStatus.READY;
    self.statusDetail_ = '(' + count + '/' + self.MAX_CLIENT_CONNECTIONS + ')';
    superClass.prototype.update.call(self, onComplete);
  });
};

/** @inheritdoc */
NetSimNodeRouter.prototype.getDisplayName = function () {
  return "Router " + this.entityID;
};

/** @inheritdoc */
NetSimNodeRouter.prototype.getNodeType = function () {
  return NetSimNodeRouter.getNodeType();
};
NetSimNodeRouter.getNodeType = function () {
  return 'router';
};

/**
 * Helper for getting wires table of configured instance.
 * @returns {exports.SharedStorageTable}
 */
NetSimNodeRouter.prototype.getWireTable = function () {
  return this.instance_.getWireTable();
};

/**
 * Query the wires table and pass the callback a list of wire table rows,
 * where all of the rows are wires attached to this router.
 * @param {function} onComplete, which accepts an Array of NetSimWire.
 */
NetSimNodeRouter.prototype.getConnections = function (onComplete) {
  onComplete = onComplete || function () {};

  var instance = this.instance_;
  var routerID = this.entityID;
  this.getWireTable().all(function (rows) {
    if (rows === null) {
      onComplete([]);
      return;
    }

    var myWires = rows.
        map(function (row) {
          return new NetSimWire(instance, row);
        }).
        filter(function (wire){
          return wire.remoteNodeID === routerID;
        });

    onComplete(myWires);
  });
};

/**
 * Query the wires table and pass the callback the total number of wires
 * connected to this router.
 * @param {function} onComplete, which accepts a number.
 */
NetSimNodeRouter.prototype.countConnections = function (onComplete) {
  onComplete = onComplete || function () {};

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
 * Called when another node establishes a connection to this one, giving this
 * node a chance to reject the connection.
 *
 * The router checks against its connection limit, and rejects the connection
 * if its limit is now exceeded.
 *
 * @param {!NetSimNode} otherNode attempting to connect to this one
 * @param {!function} onComplete response method - should call with TRUE
 *        if connection is allowed, FALSE if connection is rejected.
 */
NetSimNodeRouter.prototype.acceptConnection = function (otherNode, onComplete) {
  var self = this;
  this.countConnections(function (count) {
    if (count > self.MAX_CLIENT_CONNECTIONS) {
      onComplete(false);
      return;
    }

    onComplete(true);
  });
};

/**
 * Assign a new address for hostname on wire, calling onComplete(success)
 * when done.
 * @param {!NetSimWire} wire that lacks addresses or hostnames
 * @param {string} hostname of requesting node
 * @param {function} [onComplete] reports success or failure.
 */
NetSimNodeRouter.prototype.requestAddress = function (wire, hostname, onComplete) {
  onComplete = onComplete || function () {};


  // General strategy: Create a list of existing remote addresses, pick a
  // new one, and assign it to the provided wire.
  var self = this;
  this.getConnections(function (wires) {
    var addressList = wires.filter(function (wire) {
      return wire.localAddress !== undefined;
    }).map(function (wire) {
      return wire.localAddress;
    });

    // Find the lowest unused integer address starting at 2
    // Non-optimal, but should be okay since our address list should not exceed 10.
    var newAddress = 1;
    while (contains(addressList, newAddress)) {
      newAddress++;
    }

    wire.localAddress = newAddress;
    wire.localHostname = hostname;
    wire.remoteAddress = 0; // Always 0 for routers
    wire.remoteHostname = self.getHostname();
    wire.update(onComplete);
    // TODO: Fix possibility of two routers getting addresses by verifying
    //       after updating the wire.
  });
};

/**
 * Query the wires table and pass the callback a list of addresses and
 * hostnames, which includes this router node and all of the nodes that are
 * connected to this router by an active wire.
 * Returns list of objects in form { hostname:{string}, address:{number} }
 * @param onComplete
 */
NetSimNodeRouter.prototype.getAddressTable = function (onComplete) {
  onComplete = onComplete || function () {};

  var self = this;
  this.getConnections(function (wires) {
    var addressTable = wires.map(function (wire) {
      return {
        hostname: wire.localHostname,
        address: wire.localAddress
      };
    }).concat({
      hostname: self.getHostname(),
      address: 0
    });
    onComplete(addressTable);
  });
};
