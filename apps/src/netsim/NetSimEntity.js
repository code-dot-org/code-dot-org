/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxstatements: 200
 */
'use strict';

/**
 * Client model of simulated network entity, which lives in a shard table.
 *
 * Wraps the entity row with helper methods for examining and maintaining
 * the entity state in shared storage.
 *
 * @param {!NetSimShard} shard
 * @param {Object} [entityRow] JSON row from table.
 * @constructor
 */
var NetSimEntity = module.exports = function (shard, entityRow) {
  if (entityRow === undefined) {
    entityRow = {};
  }

  /**
   * @type {NetSimShard}
   * @protected
   */
  this.shard_ = shard;

  /**
   * Node's row ID within the _lobby table.  Unique within instance.
   * @type {number}
   */
  this.entityID = entityRow.id;
};

/**
 * Static async creation method.  Creates a new entity on the given shard,
 * and then calls the callback with a local controller for the new entity.
 * @param {!function} EntityType - The constructor for the entity type you want
 *        to create.
 * @param {!NetSimShard} shard
 * @param {!NodeStyleCallback} onComplete - Method that will be given the
 *        created entity, or null if entity creation failed.
 */
NetSimEntity.create = function (EntityType, shard, onComplete) {
  var entity = new EntityType(shard);
  entity.getTable_().create(entity.buildRow_(), function (err, row) {
    if (err === null) {
      onComplete(null, new EntityType(shard, row));
    } else {
      onComplete(err, null);
    }
  });
};

/**
 * Static async retrieval method.  Searches for a new entity on the given
 * shard, and then calls the callback with a local controller for the
 * found entity.
 * @param {!function} EntityType - The constructor for the entity type you want
 *        to find.
 * @param {!number} entityID - The row ID for the entity you'd like to find.
 * @param {!NetSimShard} shard
 * @param {!NodeStyleCallback} onComplete - Method that will be given the
 *        found entity, or null if entity search failed.
 */
NetSimEntity.get = function (EntityType, entityID, shard, onComplete) {
  var entity = new EntityType(shard);
  entity.getTable_().read(entityID, function (err, row) {
    var newEntity = null;
    if (!err) {
      newEntity = new EntityType(shard, row);
    }
    onComplete(err, newEntity);
  });
};

/**
 * Push entity state into remote storage.
 * @param {NodeStyleCallback} [onComplete] - Optional completion callback.
 */
NetSimEntity.prototype.update = function (onComplete) {
  onComplete = onComplete || function () {};

  this.getTable_().update(this.entityID, this.buildRow_(), onComplete);
};

/**
 * Remove entity from remote storage.
 * @param {NodeStyleCallback} [onComplete] - Optional completion callback
 */
NetSimEntity.prototype.destroy = function (onComplete) {
  onComplete = onComplete || function () {};

  this.getTable_().delete(this.entityID, onComplete);
};

/** Get storage table for this entity type. */
NetSimEntity.prototype.getTable_ = function () {
  // This method should be implemented by a child class.
  throw new Error('Method getTable_ is not implemented.');
};

/** Construct table row for this entity. */
NetSimEntity.prototype.buildRow_ = function () {
  return {};
};
