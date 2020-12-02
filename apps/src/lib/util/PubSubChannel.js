/**
 * @overview Wrapped pub/sub service channel APIs (like Pusher's Channel)
 */

/**
 * Javascript interface for a publish/subscribe channel.
 * @interface IPubSubChannel
 */

/**
 * Subscribe to an event, so that the given callback is called when the
 * event occurs.
 * @function
 * @name IPubSubChannel#subscribe
 * @param {string} eventName - The name of the event to bind to.
 * @param {function} callback - A function to be called whenever the event is
 *        triggered.
 */

/**
 * Unsubscribe from a given event
 * @function
 * @name IPubSubChannel#unsubscribe
 * @param {string} eventName - The name of the event to bind to.
 */

/** @implements IPubSubChannel */
export class NullChannel {
  subscribe(_eventName, _callback) {}
  unsubscribe(_eventName) {}
}

/** @implements IPubSubChannel */
export class PusherChannel {
  constructor(pusherApiChannel) {
    /**
     * The actual Pusher API's channel.
     */
    this.pusherChannel_ = pusherApiChannel;

    /**
     * Cache provided callbacks for easy unsubscribe.
     * Maps event name to callback.
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
