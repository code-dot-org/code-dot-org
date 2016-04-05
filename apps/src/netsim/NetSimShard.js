/**
 * @overview Represents a collection of tables that map to a particular
 *           class section's simulation, isolated from other class sections.
 */
'use strict';

var NetSimTable = require('./NetSimTable');
var PubSubService = require('./PubSubService');

/**
 * PubSub event key for events invalidating all tables.
 * @const {string}
 */
var WHOLE_SHARD_EVENT = 'all_tables';

/**
 * A shard is an isolated, complete simulation state shared by a subset of
 * users.  It's made of a set of storage tables set apart by a particular
 * shard ID in their names.  We use shards to allow students to interact only
 * with their particular class while still storing all NetSim tables under
 * the same App ID.
 *
 * @param {!string} shardID
 * @param {!PubSubConfig} pubSubConfig
 * @constructor
 */
var NetSimShard = module.exports = function (shardID, pubSubConfig) {
  /** @type {string} */
  this.id = shardID;

  /** @type {PubSubService} */
  this.pubSub = PubSubService.create(pubSubConfig);

  /** @type {PubSubChannel} */
  this.pubSubChannel = this.pubSub.subscribe(this.id);
  this.pubSubChannel.subscribe(WHOLE_SHARD_EVENT,
      NetSimShard.prototype.onPubSubEvent_.bind(this));

  /**
   * Collection of client (user) nodes and router nodes on the shard.
   * Each client node corresponds to a user (or browser tab, to be specific).
   * Router nodes are not associated with a particular user.
   *
   * All entities in this table descend from NetSimNode, and can be deserialized
   * via utilities in NetSimNodeFactory
   *
   * Rows in this table are
   * - inserted when a node is created (such as when a user connects)
   * - updated for certain changes to node status or router configuration
   * - deleted when a node is destroyed (such as when a user disconnects)
   *
   * @type {NetSimTable}
   * @see {NetSimNode}
   * @see {NetSimClientNode}
   * @see {NetSimRouterNode}
   * @see {NetSimLocalClientNode}
   * @see {NetSimNodeFactory}
   */
  this.nodeTable = new NetSimTable(this.pubSubChannel, shardID, 'n');

  /**
   * Collection of wires on the shard.  Wires document the connections between
   * nodes and certain node metadata, like hostnames and addresses.  Wires
   * reference node IDs, and are therefore referentially dependent on the node
   * table.
   *
   * All entities in this table deserialize into NetSimWire.
   *
   * Rows in this table are
   * - inserted when two nodes are connected
   * - updated when assigning an address
   * - deleted when two nodes are disconnected
   *
   * @type {NetSimTable}
   * @see {NetSimWire}
   */
  this.wireTable = new NetSimTable(this.pubSubChannel, shardID, 'w');

  /**
   * Collection of messages (enqueued or in-flight) on the shard.  Messages
   * reference node IDs, and are therefore referentially dependent on the node
   * table.
   *
   * All entities in this table deserialize into NetSimMessage.
   *
   * Rows in this table are
   * - inserted when a message is sent
   * - never updated
   * - deleted when a message is received
   *
   * @type {NetSimTable}
   * @see {NetSimMessage}
   */
  this.messageTable = new NetSimTable(this.pubSubChannel, shardID, 'm');

  /**
   * Collection of log entries for nodes on the shard.  Logs reference node IDs,
   * and are therefore referentially dependent on the node table (but we should
   * change this).channel
   *
   * All entities in this table deserialize into NetSimLogEntry.
   *
   * Rows in this table are
   * - inserted when a router routes or drops a message
   * - never updated
   * - never deleted
   *
   * @type {NetSimTable}
   * @see {NetSimLogEntry}
   */
  this.logTable = new NetSimTable(this.pubSubChannel, shardID, 'l', {
    // This is only safe to do because we never update or delete rows in this table.
    useIncrementalRefresh: true
  });
  this.logTable.unsubscribe();
};

/**
 * Necessary tear-down for shard.  In particular, disconnecting
 * from pubsub service.
 */
NetSimShard.prototype.disconnect = function () {
  this.nodeTable.unsubscribe();
  this.wireTable.unsubscribe();
  this.messageTable.unsubscribe();
  this.logTable.unsubscribe();
  this.pubSubChannel.unsubscribe(WHOLE_SHARD_EVENT);
  this.pubSubChannel = null;
  this.pubSub.unsubscribe(this.id);
};

/**
 * This tick allows our tables to poll the server for changes.
 * @param {!RunLoop.Clock} clock
 */
NetSimShard.prototype.tick = function (clock) {
  this.nodeTable.tick(clock);
  this.wireTable.tick(clock);
  this.messageTable.tick(clock);
  this.logTable.tick(clock);
};

/**
 * The "panic button" option - clears all data on the shard, kicking all
 * users out and starting over.
 * @param {NodeStyleCallback} onComplete
 */
NetSimShard.prototype.resetEverything = function (onComplete) {
  $.ajax({
    url: '/v3/netsim/' + this.id,
    type: 'delete',
    contentType: 'application/json; charset=utf-8',
    dataType: "json"
  }).done(function () {
    onComplete(null, true);
  }).fail(function (request, status, error) {
    var err = new Error('status: ' + status + '; error: ' + error);
    onComplete(err, false);
  });
};

/**
 * Called when the PubSub service fires an event that applies to all tables
 * @private
 */
NetSimShard.prototype.onPubSubEvent_ = function () {
  // Right now, the only all_tables event is the shard reset.
  // Refreshing the node table informs our node that a reset has occurred.
  // TODO: Use a "disconnect from shard" callback instead here.
  this.nodeTable.refresh();
};
