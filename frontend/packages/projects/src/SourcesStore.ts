import type {
  ApiClient,
  ProjectType,
  ProjectSources,
  SaveSourceOptions,
  UpdateSourceOptions,
} from '@code-dot-org/core/api';
import {getTabId} from '@code-dot-org/user';

/**
 * A SourcesStore manages the loading and saving of sources to the appropriate location.
 */
export class SourcesStore {
  private readonly newVersionInterval: number = 15 * 60 * 1000; // 15 minutes
  private currentVersionId: string | null = null;
  private firstSaveTime: string | null = null;
  private lastNewVersionTime: number | null = null;

  async load(api: ApiClient, channelId: string, versionId?: string) {
    const {sources, versionId: newVersionId} = await api.sources.get({
      channelId,
      versionId,
    });

    if (!versionId) {
      // Only store the current version id if we are loading the latest version.
      this.currentVersionId = newVersionId;
    }

    return sources;
  }

  async save(
    api: ApiClient,
    channelId: string,
    sources: ProjectSources,
    projectType?: ProjectType,
    forceNewVersion = false,
  ) {
    let options: SaveSourceOptions = {projectType};
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
      } as UpdateSourceOptions;
    }
    const {timestamp, versionId} = await api.sources.update({
      channelId,
      sources,
      options,
    });
    this.firstSaveTime = this.firstSaveTime || timestamp;
    this.currentVersionId = versionId;
  }

  async getVersionList(
    api: ApiClient,
    channelId: string,
    includeComments: boolean = false,
  ) {
    return api.sources.getVersionList({
      channelId,
      includeComments,
    });
  }

  async restore(api: ApiClient, channelId: string, versionId: string) {
    const body = await api.sources.restore({channelId, versionId});
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

  getCurrentVersionId(): string | null {
    return this.currentVersionId;
  }
}
