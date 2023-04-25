/**
 * This factory creates a project manager for the given storage type.
 * The factory handles setup of the sources, channels, and app options stores
 * for the given type.
 */

import {AppOptionsStore} from '../AppOptionsStore';
import {RemoteChannelsStore, LocalChannelsStore} from './ChannelsStore';
import ProjectManager from './ProjectManager';
import {RemoteSourcesStore, LocalSourcesStore} from './SourcesStore';
import {AppOptions, Project, ProjectManagerStorageType} from '../types';

export default class ProjectManagerFactory {
  /**
   * @param projectManagerStorageType The storage type for the project manager
   * @param appOptions The app options for the level.
   * @param projectId The identifier for the project.
   * @param getProject A method which returns the project sources and channel.
   * @returns A project manager for the given storage type.
   */
  static getProjectManager(
    projectManagerStorageType: ProjectManagerStorageType,
    appOptions: AppOptions,
    projectId: string,
    getProject: () => Project
  ) {
    if (projectManagerStorageType === ProjectManagerStorageType.LOCAL) {
      return new ProjectManager(
        projectId,
        new LocalSourcesStore(),
        new LocalChannelsStore(),
        new AppOptionsStore(appOptions),
        getProject
      );
    } else {
      return new ProjectManager(
        projectId,
        new RemoteSourcesStore(),
        new RemoteChannelsStore(),
        new AppOptionsStore(appOptions),
        getProject
      );
    }
  }
}
