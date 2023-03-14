import {Source} from './types';
import * as sourcesApi from './sourcesApi';
const {getTabId} = require('@cdo/apps/utils');

export interface SourcesStore {
  load: (key: string) => Promise<Response>;

  save: (key: string, source: Source) => Promise<Response>;
}

export class LocalSourcesStore implements SourcesStore {
  load(key: string) {
    const source = {source: localStorage.getItem(key) || ''};
    const blob = new Blob([JSON.stringify(source, null, 2)], {
      type: 'application/json'
    });
    return Promise.resolve(new Response(blob));
  }

  save(key: string, source: Source) {
    localStorage.setItem(key, source.source.toString());
    return Promise.resolve(new Response());
  }
}

export class S3SourcesStore implements SourcesStore {
  private readonly newVersionInterval: number = 15 * 60 * 1000; // 15 minutes
  private currentVersionId: string | null = null;
  private firstSaveTime: string | null = null;
  private lastSaveTime: number | null = null;

  async load(channelId: string) {
    const response = await sourcesApi.get(channelId);

    if (response.ok) {
      this.currentVersionId = response.headers.get('S3-Version-Id');
      return response;
    } else {
      return new Response('');
    }
  }

  async save(channelId: string, source: Source, replace: boolean = false) {
    let options = undefined;
    if (this.currentVersionId) {
      options = {
        currentVersion: this.currentVersionId,
        replace: replace || this.shouldReplace(),
        firstSaveTimestamp: encodeURIComponent(this.firstSaveTime || ''),
        tabId: getTabId()
      };
    }
    const response = await sourcesApi.update(channelId, source, options);

    if (response.ok) {
      this.lastSaveTime = Date.now();
      const {timestamp, versionId} = await response.json();
      this.firstSaveTime = this.firstSaveTime || timestamp;
      this.currentVersionId = versionId;
    } else {
      // TODO: Log errors. Old implementation uses firehose
      // (logError_ in project.js); do we still want to use that?
      // See project.js lines 1120-1165
    }

    return response;
  }

  shouldReplace(): boolean {
    if (!this.lastSaveTime) {
      return false;
    }

    return this.lastSaveTime + this.newVersionInterval < Date.now();
  }
}
