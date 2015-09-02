/**
 * @overview Wrapped pub/sub service channel APIs (like Pusher's Channel)
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

/**
 * Javascript interface for a publish/subscribe channel.
 * @interface
 */
var PubSubChannel = exports;

/**
 * Subscribe to an event, so that the given callback is called when the
 * event occurs.
 * @function
 * @name PubSubChannel#subscribe
 * @param {string} eventName - The name of the event to bind to.
 * @param {function} callback - A function to be called whenever the event is
 *        triggered.
 */

// Disable "unused variable" errors for null implementation declarations
/* jshint unused:false */

/**
 * @constructor
 * @implements PubSubChannel
 */
PubSubChannel.NullChannel = function () { };

/**
 * Subscribe to an event so the given callback is called when the event occurs.
 * @param {string} eventName - The name of the event to bind to.
 * @param {function} callback - A function to be called whenever the event is
 *        triggered.
 */
PubSubChannel.NullChannel.prototype.subscribe = function (eventName, callback) { };

/**
 * Unsubscribe a given callback from a given event
 * @param {string} eventName
 */
PubSubChannel.NullChannel.prototype.unsubscribe = function (eventName) { };

// Re-enable "unused variable" error
/* jshint unused:true */

/**
 * @constructor
 * @implements PubSubChannel
 */
PubSubChannel.PusherChannel = function (pusherApiChannel) {
  /**
   * The actual Pusher API's channel.
   * @private {Channel}
   */
  this.pusherChannel_ = pusherApiChannel;

  /**
   * Cache provided callbacks for easy unsubscribe.
   * Maps event name to callback.
   * @type {Object}
   * @private
   */
  this.callbacks_ = {};
};

/**
 * Subscribe to an event so the given callback is called when the event occurs.
 * @param {string} eventName
 * @param {function()} callback
 */
PubSubChannel.PusherChannel.prototype.subscribe = function (eventName, callback) {
  this.pusherChannel_.bind(eventName, callback);
  this.callbacks_[eventName] = callback;
};

/**
 * Unsubscribe a given callback from a given event
 * @param {string} eventName
 */
PubSubChannel.PusherChannel.prototype.unsubscribe = function (eventName) {
  this.pusherChannel_.unbind(eventName, this.callbacks_[eventName]);
  delete this.callbacks_[eventName];
};
