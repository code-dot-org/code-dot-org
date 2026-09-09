import HttpClient from '@cdo/apps/util/HttpClient';
import {createUuid} from '@cdo/apps/utils';
import {UniversalAppType} from '@cdo/generated-scripts/sharedConstants';

import BackpackClientApi from './BackpackClientApi';
import {
  BackpackEvent,
  BackpackEventListener,
  ErrorCallback,
  FileMetadata,
} from './types';

const UNIVERSAL_CHANNEL_URL = '/backpacks/channel';
const ALL_CHANNELS_URL = '/backpacks/channels';
const listFilesUrl = (channelIds: string[]) =>
  `/v3/libraries?channels=${channelIds.join(',')}`;

type ChannelIdsByAppType = {[appType: string]: string};
// A channel the server could not read comes back as null rather than a file list.
type FileListsByChannelId = {[channelId: string]: FileMetadata[] | null};

/**
 * Client for the unified backpack: a view over all the user's backpacks, including their
 * per-lab ones plus their universal backpack.
 * Writes go to the universal backpack. Reads and deletes name the backpack they
 * mean by app type, so files saved from a lab's original backpack stay usable while
 * labs move over to the universal one.
 *
 * Each backpack is driven by a BackpackClientApi built from an already-known
 * channel, except the universal one, which is created if it doesn't exist.
 */
export default class UnifiedBackpackClientApi {
  // Channel of the universal backpack.
  channelId: string | null;
  // Every backpack the user has, including the universal one.
  channelIdsByAppType: ChannelIdsByAppType;

  private clientsByAppType: {[appType: string]: BackpackClientApi};
  private eventListeners: {[id: string]: BackpackEventListener};

  constructor() {
    this.channelId = null;
    this.channelIdsByAppType = {};
    this.clientsByAppType = {};
    this.eventListeners = {};
  }

  hasBackpack() {
    return !!this.channelId;
  }

  // Get the universal backpack, creating it if the user does not have one yet, then
  // list every backpack they have. Fetching the universal backpack first ensures
  // it's included in the list.
  async fetchChannels() {
    const universalResponse = await HttpClient.fetchJson<{channel: string}>(
      UNIVERSAL_CHANNEL_URL
    );
    const universalChannelId = universalResponse.value.channel;

    const allChannelsResponse = await HttpClient.fetchJson<{
      channels: ChannelIdsByAppType;
    }>(ALL_CHANNELS_URL);
    this.channelIdsByAppType = allChannelsResponse.value.channels;
    this.channelId = universalChannelId;

    this.clientsByAppType = {};
    Object.entries(this.channelIdsByAppType).forEach(([appType, channelId]) => {
      const client = new BackpackClientApi(appType, channelId);
      client.addEventListener((event, filename) =>
        this.notifyListeners(event, filename)
      );
      this.clientsByAppType[appType] = client;
    });
  }

  // List the filenames in every backpack the user has, indexed by app type. An app
  // type whose backpack could not be read is left out of the result.
  // Unlike the callback-based methods, this reports a failure by rejecting.
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

  // Fetch a file from the given backpack, and return the file contents via callback
  // (or call onError on failure).
  async fetchFile(
    appType: string,
    filename: string,
    onError: ErrorCallback,
    onSuccess: (data: string) => void
  ) {
    const client = await this.clientForAppType(appType, onError);
    client?.fetchFile(filename, onError, onSuccess);
  }

  // Fetch a file from the given backpack, and return the full response object, or
  // false/Error if the fetch fails.
  async fetchFileResponse(appType: string, filename: string) {
    let channelError: Error | undefined;
    const client = await this.clientForAppType(appType, error => {
      channelError = error;
    });
    if (!client) {
      return channelError || false;
    }
    return client.fetchFileResponse(filename);
  }

  // Url of a file in the given backpack, or undefined if we have no such backpack.
  // Unlike the other reads this does not fetch channels first, so it is only useful
  // once they are loaded.
  getFileFetchUrl(appType: string, filename: string) {
    return this.clientsByAppType[appType]?.getFileFetchUrl(filename);
  }

  /**
   * Save a single file to the universal backpack.
   */
  async saveFile(
    filename: string,
    fileContents: string,
    onError: ErrorCallback,
    onSuccess: () => void
  ) {
    const client = await this.universalClient(onError);
    client?.saveFile(filename, fileContents, onError, onSuccess);
  }

  /**
   * Save a file to the universal backpack from the given URL.
   */
  async saveFileFromUrl(
    filename: string,
    fileUrl: string,
    onError?: ErrorCallback,
    onSuccess?: () => void
  ) {
    const client = await this.universalClient(onError);
    await client?.saveFileFromUrl(filename, fileUrl, onError, onSuccess);
  }

  async saveBlobFile(
    filename: string,
    contents: Blob,
    onError: ErrorCallback,
    onSuccess: () => void
  ) {
    const client = await this.universalClient(onError);
    await client?.saveBlobFile(filename, contents, onError, onSuccess);
  }

  /**
   * Delete files from the given backpack.
   * @param appType backpack to delete from
   * @param filenames files to delete
   * @param onError called if any file fails to delete
   * @param onSuccess called if all files are deleted
   */
  async deleteFiles(
    appType: string,
    filenames: string[],
    onError: ErrorCallback,
    onSuccess: () => void
  ) {
    const client = await this.clientForAppType(appType, onError);
    client?.deleteFiles(filenames, onError, onSuccess);
  }

  // Client for one of the user's backpacks. Like getFileFetchUrl, this does not fetch
  // channels first, so it is only useful once they are loaded.
  getClientForAppType(appType: string) {
    return this.clientsByAppType[appType];
  }

  addEventListener(listener: BackpackEventListener) {
    const id = createUuid();
    this.eventListeners[id] = listener;
    return id;
  }

  removeEventListener(id: string) {
    if (this.eventListeners[id]) {
      delete this.eventListeners[id];
    }
  }

  // Client for the universal backpack, where writes go.
  private universalClient(onError?: ErrorCallback) {
    return this.clientForAppType(UniversalAppType, onError);
  }

  // Client for one of the user's backpacks, fetching their channels if we have not
  // yet. Undefined when the user has no backpack for that app type, or when we could
  // not load their channels at all. Both cases reach onError, so a caller that passes
  // callbacks and never awaits still hears about a failed channel request; without a
  // callback the failure is rethrown rather than swallowed.
  private async clientForAppType(appType: string, onError?: ErrorCallback) {
    if (!this.channelId) {
      try {
        await this.fetchChannels();
      } catch (error) {
        if (!onError) {
          throw error;
        }
        onError(error as Error);
        return undefined;
      }
    }
    const client = this.clientsByAppType[appType];
    if (!client) {
      onError?.();
    }
    return client;
  }

  private notifyListeners(event: BackpackEvent, filename: string) {
    Object.values(this.eventListeners).forEach(listener =>
      listener(event, filename)
    );
  }
}
