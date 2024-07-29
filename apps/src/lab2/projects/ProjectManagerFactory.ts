/**
 * This factory creates a project manager for the given storage type.
 * The factory handles setup of the sources and channels stores
 * for the given type.
 */

import {ProjectManagerStorageType} from '../types';

import {RemoteChannelsStore, LocalChannelsStore} from './ChannelsStore';
import ProjectManager from './ProjectManager';
import {RemoteSourcesStore, LocalSourcesStore} from './SourcesStore';

export default class ProjectManagerFactory {
  /**
   * Get a project manager for a specific storage type and project identitifer.
   * @param projectManagerStorageType The storage type for the project manager
   * @param projectId The identifier for the project.
   * @returns A project manager
   */
  static getProjectManager(
    projectManagerStorageType: ProjectManagerStorageType,
    projectId: string
  ): ProjectManager {
    return new ProjectManager(
      this.getSourcesStore(projectManagerStorageType),
      this.getChannelsStore(projectManagerStorageType),
      projectId,
      false // reduceChannelUpdates will only be true for a project in a script.
    );
  }

  /**
   * Get a project manager for a storage type and level/script identifier (script can be undefined).
   * Fetches the channel for that level and script first, and is therefore asynchronous and could
   * throw an error if the channel request fails.
   * @param projectManagerStorageType The storage type for the project manager.
   * @param levelId The identifier for the level.
   * @param userId The user ID of the creator.  Can be undefined if the user is looking at their own work.
   * @param scriptId The id of the script. Can be undefined if the level is not in the context of a script.
   * @param scriptLevelId the ID of the script level (if different from the level ID). Can be undefined if the level is not in the context of a script.
   * @returns A project manager
   */
  static async getProjectManagerForLevel(
    projectManagerStorageType: ProjectManagerStorageType,
    levelId: number,
    userId?: number,
    scriptId?: number,
    scriptLevelId?: string
  ): Promise<ProjectManager | null> {
    const channelsStore = this.getChannelsStore(projectManagerStorageType);
    let channelId: string | undefined = undefined;
    let reduceChannelUpdates = false;
    const response = await channelsStore.loadForLevel(
      levelId,
      scriptId,
      scriptLevelId,
      userId
    );
    if (response.ok) {
      const responseBody = await response.json();
      if (responseBody && responseBody.channel) {
        channelId = responseBody.channel;
        reduceChannelUpdates = responseBody.reduceChannelUpdates;
      } else if (responseBody && responseBody.started === false) {
        // A teacher is attenpting to view a student's work, but the student has not yet started.
        return null;
      }
    }
    if (!channelId) {
      throw new Error('Could not load channel for level');
    }
    return new ProjectManager(
      this.getSourcesStore(projectManagerStorageType),
      channelsStore,
      channelId,
      reduceChannelUpdates
    );
  }

  static getSourcesStore(projectManagerStorageType: ProjectManagerStorageType) {
    if (projectManagerStorageType === ProjectManagerStorageType.LOCAL) {
      return new LocalSourcesStore();
    } else {
      return new RemoteSourcesStore();
    }
  }

  static getChannelsStore(
    projectManagerStorageType: ProjectManagerStorageType
  ) {
    if (projectManagerStorageType === ProjectManagerStorageType.LOCAL) {
      return new LocalChannelsStore();
    } else {
      return new RemoteChannelsStore();
    }
  }
}
