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
 * @fileoverview Client model of simulated node
 *
 * Represents the client's view of a node that is controlled by a user client,
 * either by our own client or somebody else's.  Is a NetSimEntity, meaning
 * it wraps a row in the node table and provides functionality around it.
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

/**
 * @param {!netsimInstance} instance
 * @param {Object} [clientRow] - Lobby row for this router.
 * @constructor
 * @augments NetSimNode
 */
var NetSimNodeClient = function (instance, clientRow) {
  superClass.call(this, instance, clientRow);

  /**
   * @type {string}
   * @private
   * @override
   */
  this.status_ = 'Online';

  /**
   * How long (in milliseconds) this entity is allowed to remain in
   * storage without being cleaned up.
   * @override
   */
  this.ENTITY_TIMEOUT_MS = 30000;
};
NetSimNodeClient.prototype = Object.create(superClass.prototype);
NetSimNodeClient.prototype.constructor = NetSimNodeClient;
module.exports = NetSimNodeClient;

/**
 * Static async creation method. See NetSimEntity.create().
 * @param {!netsimInstance} instance
 * @param {function} [onComplete] - Method that will be given the
 *        created entity, or null if entity creation failed.
 */
NetSimNodeClient.create = function (instance, onComplete) {
  NetSimEntity.create(NetSimNodeClient, instance, onComplete);
};

/**
 * @inheritdoc
 */
NetSimNodeClient.prototype.getNodeType = function () {
  return NetSimNodeClient.getNodeType();
};
NetSimNodeClient.getNodeType = function () {
  return 'user';
};

NetSimNodeClient.prototype.setDisplayName = function (displayName) {
  this.displayName_ = displayName;
};
