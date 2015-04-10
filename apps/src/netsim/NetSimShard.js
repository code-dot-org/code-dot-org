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
/* global window */
'use strict';

var SharedTable = require('../clientApi').SharedTable;
var NetSimTable = require('./NetSimTable');

/**
 * App key, unique to netsim, used for connecting with the storage API.
 * @type {string}
 * @readonly
 */
// TODO (bbuchanan): remove once we can store ids for each app? (userid:1 apppid:42)
var CHANNEL_PUBLIC_KEY = 'HQJ8GCCMGP7Yh8MrtDusIA==';
// Ugly null-guards so we can load this file in tests.
if (window &&
    window.location &&
    window.location.hostname &&
    window.location.hostname.split('.')[0] === 'localhost') {
  CHANNEL_PUBLIC_KEY = 'JGW2rHUp_UCMW_fQmRf6iQ==';
}

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
  this.nodeTable = new NetSimTable(
      new SharedTable(CHANNEL_PUBLIC_KEY, shardID + '_n'));

  /** @type {NetSimTable} */
  this.wireTable = new NetSimTable(
      new SharedTable(CHANNEL_PUBLIC_KEY, shardID + '_w'));

  /** @type {NetSimTable} */
  this.messageTable = new NetSimTable(
      new SharedTable(CHANNEL_PUBLIC_KEY, shardID + '_m'));
  this.messageTable.setPollingInterval(3000);

  /** @type {NetSimTable} */
  this.logTable = new NetSimTable(
      new SharedTable(CHANNEL_PUBLIC_KEY, shardID + '_l'));
  this.logTable.setPollingInterval(10000);

  /** @type {NetSimTable} */
  this.heartbeatTable = new NetSimTable(
      new SharedTable(CHANNEL_PUBLIC_KEY, shardID + '_h'));
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
