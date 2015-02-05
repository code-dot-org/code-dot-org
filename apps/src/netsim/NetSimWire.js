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
 * @fileoverview Client model simulated connection to another node.
 *
 * Distinct from NetSimConnection, which represents the client's actual
 * connection to the simulator instance, this is a simulated connection
 * between simulated notes.
 *
 * In shared storage, this shows up as a row in the {instance}_wire table.
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

/**
 * Create a local controller for a simulated connection between nodes,
 * which is stored in the _wire table on the instance.  The controller can
 * be initialized with the JSON row from the table, effectively wrapping that
 * data in helpful methods.
 *
 * @param {!netsimInstance} instance - The instance where this wire lives.
 * @param {Object} [wireRow] - A row out of the _wire table on the instance.
 *        If provided, will initialize this wire with the given data.  If not,
 *        this wire will initialize to default values.
 * @constructor
 */
var NetSimWire = function (instance, wireRow) {
  if (wireRow === undefined) {
    wireRow = {};
  }

  /**
   * Instance this wire lives within, used to generate tablenames
   * @type {string}
   * @private
   */
  this.instance_ = instance;

  /**
   * This wire's row ID within the _wire table
   * @type {number}
   */
  this.wireID = wireRow.wireID;

  /**
   * Connected node row IDs within the _lobby table
   * @type {number}
   */
  this.localNodeID = wireRow.localNodeID;
  this.remoteNodeID = wireRow.remoteNodeID;

  /**
   * Assigned local addresses for the ends of this wire.
   * When connected to a router, remoteAddress is always 1.
   * @type {number}
   */
  this.localAddress = wireRow.localAddress;
  this.remoteAddress = wireRow.remoteAddress;

  /**
   * Display hostnames for the ends of this wire.
   * Generally, each endpoint should set its own hostname.
   * @type {string}
   */
  this.localHostname = wireRow.localHostname;
  this.remoteHostname = wireRow.remoteHostname;

  /**
   * Not used yet.
   * @type {string}
   */
  this.wireMode = wireRow.wireMode !== undefined ?
      wireRow.wireMode : 'duplex'; // Or simplex?
};
module.exports = NetSimWire;

/**
 * Static async creation method.  Creates a new wire on the given instance, and
 * then calls the callback with a local controller for the new wire.
 * @param {!netsimInstance} instance - Where the _wire table lives.
 * @param {!function} completionCallback - Method that will be given the
 *        created wire, or null if wire creation failed.
 */
NetSimWire.create = function (instance, completionCallback) {
  var wire = new NetSimWire(instance);
  wire.getTable().insert(wire.buildRow_(), function (data) {
    if (data) {
      wire.wireID = data.id;
      completionCallback(wire);
    } else {
      completionCallback(null);
    }
  });
};

/**
 * Static async construction method.  Gets the wire with the given wireID from
 * the given instance, then calls the callback with a local controller for the
 * found wire.
 * @param {!netsimInstance} instance - Where the _wire table lives.
 * @param {!number} wireID - Row identifier of the requested wire in the _wire
 *        table.
 * @param {!function} completionCallback - Method that will be given the
 *        retrieved wire, or null if the wire request failed.
 */
NetSimWire.get = function (instance, wireID, completionCallback) {
  var wire = new NetSimWire(instance);
  wire.getTable().get(wireID, function (data) {
    if (data) {
      completionCallback(new NetSimWire(data));
    } else {
      completionCallback(null);
    }
  });
};

/**
 * Helper that gets the wires table for the configured instance.
 * @returns {exports.SharedStorageTable}
 */
NetSimWire.prototype.getTable = function () {
  return this.instance_.getWireTable();
};

/**
 * Pushes latest wire status to the wires table, acting as a keepAlive.
 * @param completionCallback
 */
NetSimWire.prototype.update = function (completionCallback) {
  if (!completionCallback) {
    completionCallback = function () {};
  }

  this.getTable().update(this.wireID, this.buildRow_(), function (success) {
    completionCallback(success);
  });
};

/**
 * Removes this wire from the wires table.
 * @param completionCallback
 */
NetSimWire.prototype.destroy = function (completionCallback) {
  if (!completionCallback) {
    completionCallback = function () {};
  }

  this.getTable().delete(this.wireID, function (success) {
    completionCallback(success);
  });
};

/**
 * Build own row for the wire table
 */
NetSimWire.prototype.buildRow_ = function () {
  return {
    lastPing: Date.now(),
    localNodeID: this.localNodeID,
    remoteNodeID: this.remoteNodeID,
    localAddress: this.localAddress,
    remoteAddress: this.remoteAddress,
    localHostname: this.localHostname,
    remoteHostname: this.remoteHostname,
    wireMode: this.wireMode
  };
};
