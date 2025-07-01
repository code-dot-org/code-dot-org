/**
 * This factory creates a project manager for the given storage type.
 * The factory handles setup of the sources and channels stores
 * for the given type.
 */

import {ChannelsStore} from './ChannelsStore';
import ProjectManager from './ProjectManager';
import {SourcesStore} from './SourcesStore';

export default class ProjectManagerFactory {
  /**
   * Get a project manager for a project identitifer.
   * @param projectId The identifier for the project.
   * @param isShareView Project is in share view mode.
   * @returns A project manager
   */
  static getProjectManager(
    projectId: string,
    isShareView: boolean = false
  ): ProjectManager {
    return new ProjectManager({
      sourcesStore: new SourcesStore(),
      channelsStore: new ChannelsStore(),
      channelId: projectId,
      reduceChannelUpdates: false,
      isShareView,
    });
  }

  /**
   * Get a project manager for a storage type and level/script identifier (script can be undefined).
   * Fetches the channel for that level and script first, and is therefore asynchronous and could
   * throw an error if the channel request fails.
   * @param levelId The identifier for the level.
   * @param userId The user ID of the creator.  Can be undefined if the user is looking at their own work.
   * @param scriptId The id of the script. Can be undefined if the level is not in the context of a script.
   * @param scriptLevelId the ID of the script level (if different from the level ID). Can be undefined if the level is not in the context of a script.
   * @returns A project manager
   */
  static async getProjectManagerForLevel(
    levelId: number,
    userId?: number,
    scriptId?: number,
    scriptLevelId?: string
  ): Promise<ProjectManager | null> {
    const channelsStore = new ChannelsStore();
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
    return new ProjectManager({
      sourcesStore: new SourcesStore(),
      channelsStore,
      channelId,
      reduceChannelUpdates,
    });
  }
}
