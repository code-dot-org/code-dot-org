/**
 * @overview Wrapped pub/sub service channel APIs (like Pusher's Channel)
 */

/**
 * Javascript interface for a publish/subscribe channel.
 * @interface PubSubChannel
 */

/**
 * Subscribe to an event, so that the given callback is called when the
 * event occurs.
 * @function
 * @name PubSubChannel#subscribe
 * @param {string} eventName - The name of the event to bind to.
 * @param {function} callback - A function to be called whenever the event is
 *        triggered.
 */

/**
 * Unsubscribe from a given event
 * @function
 * @name PubSubChannel#unsubscribe
 * @param {string} eventName - The name of the event to bind to.
 */

/** @implements PubSubChannel */
export class NullChannel {
  /**
   * Subscribe to an event so the given callback is called when the event occurs.
   * @param {string} eventName - The name of the event to bind to.
   * @param {function} callback - A function to be called whenever the event is
   *        triggered.
   */
  subscribe(eventName, callback) {}

  /**
   * Unsubscribe a given callback from a given event
   * @param {string} eventName
   */
  unsubscribe(eventName) {}
}

/** @implements PubSubChannel */
export class PusherChannel {
  constructor(pusherApiChannel) {
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
  }

  /**
   * Subscribe to an event so the given callback is called when the event occurs.
   * @param {string} eventName
   * @param {function()} callback
   * @throws {Error} on double-subscribe.
   */
  subscribe(eventName, callback) {
    this.pusherChannel_.bind(eventName, callback);
    if (this.callbacks_[eventName] !== undefined) {
      throw new Error('Already subscribed to event ' + eventName);
    }
    this.callbacks_[eventName] = callback;
  }

  /**
   * Unsubscribe a given callback from a given event
   * @param {string} eventName
   */
  unsubscribe(eventName) {
    this.pusherChannel_.unbind(eventName, this.callbacks_[eventName]);
    delete this.callbacks_[eventName];
  }
}
