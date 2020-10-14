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
 * Subscribe to events on a particular channel.
 * @function
 * @name IPubSubService#subscribe
 * @param {string} channelID - Channel to which we subscribe.
 * @returns {IPubSubChannel}
 */

/**
 * Unsubscribe from events on a particular channel.
 * @function
 * @name IPubSubService#unsubscribe
 * @param {string} channelID - Channel from which we unsubscribe.
 */

/**
 * Disconnect from the Pusher service entirely.
 * It's invalid to take any further action on this object after disconnecting.
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
  subscribe(_channelID) {
    return new NullChannel();
  }

  unsubscribe(_channelID) {}

  disconnect() {}
}

/**
 * Wrapped Pusher.com API.
 * @implements IPubSubService
 */
class PusherService {
  constructor(applicationKey) {
    this.api_ = new Pusher(applicationKey, {encrypted: true});
  }

  subscribe(channelID) {
    return new PusherChannel(this.api_.subscribe(channelID));
  }

  unsubscribe(channelID) {
    this.api_.unsubscribe(channelID);
  }

  disconnect() {
    this.api_.disconnect();
    this.api_ = null;
  }
}
