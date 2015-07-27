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

  /** @type {NetSimTable} */
  this.nodeTable = new NetSimTable(channel, shardID, 'n');

  /** @type {NetSimTable} */
  this.wireTable = new NetSimTable(channel, shardID, 'w');

  /** @type {NetSimTable} */
  this.messageTable = new NetSimTable(channel, shardID, 'm');
  this.messageTable.setPollingInterval(3000);

  /** @type {NetSimTable} */
  this.logTable = new NetSimTable(channel, shardID, 'l');
  this.logTable.setPollingInterval(10000);

  /** @type {NetSimTable} */
  this.heartbeatTable = new NetSimTable(channel, shardID, 'h');
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
