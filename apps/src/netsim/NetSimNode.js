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
 * @fileoverview Client model of simulated network entity, which lives
 * in an instance table.
 *
 * Wraps the entity row with helper methods for examining and maintaining
 * the entity state in shared storage.
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
 *
 * @param {!netsimInstance} instance
 * @param {Object} [nodeRow] JSON row from table.
 * @constructor
 */
var NetSimNode = function (instance, nodeRow) {
  superClass.call(this, instance, nodeRow);

  this.nodeType_ = undefined;
};
NetSimNode.prototype = Object.create(superClass.prototype);
NetSimNode.prototype.constructor = NetSimNode;
module.exports = NetSimNode;

NetSimNode.prototype.getTable_= function () {
  return this.instance_.getLobbyTable();
};

NetSimNode.prototype.buildRow_ = function () {
  return $.extend(superClass.prototype.buildRow_.call(this), {
    name: this.getDisplayName(),
    type: this.getNodeType(),
    status: this.getStatus(),
    statusDetail: this.getStatusDetail()
  });
};

/**
 * Get node's display name, which is stored in table.
 * @returns {string}
 */
NetSimNode.prototype.getDisplayName = function () {
  return '';
};

/**
 * Get node's hostname, a modified version of its display name.
 * @returns {string}
 */
NetSimNode.prototype.getHostname = function () {
  return this.getDisplayName().replace(/[^\w\d]/g, '').toLowerCase();
};

/**
 * Get node's type.
 * @returns {string}
 */
NetSimNode.prototype.getNodeType = function () {
  throw new Error('getNodeType method is not implemented');
};

/**
 * Get node's status, usually a string enum value.
 * @returns {string}
 */
NetSimNode.prototype.getStatus = function () {
  return '';
};

/**
 * Get node's additional status info, usually display-only
 * status info.
 * @returns {string}
 */
NetSimNode.prototype.getStatusDetail = function () {
  return '';
};