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
/* global $ */
'use strict';

var superClass = require('./NetSimEntity');

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
 * @augments NetSimEntity
 */
var NetSimWire = function (instance, wireRow) {
  superClass.call(this, instance, wireRow);

  // Default empty wireRow object
  if (wireRow === undefined) {
    wireRow = {};
  }

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
NetSimWire.prototype = Object.create(superClass.prototype);
NetSimWire.prototype.constructor = NetSimWire;
module.exports = NetSimWire;

/**
 * Static async creation method.  See NetSimEntity.create().
 * @param {!netsimInstance} instance
 * @param {function} [onComplete] - Method that will be given the
 *        created entity, or null if entity creation failed.
 */
NetSimWire.create = function (instance, onComplete) {
  superClass.create(NetSimWire, instance, onComplete);
};

/**
 * Helper that gets the wires table for the configured instance.
 * @returns {exports.SharedStorageTable}
 */
NetSimWire.prototype.getTable_ = function () {
  return this.instance_.getWireTable();
};

/**
 * Build own row for the wire table
 */
NetSimWire.prototype.buildRow_ = function () {
  return $.extend(superClass.prototype.buildRow_.call(this), {
    localNodeID: this.localNodeID,
    remoteNodeID: this.remoteNodeID,
    localAddress: this.localAddress,
    remoteAddress: this.remoteAddress,
    localHostname: this.localHostname,
    remoteHostname: this.remoteHostname,
    wireMode: this.wireMode
  });
};
