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

/**
 * A shard is an isolated, complete simulation state shared by a subset of
 * users.  It's made of a set of storage tables set apart by a particular
 * shard ID in their names.  We use shards to allow students to interact only
 * with their particular class while still storing all NetSim tables under
 * the same App ID.
 *
 * @param {!string} shardID
 * @constructor
 */
var NetSimShard = module.exports = function (shardID) {
  /** @type {string} */
  this.id = shardID;

  /** @type {NetSimTable} */
  this.nodeTable = new NetSimTable(shardID + '_n');

  /** @type {NetSimTable} */
  this.wireTable = new NetSimTable(shardID + '_w');

  /** @type {NetSimTable} */
  this.messageTable = new NetSimTable(shardID + '_m');
  this.messageTable.setPollingInterval(3000);

  /** @type {NetSimTable} */
  this.logTable = new NetSimTable(shardID + '_l');
  this.logTable.setPollingInterval(10000);

  /** @type {NetSimTable} */
  this.heartbeatTable = new NetSimTable(shardID + '_h');
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
