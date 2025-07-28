/**
 * This file contains the ChannelsStore interface and the local (saved to browser local storage)
 * and remote (saved to the server) implementations of the ChannelStore.
 * A ChannelsStore manages the loading and saving of channels.
 */
import {Channel, DefaultChannel} from '../types';

import * as channelsApi from './channelsApi';
import * as projectsApi from './projectsApi';

export class ChannelsStore {
  defaultChannel: DefaultChannel = {name: 'New Project'};

  loadForLevel(
    levelId: number,
    scriptId?: number,
    scriptLevelId?: string,
    userId?: number
  ) {
    return projectsApi.getChannelForLevel(
      levelId,
      scriptId,
      scriptLevelId,
      userId
    );
  }

  load(channelId: string) {
    return channelsApi.get(channelId);
  }

  save(channel: Channel) {
    channel = {...this.defaultChannel, ...channel};
    return channelsApi.update(channel);
  }

  redirectToRemix(channel: Channel) {
    projectsApi.redirectToRemix(channel.id, channel.projectType);
  }

  redirectToView(channel: Channel) {
    projectsApi.redirectToView(channel.id, channel.projectType);
  }

  publish(channel: Channel) {
    return channelsApi.publish(channel);
  }

  unpublish(channel: Channel) {
    return channelsApi.unpublish(channel);
  }

  getAbuseScore(channel: Channel) {
    return channelsApi.fetchAbuseScore(channel.id);
  }

  getSharingDisabled(channel: Channel) {
    return channelsApi.fetchSharingDisabled(channel.id);
  }
}
