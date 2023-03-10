import {Channel, NewChannel} from './types';
import * as channelsApi from './channelsApi';

export interface ChannelsStore {
  load: (key: string) => Promise<Channel | null>;

  create: (channel: Channel) => Promise<Response>;

  save: (channel: Channel) => Promise<Response>;
}

// TODO: comment about this being a mock/empty class implementation
export class LocalChannelsStore implements ChannelsStore {
  load(key: string) {
    return Promise.resolve(null);
  }

  create(channel: Channel) {
    return Promise.resolve(new Response());
  }

  save(channel: Channel) {
    return Promise.resolve(new Response());
  }
}

export class S3ChannelsStore implements ChannelsStore {
  newChannel: NewChannel = {name: 'New Project'};

  load(channelId: string) {
    return channelsApi.get(channelId);
  }

  create(channel: NewChannel = this.newChannel) {
    // TODO: implement queryParams
    return channelsApi.create(channel, '');
  }

  save(channel: Channel) {
    return channelsApi.update(channel);
  }
}
