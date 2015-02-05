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
 maxstatements: 200
 */
/* global Date */
'use strict';

/**
 * Helper because we have so many callback arguments in this class.
 * @param funcArg
 * @returns {*}
 * TODO (bbuchanan) : Move this to utilities somewhere, or find
 *  a matching utility?
 */
var defaultToEmptyFunction = function (funcArg) {
  if (funcArg !== undefined) {
    return funcArg;
  }
  return function () {};
};

/**
 *
 * @param {!netsimInstance} instance
 * @param {Object} [entityRow] JSON row from table.
 * @constructor
 */
var NetSimEntity = function (instance, entityRow) {
  if (entityRow === undefined) {
    entityRow = {};
  }

  /**
   * @type {netsimInstance}
   * @private
   */
  this.instance_ = instance;

  /**
   * Cached last ping time for this entity
   * @type {number}
   * @private
   */
  this.lastPing_ = entityRow.lastPing;

  /**
   * Node's row ID within the _lobby table.  Unique within instance.
   * @type {number}
   */
  this.entityID = entityRow.id;

  /**
   * How long (in milliseconds) this entity is allowed to remain in
   * storage without being cleaned up.
   */
  this.ENTITY_TIMEOUT_MS = 300000;
};
module.exports = NetSimEntity;

/**
 * Static async creation method.  Creates a new entity on the given instance,
 * and then calls the callback with a local controller for the new entity.
 * @param {!function} EntityType - The constructor for the entity type you want
 *        to create.
 * @param {!netsimInstance} instance
 * @param {function} [onComplete] - Method that will be given the
 *        created entity, or null if entity creation failed.
 */
NetSimEntity.create = function (EntityType, instance, onComplete) {
  onComplete = defaultToEmptyFunction(onComplete);

  var entity = new EntityType(instance);
  entity.getTable_().insert(entity.buildRow_(), function (row) {
    if (row) {
      onComplete(new EntityType(instance, row));
    } else {
      onComplete(null);
    }
  });
};

/**
 * Static async retrieval method.  Searches for a new entity on the given
 * instance, and then calls the callback with a local controller for the
 * found entity.
 * @param {!function} EntityType - The constructor for the entity type you want
 *        to find.
 * @param {!number} entityID - The row ID for the entity you'd like to find.
 * @param {!netsimInstance} instance
 * @param {function} [onComplete] - Method that will be given the
 *        found entity, or null if entity search failed.
 */
NetSimEntity.get = function (EntityType, entityID, instance, onComplete) {
  onComplete = defaultToEmptyFunction(onComplete);

  var entity = new EntityType(instance);
  entity.getTable_().fetch(entityID, function (row) {
    if (row) {
      onComplete(new EntityType(instance, row));
    } else {
      onComplete(null);
    }
  });
};

NetSimEntity.prototype.update = function (onComplete) {
  onComplete = defaultToEmptyFunction(onComplete);

  this.lastPing_ = Date.now();
  this.getTable_().update(this.entityID, this.buildRow_(), onComplete);
};

NetSimEntity.prototype.destroy = function (onComplete) {
  onComplete = defaultToEmptyFunction(onComplete);

  this.getTable_().delete(this.entityID, onComplete);
};

NetSimEntity.prototype.getTable_ = function () {
  // This method should be implemented by an inheriting class.
  throw new Error('Method getTable_ is not implemented.');
};

NetSimEntity.prototype.buildRow_ = function () {
  return {
    lastPing: Date.now()
  };
};

/**
 * Whether this entity's row has been touched within its timeout.
 * @returns {boolean}
 */
NetSimEntity.prototype.isExpired = function () {
  return Date.now() - this.lastPing_ >= this.ENTITY_TIMEOUT_MS;
};