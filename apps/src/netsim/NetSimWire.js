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

var netsimStorage = require('./netsimStorage');

var NetSimWire = function () {
  /**
   * Instance this wire lives within, used to generate tablenames
   * @type {string}
   * @private
   */
  this.instanceID_ = undefined;

  /**
   * This wire's row ID within the _wire table
   * @type {number}
   */
  this.wireID = undefined;

  /**
   * Connected node row IDs within the _lobby table
   * @type {number}
   */
  this.localID = undefined;
  this.remoteID = undefined;

  /**
   * Assigned local addresses for the ends of this wire.
   * When connected to a router, remoteAddress is always 1.
   * @type {number}
   */
  this.localAddress = undefined;
  this.remoteAddress = undefined;

  /**
   * Not used yet.
   * @type {string}
   */
  this.wireMode = 'duplex'; // Or simplex?
};
module.exports = NetSimWire;

NetSimWire.create = function (instanceID, completionCallback) {
  var wire = new NetSimWire();

  wire.instanceID_ = instanceID;
  wire.getTable().insert(wire.buildRow_(), function (data) {
    if (data) {
      wire.wireID = data.id;
      completionCallback(wire);
    } else {
      completionCallback(null);
    }
  });
};

NetSimWire.prototype.getTable = function () {
  return new netsimStorage.SharedStorageTable(netsimStorage.APP_PUBLIC_KEY,
      this.instanceID_ + '_wire');
};

NetSimWire.prototype.update = function (completionCallback) {
  if (!completionCallback) {
    completionCallback = function () {};
  }

  this.getTable().update(this.wireID, this.buildRow_(), function (success) {
    completionCallback(success);
  });
};

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
    localID: this.localID,
    remoteID: this.remoteID,
    localAddress: this.localAddress,
    remoteAddress: this.remoteAddress,
    wireMode: this.wireMode
  };
};

NetSimWire.prototype.putOutgoing = function () {

};

NetSimWire.prototype.putIncoming = function () {

};

NetSimWire.prototype.readOutgoing = function () {

};

NetSimWire.prototype.readIncoming = function () {

};