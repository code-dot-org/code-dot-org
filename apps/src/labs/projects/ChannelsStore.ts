/**
 * This file contains the ChannelsStore interface and the local (saved to browser local storage)
 * and remote (saved to the server) implementations of the ChannelStore.
 * A ChannelsStore manages the loading and saving of channels.
 */
import {Channel, DefaultChannel} from '../types';
import * as channelsApi from './channelsApi';

export interface ChannelsStore {
  load: (key: string) => Promise<Response>;

  save: (channel: Channel) => Promise<Response>;
}

// Note: This is a stubbed implementation of ChannelsStore because
// we currently don't have or need the concept of a channel for
// projects stored locally.
export class LocalChannelsStore implements ChannelsStore {
  load() {
    return Promise.resolve(new Response('{}'));
  }

  save() {
    return Promise.resolve(new Response(''));
  }
}

export class RemoteChannelsStore implements ChannelsStore {
  defaultChannel: DefaultChannel = {name: 'New Project'};

  load(channelId: string) {
    return channelsApi.get(channelId);
  }

  save(channel: Channel) {
    channel = {...this.defaultChannel, ...channel};
    return channelsApi.update(channel);
  }
}
