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
var NetSimWire = require('./NetSimWire');

/**
 * @param {!netsimInstance} instance
 * @param {Object} [nodeRow] JSON row from table.
 * @constructor
 * @augments NetSimEntity
 */
var NetSimNode = function (instance, nodeRow) {
  superClass.call(this, instance, nodeRow);

  if (nodeRow === undefined) {
    nodeRow = {};
  }

  /**
   * @type {string}
   * @private
   */
  this.displayName_ = nodeRow.name;

  /**
   * @type {string}
   * @private
   */
  this.status_ = nodeRow.status;

  /**
   * @type {string}
   * @private
   */
  this.statusDetail_ = nodeRow.statusDetail;
};
NetSimNode.prototype = Object.create(superClass.prototype);
NetSimNode.prototype.constructor = NetSimNode;
module.exports = NetSimNode;

/** Get storage table for nodes */
NetSimNode.prototype.getTable_= function () {
  return this.instance_.getLobbyTable();
};

/** Build table row for this node */
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
  return this.displayName_ ? this.displayName_ : '[New Node]';
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
  return this.status_;
};

/**
 * Get node's additional status info, usually display-only
 * status info.
 * @returns {string}
 */
NetSimNode.prototype.getStatusDetail = function () {
  return this.statusDetail_ ? this.statusDetail_ : '';
};

/**
 * Establish a connection between this node and another node,
 * by creating a wire between them, and verifying that the remote node
 * can accept the connection.
 * When finished, calls onComplete({the new wire})
 * On failure, calls onComplete(null)
 * @param {!NetSimNode} otherNode
 * @param {function} [onComplete]
 */
NetSimNode.prototype.connectToNode = function (otherNode, onComplete) {
  if (!onComplete) {
    onComplete = function () {};
  }

  var self = this;
  NetSimWire.create(this.instance_, function (wire) {
    if (wire === null) {
      onComplete(null);
      return;
    }

    wire.localNodeID = self.entityID;
    wire.remoteNodeID = otherNode.entityID;
    wire.update(function (success) {
      if (!success) {
        wire.destroy(function () {
          onComplete(null);
        });
        return;
      }

      otherNode.acceptConnection(self, function (success) {
        if (!success) {
          wire.destroy(function () {
            onComplete(null);
          });
          return;
        }

        onComplete(wire);
      });
    });
  });
};

/**
 * Called when another node establishes a connection to this one, giving this
 * node a chance to reject the connection.
 * @param {!NetSimNode} otherNode attempting to connect to this one
 * @param {!function} onComplete response method - should call with TRUE
 *        if connection is allowed, FALSE if connection is rejected.
 */
NetSimNode.prototype.acceptConnection = function (otherNode, onComplete) {
  onComplete(true);
};