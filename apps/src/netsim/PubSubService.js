/**
 * @overview Wrapped pub/sub service client APIs (like Pusher)
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
/* global Pusher */
'use strict';

var NetSimLogger = require('./NetSimLogger');
var PubSubChannel = require('./PubSubChannel');
var netsimGlobals = require('./netsimGlobals');

/**
 * JavaScript interface for a publish/subscribe service provider.
 * @param {string} applicationKey
 * @interface
 */
var PubSubService = exports;

/**
 * Create an API instance appropriate to the current configuration.
 * @returns {PubSubService}
 */
PubSubService.create = function () {
  var pubSubConfig = netsimGlobals.getPubSubServiceInfo();
  if (pubSubConfig.usePusher) {
    return new PubSubService.PusherService(pubSubConfig.pusherApplicationKey);
  }

  return new PubSubService.NullService();
};

/**
 * @function
 * @name PubSubService#subscribe
 * @param {string} channelID - Channel to which we subscribe.
 * @returns {PubSubChannel}
 */

/**
 * Stub implementation of PubSub API.
 * @constructor
 * @implements PubSubService
 */
PubSubService.NullService = function () { };

/**
 * @returns {PubSubChannel}
 */
PubSubService.NullService.prototype.subscribe = function () {
  return new PubSubChannel.NullChannel();
};

/**
 * Wrapped Pusher.com API.
 * @param {string} applicationKey
 * @constructor
 * @implements PubSubService
 */
PubSubService.PusherService = function (applicationKey) {
  /**
   * Instance of actual Pusher JavaScript API.
   * @type {Pusher}
   * @private
   */
  this.api_ = new Pusher(applicationKey, {
    encrypted: true
  });

  // TODO: Don't ship with logging enabled.
  Pusher.log = function (message) {
    NetSimLogger.getSingleton().info(message);
  };
};

/**
 * Subscribe to events on a particular channel.
 * @param {string} channelID
 * @returns {PubSubChannel}
 */
PubSubService.PusherService.prototype.subscribe = function (channelID) {
  return new PubSubChannel.PusherChannel(this.api_.subscribe(channelID));
};
