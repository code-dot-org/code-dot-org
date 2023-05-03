/**
 * This factory creates a project manager for the given storage type.
 * The factory handles setup of the sources and channels stores
 * for the given type.
 */

import {RemoteChannelsStore, LocalChannelsStore} from './ChannelsStore';
import ProjectManager from './ProjectManager';
import {RemoteSourcesStore, LocalSourcesStore} from './SourcesStore';
import {Project, ProjectManagerStorageType} from '../types';

export default class ProjectManagerFactory {
  /**
   * @param projectManagerStorageType The storage type for the project manager
   * @param getProject A method which returns the project sources and channel.
   * @param projectId The identifier for the project. This parameter is optional, as
   * the projectId can be determined later based on levelId.
   * @returns A project manager for the given storage type.
   */
  static getProjectManager(
    projectManagerStorageType: ProjectManagerStorageType,
    getProject: () => Project,
    projectId?: string
  ) {
    if (projectManagerStorageType === ProjectManagerStorageType.LOCAL) {
      return new ProjectManager(
        new LocalSourcesStore(),
        new LocalChannelsStore(),
        getProject,
        projectId
      );
    } else {
      return new ProjectManager(
        new RemoteSourcesStore(),
        new RemoteChannelsStore(),
        getProject,
        projectId
      );
    }
  }
}
