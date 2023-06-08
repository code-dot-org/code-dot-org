/**
 * This file contains the SourcesStore interface and the local (saved to broswer local storage)
 * and remote (saved to the server) implementations of the SourcesStore.
 * A SourcesStore manages the loading and saving of sources to the appropriate location.
 */
import MetricsReporter from '@cdo/apps/lib/metrics/MetricsReporter';
import {Source, SourceResponse} from '../types';
import * as sourcesApi from './sourcesApi';
const {getTabId} = require('@cdo/apps/utils');

export interface SourcesStore {
  load: (key: string) => Promise<SourceResponse>;

  save: (key: string, source: Source) => Promise<void>;
}

export class LocalSourcesStore implements SourcesStore {
  load(key: string) {
    const source = {source: localStorage.getItem(key) || ''};
    // Hack to make compilation succeed. LocalSourcesStore should be removed soon.
    return Promise.resolve(source as unknown as SourceResponse);
  }

  save(key: string, source: Source) {
    localStorage.setItem(key, JSON.stringify(source));
    return Promise.resolve();
  }
}

export class RemoteSourcesStore implements SourcesStore {
  private readonly newVersionInterval: number = 15 * 60 * 1000; // 15 minutes
  private currentVersionId: string | null = null;
  private firstSaveTime: string | null = null;
  private lastSaveTime: number | null = null;

  async load(channelId: string) {
    const getResponse = await sourcesApi.get(channelId);

    if (getResponse.response.ok) {
      this.currentVersionId = getResponse.response.headers.get('S3-Version-Id');
    }

    return getResponse.value;
  }

  async save(channelId: string, source: Source, replace = false) {
    let options = undefined;
    if (this.currentVersionId) {
      options = {
        currentVersion: this.currentVersionId,
        replace: replace || this.shouldReplace(),
        firstSaveTimestamp: encodeURIComponent(this.firstSaveTime || ''),
        tabId: getTabId(),
      };
    }
    const response = await sourcesApi.update(channelId, source, options);

    if (response.ok) {
      this.lastSaveTime = Date.now();
      const {timestamp, versionId} = await response.json();
      this.firstSaveTime = this.firstSaveTime || timestamp;
      this.currentVersionId = versionId;
    } else {
      MetricsReporter.logError({
        message: 'Error saving sources',
        status: response.status,
        statusText: response.statusText,
        channelId,
      });
      throw new Error(response.status + ' ' + response.statusText);
    }
  }

  shouldReplace(): boolean {
    if (!this.lastSaveTime) {
      return false;
    }

    return this.lastSaveTime + this.newVersionInterval < Date.now();
  }
}
