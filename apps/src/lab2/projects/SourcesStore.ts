/**
 * This file contains the SourcesStore interface and the local (saved to browser local storage)
 * and remote (saved to the server) implementations of the SourcesStore.
 * A SourcesStore manages the loading and saving of sources to the appropriate location.
 */
import {NetworkError} from '@cdo/apps/util/HttpClient';

import {
  ProjectSources,
  ProjectType,
  ProjectVersion,
  SaveSourceOptions,
  UpdateSourceOptions,
} from '../types';

import * as sourcesApi from './sourcesApi';

const {getTabId} = require('@cdo/apps/utils');

export interface SourcesStore {
  load: (key: string, versionId?: string) => Promise<ProjectSources>;

  save: (
    key: string,
    sources: ProjectSources,
    appType?: ProjectType
  ) => Promise<Response>;

  getVersionList: (key: string) => Promise<ProjectVersion[]>;

  restore: (key: string, versionId: string) => Promise<void>;
}

export class LocalSourcesStore implements SourcesStore {
  load(key: string) {
    const source = {source: localStorage.getItem(key) || ''};
    return Promise.resolve(source);
  }

  save(key: string, sources: ProjectSources) {
    localStorage.setItem(key, JSON.stringify(sources));
    return Promise.resolve(new Response());
  }

  getVersionList(key: string) {
    return Promise.resolve([]);
  }

  restore() {
    return Promise.resolve();
  }
}

export class RemoteSourcesStore implements SourcesStore {
  private readonly newVersionInterval: number = 15 * 60 * 1000; // 15 minutes
  private currentVersionId: string | null = null;
  private firstSaveTime: string | null = null;
  private lastNewVersionTime: number | null = null;

  async load(channelId: string, versionId?: string) {
    const {response, value} = await sourcesApi.get(channelId, versionId);

    if (response.ok && !versionId) {
      // Only store the current version id if we are loading the latest version.
      this.currentVersionId = response.headers.get('S3-Version-Id');
    }

    return value;
  }

  async save(
    channelId: string,
    sources: ProjectSources,
    projectType?: ProjectType,
    forceNewVersion = false
  ) {
    let options: SaveSourceOptions | UpdateSourceOptions = {projectType};
    if (this.currentVersionId) {
      // If forceNewVersion is set to true, we will not replace the existing version (i.e., we will create
      // a new version). Otherwise we check if we should replace the existing version based on the last new
      // version saved in this session.
      const replaceExistingVersion =
        !forceNewVersion && this.shouldReplaceExistingVersion();
      if (!replaceExistingVersion) {
        // If we're are creating a new version, update the last new version time.
        this.lastNewVersionTime = Date.now();
      }
      options = {
        ...options,
        currentVersion: this.currentVersionId,
        replace: replaceExistingVersion,
        firstSaveTimestamp: encodeURIComponent(this.firstSaveTime || ''),
        tabId: getTabId(),
      };
    }
    const response = await sourcesApi.update(channelId, sources, options);

    if (response.ok) {
      const {timestamp, versionId} = await response.json();
      this.firstSaveTime = this.firstSaveTime || timestamp;
      this.currentVersionId = versionId;
    } else {
      throw new NetworkError(
        response.status + ' ' + response.statusText,
        response
      );
    }
    return response;
  }

  async getVersionList(channelId: string) {
    const response = await sourcesApi.getVersionList(channelId);
    return response.value || [];
  }

  async restore(channelId: string, versionId: string) {
    const response = await sourcesApi.restore(channelId, versionId);
    const body = await response.json();
    if (body?.version_id) {
      this.currentVersionId = body.version_id;
    }
    this.lastNewVersionTime = Date.now();
  }

  shouldReplaceExistingVersion(): boolean {
    if (!this.lastNewVersionTime) {
      return false;
    }

    // We should replace the existing version if the last new version was less than 15 minutes ago
    // (the last new version time plus the interval is greater than the current time).
    return this.lastNewVersionTime + this.newVersionInterval > Date.now();
  }
}
