import {AppOptionsStore} from './AppOptionsStore';
import {S3ChannelsStore, LocalChannelsStore} from './ChannelsStore';
import ProjectManager from './ProjectManager';
import {S3SourcesStore, LocalSourcesStore} from './SourcesStore';
import {AppOptions, Project, ProjectManagerType} from './types';

export default class ProjectManagerFactory {
  static getProjectManager(
    projectManagerType: ProjectManagerType,
    appOptions: AppOptions,
    projectId: string,
    getProject: () => Project
  ) {
    if (projectManagerType === ProjectManagerType.LOCAL) {
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
        new S3SourcesStore(),
        new S3ChannelsStore(),
        new AppOptionsStore(appOptions),
        getProject
      );
    }
  }
}
