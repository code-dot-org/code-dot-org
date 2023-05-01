/**
 * This file contains the ChannelsStore interface and the local (saved to browser local storage)
 * and remote (saved to the server) implementations of the ChannelStore.
 * A ChannelsStore manages the loading and saving of channels.
 */
import {Channel, DefaultChannel} from '../types';
import * as channelsApi from './channelsApi';
import * as projectsApi from './projectsApi';

export interface ChannelsStore {
  load: (key: string) => Promise<Response>;

  loadForLevel: (levelId: string) => Promise<Response>;

  save: (channel: Channel) => Promise<Response>;
}

// Note: This is a stubbed implementation of ChannelsStore because
// we currently don't have or need the concept of a channel for
// projects stored locally.
export class LocalChannelsStore implements ChannelsStore {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  load(_key: string) {
    return Promise.resolve(new Response('{}'));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadForLevel(_levelId: string) {
    return Promise.resolve(new Response('{}'));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  save(_channel: Channel) {
    return Promise.resolve(new Response(''));
  }
}

export class RemoteChannelsStore implements ChannelsStore {
  defaultChannel: DefaultChannel = {name: 'New Project'};

  loadForLevel(levelId: string) {
    return projectsApi.getForLevel(levelId);
  }

  load(channelId: string) {
    return channelsApi.get(channelId);
  }

  save(channel: Channel) {
    channel = {...this.defaultChannel, ...channel};
    return channelsApi.update(channel);
  }
}
