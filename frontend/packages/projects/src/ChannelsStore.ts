/**
 * This file contains the ChannelsStore interface and the local (saved to browser local storage)
 * and remote (saved to the server) implementations of the ChannelStore.
 * A ChannelsStore manages the loading and saving of channels.
 */

import type {
  ApiClient,
  Channel,
  QueryClient,
} from '@code-dot-org/core/api';
import {channelsKeys, projectsKeys} from '@code-dot-org/core/api';

import type {DefaultChannel} from './types';

export class ChannelsStore {
  defaultChannel: DefaultChannel = {name: 'New Project'};

  loadForLevel(api: ApiClient, query: QueryClient, levelId: number, scriptId?: number, userId?: number) {
    return query.fetchQuery({
      queryKey: projectsKeys.channelForLevel({levelId, scriptId, userId}),
      queryFn: () =>
        api.projects.getChannelForLevel({
          levelId,
          scriptId,
          userId,
        }),
    });
  }

  load(api: ApiClient, query: QueryClient, channelId: string) {
    return query.fetchQuery({
      queryKey: channelsKeys.detail(channelId),
      queryFn: () =>
        api.channels.get({
          channelId,
        }),
    });
  }

  async save(api: ApiClient, query: QueryClient, channel: Channel) {
    channel = {...this.defaultChannel, ...channel};

    const response = await api.channels.update({
      channel,
    });

    query.invalidateQueries({
      queryKey: channelsKeys.detail(channel.id),
    });

    return response;
  }

  redirectToRemix(channel: Channel) {
    window.location.href = `/projects/${channel.projectType}/${channel.id}/remix`;
  }

  redirectToView(channel: Channel) {
    window.location.href = `/projects/${channel.projectType}/${channel.id}/view`;
  }

  async publish(api: ApiClient, query: QueryClient, channel: Channel) {
    const response = await api.channels.publish({
      channel,
    });

    query.invalidateQueries({
      queryKey: channelsKeys.detail(channel.id),
    });

    return response;
  }

  async unpublish(api: ApiClient, query: QueryClient, channel: Channel) {
    const response = await api.channels.unpublish({
      channel,
    });

    query.invalidateQueries({
      queryKey: channelsKeys.detail(channel.id),
    });

    return response;
  }

  getAbuseScore(api: ApiClient, query: QueryClient, channel: Channel) {
    return query.fetchQuery({
      queryKey: channelsKeys.abuseScore(channel.id),
      queryFn: () =>
        api.channels.fetchAbuseScore({
          channelId: channel.id,
        }),
    });
  }

  getSharingDisabled(api: ApiClient, query: QueryClient, channel: Channel) {
    return query.fetchQuery({
      queryKey: channelsKeys.sharingDisabled(channel.id),
      queryFn: () =>
        api.channels.fetchSharingDisabled({
          channelId: channel.id,
        }),
    });
  }

  getIsTeacherOfProjectOwner(api: ApiClient, query: QueryClient, channel: Channel) {
    return query.fetchQuery({
      queryKey: channelsKeys.isTeacherOfProjectOwner(channel.id),
      queryFn: () =>
        api.channels.fetchIsTeacherOfProjectOwner({
          channelId: channel.id,
        }),
    });
  }
}
