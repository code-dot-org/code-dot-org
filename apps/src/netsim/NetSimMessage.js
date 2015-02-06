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
 * @fileoverview Entity for message transmitted between two nodes
 *
 * These should really never be updated, only created and deleted.
 */

/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxparams: 4,
 maxstatements: 200
 */
/* global $ */
'use strict';

var superClass = require('./NetSimEntity');

/**
 * Local controller for a message that is 'on the wire'
 *
 * Doesn't actually have any association with the wire - one could,
 * theoretically, send a message from any node in the simulation to any other
 * node in the simulation.
 *
 * Any message that exists in the table is 'in transit' to a node.  Nodes
 * should remove messages as soon as they receive them.
 *
 * @param {!NetSimTables} instance - The instance where this wire lives.
 * @param {Object} [messageRow] - A row out of the _message table on the
 *        instance.  If provided, will initialize this message with the given
 *        data.  If not, this message will initialize to default values.
 * @constructor
 * @augments NetSimEntity
 */
var NetSimMessage = function (instance, messageRow) {
  superClass.call(this, instance, messageRow);

  // Default empty wireRow object
  if (messageRow === undefined) {
    messageRow = {};
  }

  /**
   * Node ID that this message is 'in transit' to.
   * @type {number}
   */
  this.toNodeID = messageRow.toNodeID;

  /**
   * All other message content, including the 'packets' students will send.
   * @type {*}
   */
  this.payload = messageRow.payload;
};
NetSimMessage.prototype = Object.create(superClass.prototype);
NetSimMessage.prototype.constructor = NetSimMessage;
module.exports = NetSimMessage;

/**
 * Static async creation method.  Creates a new message on the given instance,
 * and then calls the callback with a success boolean.
 * @param {!NetSimTables} instance
 * @param {!number} toNodeID - destination node ID
 * @param {*} payload - message content
 * @param {!function} onComplete (success)
 */
NetSimMessage.send = function (instance, toNodeID, payload, onComplete) {
  var entity = new NetSimMessage(instance);
  entity.toNodeID = toNodeID;
  entity.payload = payload;
  entity.getTable_().create(entity.buildRow_(), function (row) {
    onComplete(row !== undefined);
  });
};

/**
 * Helper that gets the wires table for the configured instance.
 * @returns {exports.SharedTable}
 */
NetSimMessage.prototype.getTable_ = function () {
  return this.instanceTables_.messageTable;
};

/** Build own row for the message table  */
NetSimMessage.prototype.buildRow_ = function () {
  return $.extend(superClass.prototype.buildRow_.call(this), {
    toNodeID: this.toNodeID,
    payload: this.payload
  });
};
