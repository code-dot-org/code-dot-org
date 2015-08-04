/**
 * @overview Represents a collection of tables that map to a particular
 *           class section's simulation, isolated from other class sections.
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

var NetSimTable = require('./NetSimTable');
var PubSubService = require('./PubSubService');

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
  var channel = this.pubSub.subscribe(shardID);

  /**
   * Collection of client (user) nodes and router nodes on the shard.
   * Each client node corresponds to a user (or browser tab, to be specific).
   * Router nodes are not associated with a particular user.
   *
   * All entities in this table descend from NetSimNode, and can be deserialized
   * via utilities in netsimNodeFactory
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
   * @see {netsimNodeFactory}
   */
  this.nodeTable = new NetSimTable(channel, shardID, 'n');

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
  this.wireTable = new NetSimTable(channel, shardID, 'w');

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
  this.messageTable = new NetSimTable(channel, shardID, 'm');

  /**
   * Collection of log entries for nodes on teh shard.  Logs reference node IDs,
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
  this.logTable = new NetSimTable(channel, shardID, 'l', {
    // This is only safe to do because we never update or delete rows in this table.
    useIncrementalRefresh: true
  });
  this.logTable.setRefreshThrottleTime(5000);
};

/**
 * This tick allows our tables to poll the server for changes.
 * @param {!RunLoop.Clock} clock
 */
NetSimShard.prototype.tick = function (clock) {
  // TODO (bbuchanan): Eventaully, these polling events should just be
  //                   backup for the notification system.
  this.nodeTable.tick(clock);
  this.wireTable.tick(clock);
  this.messageTable.tick(clock);
  this.logTable.tick(clock);
};
