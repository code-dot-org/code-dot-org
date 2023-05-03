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

// Note: We don't need to actually save a channel for local storage.
// However, we want to ensure we keep track of the original local storage
// key when switching levels, so we store it here.
export class LocalChannelsStore implements ChannelsStore {
  localStorageKey: string | undefined = undefined;

  load(key: string) {
    this.localStorageKey = key;
    return Promise.resolve(new Response('{}'));
  }

  loadForLevel() {
    return Promise.resolve(new Response(`{channel: ${this.localStorageKey}}`));
  }

  save() {
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
