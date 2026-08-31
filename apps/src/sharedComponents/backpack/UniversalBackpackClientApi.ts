import HttpClient from '@cdo/apps/util/HttpClient';

import {FileMetadata} from './types';

// App type the backend uses for the backpack that belongs to no lab.
export const UNIVERSAL_APP_TYPE = 'universal';

const UNIVERSAL_CHANNEL_URL = '/backpacks/channel';
const ALL_CHANNELS_URL = '/backpacks/channels';
const listFilesUrl = (channelIds: string[]) =>
  `/v3/libraries?channels=${channelIds.join(',')}`;

type ChannelIdsByAppType = {[appType: string]: string};
// A channel the server could not read comes back as null rather than a file list.
type FileListsByChannelId = {[channelId: string]: FileMetadata[] | null};

/**
 * Client for the universal backpack: the user's backpack that belongs to no lab.
 * Reads cover every backpack the user has, so files saved from a lab's own
 * backpack stay visible while labs move over to the universal one.
 */
export default class UniversalBackpackClientApi {
  // Channel of the universal backpack.
  channelId: string | null;
  // Every backpack the user has, including the universal one.
  channelIdsByAppType: ChannelIdsByAppType;

  constructor() {
    this.channelId = null;
    this.channelIdsByAppType = {};
  }

  hasBackpack() {
    return !!this.channelId;
  }

  // Get the universal backpack, creating it if the user does not have one yet, then
  // list every backpack they have. Fetching the universal backpack first is what puts
  // it in that list on a user's first visit.
  async fetchChannels() {
    const universalResponse = await HttpClient.fetchJson<{channel: string}>(
      UNIVERSAL_CHANNEL_URL
    );
    this.channelId = universalResponse.value.channel;

    const allChannelsResponse = await HttpClient.fetchJson<{
      channels: ChannelIdsByAppType;
    }>(ALL_CHANNELS_URL);
    this.channelIdsByAppType = allChannelsResponse.value.channels;
  }

  // List the filenames in every backpack the user has, indexed by app type. An app
  // type whose backpack could not be read is left out of the result.
  async getFileLists(): Promise<{[appType: string]: string[]}> {
    if (!this.channelId) {
      await this.fetchChannels();
    }

    const appTypes = Object.keys(this.channelIdsByAppType);
    if (appTypes.length === 0) {
      return {};
    }

    const response = await HttpClient.fetchJson<FileListsByChannelId>(
      listFilesUrl(appTypes.map(appType => this.channelIdsByAppType[appType]))
    );

    const filenamesByAppType: {[appType: string]: string[]} = {};
    appTypes.forEach(appType => {
      const files = response.value[this.channelIdsByAppType[appType]];
      if (files) {
        filenamesByAppType[appType] = files.map(file => file.filename);
      }
    });
    return filenamesByAppType;
  }
}
