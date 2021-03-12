/**
 * @overview base class for all simulation entities.
 */

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
var NetSimEntity = (module.exports = function(shard, entityRow) {
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

  /**
   * Node's UUID assigned when it was initially inserted into the table.
   * @type {string}
   */
  this.uuid = entityRow.uuid;
});

/**
 * Static async creation method.  Creates a new entity on the given shard,
 * and then calls the callback with a local controller for the new entity.
 * @param {!function} EntityType - The constructor for the entity type you want
 *        to create.
 * @param {!NetSimShard} shard
 * @param {!NodeStyleCallback} onComplete - Method that will be given the
 *        created entity, or null if entity creation failed.
 */
NetSimEntity.create = function(EntityType, shard, onComplete) {
  var entity = new EntityType(shard);
  entity.getTable().create(entity.buildRow(), function(err, row) {
    if (err) {
      onComplete(err, null);
    } else {
      onComplete(null, new EntityType(shard, row));
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
NetSimEntity.get = function(EntityType, entityID, shard, onComplete) {
  var entity = new EntityType(shard);
  entity.getTable().read(entityID, function(err, row) {
    if (err) {
      onComplete(err, null);
    } else {
      onComplete(err, new EntityType(shard, row));
    }
  });
};

/**
 * Push entity state into remote storage.
 * @param {NodeStyleCallback} [onComplete] - Optional completion callback.
 */
NetSimEntity.prototype.update = function(onComplete) {
  onComplete = onComplete || function() {};

  this.getTable().update(this.entityID, this.buildRow(), onComplete);
};

/**
 * Remove entity from remote storage.
 * @param {NodeStyleCallback} [onComplete] - Optional completion callback
 */
NetSimEntity.prototype.destroy = function(onComplete) {
  onComplete = onComplete || function() {};

  this.getTable().delete(this.entityID, onComplete);
};

/**
 * Remove entity from remote storage while user is navigating away from the page.
 * @returns {Error|null} error if entity delete fails
 */
NetSimEntity.prototype.destroyOnUnload = function() {
  return this.getTable().deleteOnUnload(this.entityID);
};

/** Get storage table for this entity type. */
NetSimEntity.prototype.getTable = function() {
  // This method should be implemented by a child class.
  throw new Error('Method getTable is not implemented.');
};

/** Construct table row for this entity. */
NetSimEntity.prototype.buildRow = function() {
  return {};
};

/**
 * Destroys all provided entities (from remote storage) asynchronously, and
 * calls onComplete when all entities have been destroyed and/or an error occurs.
 * @param {NetSimEntity[]} entities
 * @param {!NodeStyleCallback} onComplete
 * @throws {Error} if all passed entities do not belong to the same table.
 */
NetSimEntity.destroyEntities = function(entities, onComplete) {
  if (entities.length === 0) {
    onComplete(null, true);
    return;
  }

  var table = entities[0].getTable();
  var entityIDs = entities.map(function(entity) {
    if (entity.getTable() !== table) {
      throw new Error(
        'destroyEntities requires all entities to be in the same table'
      );
    }
    return entity.entityID;
  });

  table.deleteMany(entityIDs, onComplete);
};
