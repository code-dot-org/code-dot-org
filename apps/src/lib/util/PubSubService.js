/**
 * @overview Wrapped pub/sub service client APIs (like Pusher)
 */

import Pusher from 'pusher-js';
import {PusherChannel, NullChannel} from './PubSubChannel';

/**
 * JavaScript interface for a publish/subscribe service provider.
 * @interface IPubSubService
 */

/**
 * @function
 * @name IPubSubService#subscribe
 * @param {string} channelID - Channel to which we subscribe.
 * @returns {PubSubChannel}
 */

/**
 * @function
 * @name IPubSubService#unsubscribe
 * @param {string} channelID - Channel from which we unsubscribe.
 */

/**
 * @function
 * @name IPubSubService#disconnect
 */

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
 * @returns {IPubSubService}
 */
export default function create(pubSubConfig) {
  if (pubSubConfig.usePusher) {
    return new PusherService(pubSubConfig.pusherApplicationKey);
  }

  return new NullService();
}

/**
 * Stub implementation of PubSub API.
 * @implements IPubSubService
 */
class NullService {
  /**
   * Subscribe to events on a particular channel.
   * @param {string} channelID
   * @returns {PubSubChannel}
   */
  subscribe(channelID) {
    return new NullChannel();
  }

  /**
   * Unsubscribe from events on a particular channel.
   * @param {string} channelID
   */
  unsubscribe(channelID) {}

  /**
   * Disconnect from the PubSub service entirely.
   */
  disconnect() {}
}

/**
 * Wrapped Pusher.com API.
 * @implements IPubSubService
 */
class PusherService {
  /**
   * @param {string} applicationKey
   * @constructor
   */
  constructor(applicationKey) {
    /**
     * Instance of actual Pusher JavaScript API.
     * @type {Pusher}
     * @private
     */
    this.api_ = new Pusher(applicationKey, {encrypted: true});
  }

  /**
   * Subscribe to events on a particular channel.
   * @param {string} channelID
   * @returns {PubSubChannel}
   */
  subscribe(channelID) {
    return new PusherChannel(this.api_.subscribe(channelID));
  }

  /**
   * Unsubscribe from events on a particular channel.
   * @param {string} channelID
   */
  unsubscribe(channelID) {
    this.api_.unsubscribe(channelID);
  }

  /**
   * Disconnect from the Pusher service entirely.
   * It's invalid to take any further action on this object after disconnecting.
   */
  disconnect() {
    this.api_.disconnect();
    this.api_ = null;
  }
}
