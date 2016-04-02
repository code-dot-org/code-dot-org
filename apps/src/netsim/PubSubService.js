/**
 * @overview Wrapped pub/sub service client APIs (like Pusher)
 */
/* global Pusher */
'use strict';

var PubSubChannel = require('./PubSubChannel');

/**
 * JavaScript interface for a publish/subscribe service provider.
 * @param {string} applicationKey
 * @interface
 */
var PubSubService = exports;

/**
 * @typedef {Object} PubSubConfig
 * @property {boolean} usePusher - Whether to use Pusher's API, or a null
 *           implementation.
 * @property {string} pusherApplicationKey - If using Pusher, the public key
 *           required to initialize the Pusher API.
 */

/**
 * Create an API instance appropriate to the current configuration.
 * @param {!PubSubConfig} pubSubConfig
 * @returns {PubSubService}
 */
PubSubService.create = function (pubSubConfig) {
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
 * @function
 * @name PubSubService#unsubscribe
 * @param {string} channelID - Channel from which we unsubscribe.
 */

/**
 * Stub implementation of PubSub API.
 * @constructor
 * @implements PubSubService
 */
PubSubService.NullService = function () { };

/**
 * Subscribe to events on a particular channel.
 * @param {string} channelID
 * @returns {PubSubChannel}
 */
PubSubService.NullService.prototype.subscribe = function (channelID) {
  return new PubSubChannel.NullChannel();
};

/**
 * Unsubscribe from events on a particular channel.
 * @param {string} channelID
 */
PubSubService.NullService.prototype.unsubscribe = function (channelID) { };

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
  this.api_ = new Pusher(applicationKey, {encrypted: true});
};

/**
 * Subscribe to events on a particular channel.
 * @param {string} channelID
 * @returns {PubSubChannel}
 */
PubSubService.PusherService.prototype.subscribe = function (channelID) {
  return new PubSubChannel.PusherChannel(this.api_.subscribe(channelID));
};

/**
 * Unsubscribe from events on a particular channel.
 * @param {string} channelID
 */
PubSubService.PusherService.prototype.unsubscribe = function (channelID) {
  this.api_.unsubscribe(channelID);
};
